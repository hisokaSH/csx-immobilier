import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// ============================================
// LISTINGS
// ============================================

export function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return { listings, loading, error, refetch: fetchListings };
}

export async function getListing(id) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function createListing(listing) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('listings')
    .insert([{ ...listing, user_id: user.id }])
    .select()
    .single();

  return { data, error };
}

export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteListing(id) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  return { error };
}

// ============================================
// LEADS
// ============================================

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        listing:listings(id, title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return { leads, loading, error, refetch: fetchLeads };
}

export async function createLead(lead) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...lead, user_id: user.id }])
    .select()
    .single();

  return { data, error };
}

export async function updateLead(id, updates) {
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteLead(id) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  return { error };
}

// ============================================
// PROFILE
// ============================================

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      setError(error.message);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}

export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id,
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .select()
    .single();

  return { data, error };
}

// ============================================
// PLATFORM CONNECTIONS
// ============================================

export function usePlatformConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .order('platform', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setConnections(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return { connections, loading, error, refetch: fetchConnections };
}

export async function updatePlatformConnection(platform, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('platform_connections')
    .upsert({
      user_id: user.id,
      platform,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { data: null, error: 'Not authenticated' };

  // Get listings count and stats
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, status, views, created_at')
    .eq('user_id', user.id);

  if (listingsError) return { data: null, error: listingsError.message };

  // Get leads count
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, status, created_at')
    .eq('user_id', user.id);

  if (leadsError) return { data: null, error: leadsError.message };

  // Calculate stats
  const totalListings = listings?.length || 0;
  const activeListings = listings?.filter(l => l.status === 'active').length || 0;
  const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === 'new').length || 0;

  // Recent listings (last 5)
  const recentListings = listings?.slice(0, 5) || [];

  // Recent leads (last 5)
  const recentLeads = leads?.slice(0, 5) || [];

  return {
    data: {
      totalListings,
      activeListings,
      totalViews,
      totalLeads,
      newLeads,
      recentListings,
      recentLeads,
    },
    error: null
  };
}

// ============================================
// PUBLISH TO PLATFORMS
// ============================================

export async function publishToPlatforms(listingId, platforms) {
  try {
    const { data, error } = await supabase.functions.invoke('publish-to-platforms', {
      body: { listingId, platforms }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message || 'Publication failed' };
  }
}

export async function getConnectedPlatforms() {
  const { data, error } = await supabase
    .from('platform_connections')
    .select('platform, status, metadata')
    .eq('status', 'connected');

  return { data: data || [], error };
}
