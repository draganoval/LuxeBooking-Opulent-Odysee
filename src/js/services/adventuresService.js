import { supabase } from '../supabaseClient.js';

export async function getAdventures() {
  try {
    const { data, error } = await supabase
      .from('adventures')
      .select('id,title,content,author_name,created_at,image_url')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
