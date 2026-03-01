import { supabase } from '../supabaseClient.js';

export async function getBookingsByUserId(userId) {
  try {
    if (!userId) {
      return { data: null, error: new Error('User ID is required.') };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('id,start_date,end_date,guests,status,attachment_path,hotels(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function cancelBookingById(bookingId, userId) {
  try {
    if (!bookingId || !userId) {
      return { data: null, error: new Error('Booking ID and user ID are required.') };
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error('Booking not found.') };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getAllBookingsForAdmin() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id,start_date,end_date,guests,status,hotel_id,user_id,hotels(name),profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateBookingStatusById(bookingId, status) {
  try {
    if (!bookingId || !status) {
      return { data: null, error: new Error('Booking ID and status are required.') };
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('id,status')
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    if (!data) {
      return { data: null, error: new Error('Booking not found.') };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
