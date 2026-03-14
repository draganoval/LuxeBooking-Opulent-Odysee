import { supabase } from '../supabaseClient.js';

function isMissingImageColumnError(error) {
  const message = String(error?.message ?? '').toLowerCase();
  return message.includes('image_url') && message.includes('does not exist');
}

export async function getAdventures() {
  try {
    const { data, error } = await supabase
      .from('adventures')
      .select('id,title,content,author_name,created_at,image_url')
      .order('created_at', { ascending: false });

    if (error && isMissingImageColumnError(error)) {
      const fallbackResult = await supabase
        .from('adventures')
        .select('id,title,content,author_name,created_at')
        .order('created_at', { ascending: false });

      if (fallbackResult.error) {
        return { data: null, error: fallbackResult.error };
      }

      const normalizedData = (fallbackResult.data ?? []).map((item) => ({
        ...item,
        image_url: null
      }));

      return { data: normalizedData, error: null };
    }

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createAdventure(payload) {
  try {
    const title = String(payload?.title ?? '').trim();
    const author_name = String(payload?.author_name ?? '').trim();
    const content = String(payload?.content ?? '').trim();
    const image_url = String(payload?.image_url ?? '').trim();

    if (!title || !content) {
      return { data: null, error: new Error('Title and content are required.') };
    }

    const basePayload = {
      title,
      author_name: author_name || null,
      content
    };

    const insertWithImage = await supabase
      .from('adventures')
      .insert({
        ...basePayload,
        image_url: image_url || null
      })
      .select('id,title,content,author_name,created_at,image_url')
      .maybeSingle();

    if (insertWithImage.error && isMissingImageColumnError(insertWithImage.error)) {
      const fallbackInsert = await supabase
        .from('adventures')
        .insert(basePayload)
        .select('id,title,content,author_name,created_at')
        .maybeSingle();

      if (fallbackInsert.error) {
        return { data: null, error: fallbackInsert.error };
      }

      return {
        data: fallbackInsert.data ? { ...fallbackInsert.data, image_url: null } : null,
        error: null
      };
    }

    if (insertWithImage.error) {
      return { data: null, error: insertWithImage.error };
    }

    return { data: insertWithImage.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateAdventure(adventureId, payload) {
  try {
    if (!adventureId) {
      return { data: null, error: new Error('Adventure ID is required.') };
    }

    const title = String(payload?.title ?? '').trim();
    const author_name = String(payload?.author_name ?? '').trim();
    const content = String(payload?.content ?? '').trim();
    const image_url = String(payload?.image_url ?? '').trim();

    if (!title || !content) {
      return { data: null, error: new Error('Title and content are required.') };
    }

    const basePayload = {
      title,
      author_name: author_name || null,
      content
    };

    const updateWithImage = await supabase
      .from('adventures')
      .update({
        ...basePayload,
        image_url: image_url || null
      })
      .eq('id', adventureId)
      .select('id,title,content,author_name,created_at,image_url')
      .maybeSingle();

    if (updateWithImage.error && isMissingImageColumnError(updateWithImage.error)) {
      const fallbackUpdate = await supabase
        .from('adventures')
        .update(basePayload)
        .eq('id', adventureId)
        .select('id,title,content,author_name,created_at')
        .maybeSingle();

      if (fallbackUpdate.error) {
        return { data: null, error: fallbackUpdate.error };
      }

      if (!fallbackUpdate.data) {
        return { data: null, error: new Error('Adventure not found.') };
      }

      return {
        data: { ...fallbackUpdate.data, image_url: null },
        error: null
      };
    }

    if (updateWithImage.error) {
      return { data: null, error: updateWithImage.error };
    }

    if (!updateWithImage.data) {
      return { data: null, error: new Error('Adventure not found.') };
    }

    return { data: updateWithImage.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteAdventure(adventureId) {
  try {
    if (!adventureId) {
      return { data: null, error: new Error('Adventure ID is required.') };
    }

    const { error } = await supabase
      .from('adventures')
      .delete()
      .eq('id', adventureId);

    if (error) {
      return { data: null, error };
    }

    return { data: { id: adventureId }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
