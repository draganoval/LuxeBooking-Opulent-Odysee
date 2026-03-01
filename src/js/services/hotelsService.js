import { supabase } from '../supabaseClient.js';

export async function getHotels() {
  try {
    const { data, error } = await supabase
      .from('hotels')
      .select('id,name,destination,description')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}