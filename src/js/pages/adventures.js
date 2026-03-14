import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { getAdventures } from '../services/adventuresService.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString();
}

function truncateContent(value) {
  const content = String(value ?? '').trim();
  if (!content) {
    return 'No content available.';
  }

  const previewLength = 240;

  if (content.length <= previewLength) {
    return content;
  }

  return `${content.slice(0, previewLength)}...`;
}

function renderFeed(mainElement, adventures) {
  const cards = adventures
    .map((adventure) => {
      const title = escapeHtml(adventure.title || 'Untitled Adventure');
      const author = adventure.author_name ? `By ${escapeHtml(adventure.author_name)}` : 'By Unknown author';
      const createdAt = escapeHtml(formatDate(adventure.created_at));
      const preview = escapeHtml(truncateContent(adventure.content));
      const imageMarkup = adventure.image_url
        ? `<img src="${escapeHtml(adventure.image_url)}" class="img-fluid w-100 h-100" alt="${title}" style="min-height: 220px; max-height: 300px; object-fit: cover;" />`
        : `<div class="bg-light border d-flex align-items-center justify-content-center h-100" style="min-height: 220px; max-height: 300px;"><span class="text-muted">Adventure Image</span></div>`;

      return `
        <article class="card border-0 shadow-sm mb-4 overflow-hidden">
          <div class="row g-0">
            <div class="col-12 col-lg-5">
              ${imageMarkup}
            </div>
            <div class="col-12 col-lg-7">
              <div class="card-body p-4 p-lg-5">
                <h2 class="h4 card-title mb-3">${title}</h2>
                <p class="small text-muted mb-3">${author} · ${createdAt}</p>
                <p class="card-text mb-0 lh-lg">${preview}</p>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  mainElement.innerHTML = `
    <h1 class="mb-4">Adventures</h1>
    ${cards}
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('adventures');
  initFooter();

  const mainElement = document.querySelector('main.container');
  if (!mainElement) {
    return;
  }

  mainElement.innerHTML = '<h1 class="mb-4">Adventures</h1><p class="text-secondary">Loading adventures...</p>';

  const { data, error } = await getAdventures();

  if (error) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Adventures</h1>
      <div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load adventures.')}</div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Adventures</h1>
      <div class="alert alert-info" role="alert">No adventures yet</div>
    `;
    return;
  }

  renderFeed(mainElement, data);
});
