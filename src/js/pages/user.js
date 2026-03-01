import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAuth } from '../auth/guards.js';

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAuth();
  if (!isAuthorized) {
    return;
  }

  initHeader('user');
  initFooter();
});
