import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Determine plan from price ID
        let plan = "starter";
        const priceStarter = Deno.env.get("STRIPE_PRICE_STARTER");
        const pricePro = Deno.env.get("STRIPE_PRICE_PRO");
        const priceAgence = Deno.env.get("STRIPE_PRICE_AGENCE");

        if (priceId === pricePro) plan = "pro";
        else if (priceId === priceAgence) plan = "agence";

        // Update profile with subscription info
        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            subscription_plan: plan,
            subscription_id: subscriptionId,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription activated: ${plan} for customer ${customerId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        let plan = "starter";
        const priceStarter = Deno.env.get("STRIPE_PRICE_STARTER");
        const pricePro = Deno.env.get("STRIPE_PRICE_PRO");
        const priceAgence = Deno.env.get("STRIPE_PRICE_AGENCE");

        if (priceId === pricePro) plan = "pro";
        else if (priceId === priceAgence) plan = "agence";

        const status = subscription.status === "active" || subscription.status === "trialing" 
          ? "active" 
          : subscription.status;

        await supabase
          .from("profiles")
          .update({
            subscription_status: status,
            subscription_plan: plan,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription updated: ${plan} (${status}) for customer ${customerId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            subscription_plan: null,
            subscription_id: null,
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Subscription canceled for customer ${customerId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);

        console.log(`Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});
