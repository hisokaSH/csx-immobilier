'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input } from '@/components/ui';
import { LogOut, Save } from 'lucide-react';

interface SettingsFormProps {
  initialData: {
    full_name: string;
    email: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [fullName, setFullName] = useState(initialData.full_name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Email"
          value={initialData.email}
          disabled
          hint="Email cannot be changed"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-surface-100">
        <Button
          variant="danger"
          onClick={handleLogout}
          loading={loggingOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-emerald-600">Saved!</span>
          )}
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
