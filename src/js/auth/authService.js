import { supabase } from '../supabaseClient.js'

export async function ensureProfile() {
  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      return { data: null, error: userError }
    }

    if (!user) {
      return { data: null, error: null }
    }

    const payload = {
      id: user.id,
      email: user.email ?? null
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function registerUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      return { data: null, error }
    }

    const profileResult = await ensureProfile()

    if (profileResult.error) {
      return { data: null, error: profileResult.error }
    }

    return {
      data: {
        ...data,
        profile: profileResult.data
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { data: null, error }
    }

    const profileResult = await ensureProfile()

    if (profileResult.error) {
      return { data: null, error: profileResult.error }
    }

    return {
      data: {
        ...data,
        profile: profileResult.data
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export async function logoutUser() {
  try {
    const { data, error } = await supabase.auth.signOut()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}
