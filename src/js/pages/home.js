import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Supabase client available:', !!supabase);
  initHeader('home');
  initFooter();
});
