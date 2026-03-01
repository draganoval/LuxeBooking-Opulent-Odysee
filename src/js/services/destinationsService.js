import { supabase } from '../supabaseClient.js';

export async function getDestinations() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id,name,country,description')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}