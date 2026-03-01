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

export async function createHotel(payload) {
  try {
    const { name, destination, description } = payload ?? {};

    if (!name || !destination) {
      return { data: null, error: new Error('Name and destination are required.') };
    }

    const { data, error } = await supabase
      .from('hotels')
      .insert({
        name,
        destination,
        description: description ?? ''
      })
      .select('id,name,destination,description')
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteHotelById(hotelId) {
  try {
    if (!hotelId) {
      return { data: null, error: new Error('Hotel ID is required.') };
    }

    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', hotelId);

    if (error) {
      return { data: null, error };
    }

    return { data: { id: hotelId }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}