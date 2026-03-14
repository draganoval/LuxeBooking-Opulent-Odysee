import { supabase } from '../supabaseClient.js'

const BUCKET = 'uploads'

function buildImagePath(folder, file) {
  const originalName = String(file?.name ?? 'image').trim()
  const extension = originalName.includes('.')
    ? originalName.split('.').pop().toLowerCase()
    : 'jpg'
  const uniquePart = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`
  return `${folder}/${Date.now()}_${uniquePart}.${extension}`
}

async function uploadImage(file, folder) {
  try {
    if (!file) {
      return {
        data: null,
        error: new Error('Image file is required.')
      }
    }

    if (!String(file.type || '').startsWith('image/')) {
      return {
        data: null,
        error: new Error('Only image files are allowed.')
      }
    }

    const path = buildImagePath(folder, file)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file)

    if (uploadError) {
      return {
        data: null,
        error: uploadError
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
      data: {
        path,
        publicUrl: data.publicUrl
      },
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error
    }
  }
}

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

export async function uploadHotelImage(file) {
  return uploadImage(file, 'hotels')
}

export async function uploadDestinationImage(file) {
  return uploadImage(file, 'destinations')
}

export async function uploadAdventureImage(file) {
  return uploadImage(file, 'adventures')
}
