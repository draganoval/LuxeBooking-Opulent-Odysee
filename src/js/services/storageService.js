import { supabase } from '../supabaseClient.js'

const BUCKET = 'uploads'

export async function uploadBookingAttachment(file, userId) {
  try {
    if (!file) {
      return {
        data: null,
        error: new Error('File is required.')
      }
    }

    if (!userId) {
      return {
        data: null,
        error: new Error('User ID is required.')
      }
    }

    const safeFileName = `${Date.now()}_${file.name}`
    const path = `bookings/${userId}/${safeFileName}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file)

    if (error) {
      return {
        data: null,
        error
      }
    }

    return {
      data: { path },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error
    }
  }
}

export function getPublicUrl(path) {
  try {
    if (!path) {
      return {
        data: null,
        error: new Error('Path is required.')
      }
    }

    const { data, error } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    if (error) {
      return {
        data: null,
        error
      }
    }

    return {
      data: { publicUrl: data.publicUrl },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error
    }
  }
}
