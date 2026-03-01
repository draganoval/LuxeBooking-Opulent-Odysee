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

  if (content.length <= 260) {
    return content;
  }

  return `${content.slice(0, 260)}…`;
}

function renderFeed(mainElement, adventures) {
  const cards = adventures
    .map((adventure) => {
      const authorMarkup = adventure.author_name
        ? `<p class="text-secondary mb-1">By ${escapeHtml(adventure.author_name)}</p>`
        : '';

      return `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title mb-1">${escapeHtml(adventure.title || 'Untitled Adventure')}</h5>
            ${authorMarkup}
            <p class="small text-muted mb-3">${escapeHtml(formatDate(adventure.created_at))}</p>
            <p class="card-text mb-0">${escapeHtml(truncateContent(adventure.content))}</p>
          </div>
            </div>
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
