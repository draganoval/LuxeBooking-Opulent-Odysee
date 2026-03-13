import { supabase } from '../supabaseClient.js';

export async function getDestinations() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id,name,country,description,image_url')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createDestination(payload) {
  try {
    const { name, country, description, image_url } = payload ?? {};

    if (!name || !country) {
      return { data: null, error: new Error('Name and location are required.') };
    }

    const { data, error } = await supabase
      .from('destinations')
      .insert({
        name,
        country,
        description: description ?? '',
        image_url: image_url ?? null
      })
      .select('id,name,country,description,image_url')
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateDestinationById(destinationId, payload) {
  try {
    const { name, country, description, image_url } = payload ?? {};

    if (!destinationId) {
      return { data: null, error: new Error('Destination ID is required.') };
    }

    if (!name || !country) {
      return { data: null, error: new Error('Name and location are required.') };
    }

    const { data, error } = await supabase
      .from('destinations')
      .update({
        name,
        country,
        description: description ?? '',
        image_url: image_url ?? null
      })
      .eq('id', destinationId)
      .select('id,name,country,description,image_url')
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error('Destination not found.') };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteDestinationById(destinationId) {
  try {
    if (!destinationId) {
      return { data: null, error: new Error('Destination ID is required.') };
    }

    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', destinationId);

    if (error) {
      return { data: null, error };
    }

    return { data: { id: destinationId }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}