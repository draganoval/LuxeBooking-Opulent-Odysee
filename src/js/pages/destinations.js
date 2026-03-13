import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { getDestinations } from '../services/destinationsService.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderDestinations(mainElement, destinations) {
  const cards = destinations
    .map(
      (destination) => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100">
            ${
              destination.image_url
                ? `<img src="${escapeHtml(destination.image_url)}" class="card-img-top" alt="${escapeHtml(destination.name)}" style="height: 160px; object-fit: cover;" />`
                : `<div class="bg-light border-bottom d-flex align-items-center justify-content-center" style="height: 160px;"><span class="text-muted">Image Placeholder</span></div>`
            }
            <div class="card-body">
              <h5 class="card-title mb-2">${escapeHtml(destination.name)}</h5>
              <p class="text-secondary mb-2">${escapeHtml(destination.country)}</p>
              <p class="card-text mb-0">${escapeHtml(destination.description || 'No description available.')}</p>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  mainElement.innerHTML = `
    <h1 class="mb-4">Destinations</h1>
    <div class="row g-4">
      ${cards}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('destinations');
  initFooter();

  const mainElement = document.querySelector('main.container');
  if (!mainElement) {
    return;
  }

  mainElement.innerHTML = '<h1 class="mb-4">Destinations</h1><p class="text-secondary">Loading destinations...</p>';

  const { data, error } = await getDestinations();

  if (error) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Destinations</h1>
      <div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load destinations.')}</div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Destinations</h1>
      <div class="alert alert-info" role="alert">No destinations available yet.</div>
    `;
    return;
  }

  renderDestinations(mainElement, data);
});
