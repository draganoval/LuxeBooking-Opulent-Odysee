import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { getHotels } from '../services/hotelsService.js';
import { getDestinations } from '../services/destinationsService.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderPreviewCards(items, titleKey, subtitleKey) {
  return items
    .map(
      (item) => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100">
            ${
              item.image_url
                ? `<img src="${escapeHtml(item.image_url)}" class="card-img-top" alt="${escapeHtml(item[titleKey])}" style="height: 140px; object-fit: cover;" />`
                : `<div class="bg-light border-bottom d-flex align-items-center justify-content-center" style="height: 140px;"><span class="text-muted">Image Placeholder</span></div>`
            }
            <div class="card-body">
              <h5 class="card-title mb-2">${escapeHtml(item[titleKey])}</h5>
              <p class="text-secondary mb-0">${escapeHtml(item[subtitleKey])}</p>
            </div>
          </div>
        </div>
      `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('home');
  initFooter();

  const featuredHotelsContainer = document.getElementById('featured-hotels');
  const featuredDestinationsContainer = document.getElementById('featured-destinations');

  if (featuredHotelsContainer) {
    featuredHotelsContainer.innerHTML = '<div class="col-12"><p class="text-secondary mb-0">Loading featured hotels...</p></div>';
    const { data, error } = await getHotels();

    if (error) {
      featuredHotelsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load featured hotels.')}</div></div>`;
    } else {
      const featuredHotels = (data || []).slice(0, 3);
      featuredHotelsContainer.innerHTML =
        featuredHotels.length > 0
          ? renderPreviewCards(featuredHotels, 'name', 'destination')
          : '<div class="col-12"><div class="alert alert-info" role="alert">No featured hotels available.</div></div>';
    }
  }

  if (featuredDestinationsContainer) {
    featuredDestinationsContainer.innerHTML = '<div class="col-12"><p class="text-secondary mb-0">Loading featured destinations...</p></div>';
    const { data, error } = await getDestinations();

    if (error) {
      featuredDestinationsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load featured destinations.')}</div></div>`;
    } else {
      const featuredDestinations = (data || []).slice(0, 3);
      featuredDestinationsContainer.innerHTML =
        featuredDestinations.length > 0
          ? renderPreviewCards(featuredDestinations, 'name', 'country')
          : '<div class="col-12"><div class="alert alert-info" role="alert">No featured destinations available.</div></div>';
    }
  }
});
