import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAdmin } from '../auth/guards.js';

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAdmin();
  if (!isAuthorized) {
    return;
  }

  initHeader('admin');
  initFooter();
});
