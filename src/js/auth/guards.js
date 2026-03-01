import { supabase } from '../supabaseClient.js';

function getCurrentPage() {
  const path = window.location.pathname.replace(/\/+$/, '');
  const page = path.split('/').pop();
  return page || 'index.html';
}

export async function requireAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;

    if (error || !session) {
      const next = encodeURIComponent(getCurrentPage());
      window.location.href = `./login.html?next=${next}`;
      return false;
    }

    return true;
  } catch {
    const next = encodeURIComponent(getCurrentPage());
    window.location.href = `./login.html?next=${next}`;
    return false;
  }
}

export async function requireAdmin() {
  try {
    const { data, error } = await supabase.auth.getSession();
    const session = data?.session;

    if (error || !session?.user?.id) {
      const next = encodeURIComponent(getCurrentPage());
      window.location.href = `./login.html?next=${next}`;
      return false;
    }

    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleRow) {
      window.location.href = './index.html';
      return false;
    }

    return true;
  } catch {
    const next = encodeURIComponent(getCurrentPage());
    window.location.href = `./login.html?next=${next}`;
    return false;
  }
}
