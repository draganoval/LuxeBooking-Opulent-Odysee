import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { getHotels } from '../services/hotelsService.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHotels(mainElement, hotels) {
  const cards = hotels
    .map(
      (hotel) => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100">
            ${
              hotel.image_url
                ? `<img src="${escapeHtml(hotel.image_url)}" class="card-img-top" alt="${escapeHtml(hotel.name)}" style="height: 160px; object-fit: cover;" />`
                : `<div class="bg-light border-bottom d-flex align-items-center justify-content-center" style="height: 160px;"><span class="text-muted">Image Placeholder</span></div>`
            }
            <div class="card-body">
              <h5 class="card-title mb-2">${escapeHtml(hotel.name)}</h5>
              <p class="text-secondary mb-2">${escapeHtml(hotel.destination)}</p>
              <p class="card-text mb-0">${escapeHtml(hotel.description || 'No description available.')}</p>
            </div>
            <div class="card-footer bg-white border-0 pt-0">
              <a
                class="btn btn-dark w-100"
                href="./bookings.html?hotelId=${encodeURIComponent(hotel.id)}"
                aria-label="Request booking for ${escapeHtml(hotel.name)}"
              >
                Request Booking
              </a>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  mainElement.innerHTML = `
    <h1 class="mb-4">Hotels</h1>
    <div class="row g-4">
      ${cards}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  initHeader('hotels');
  initFooter();

  const mainElement = document.querySelector('main.container');
  if (!mainElement) {
    return;
  }

  mainElement.innerHTML = '<h1 class="mb-4">Hotels</h1><p class="text-secondary">Loading hotels...</p>';

  const { data, error } = await getHotels();

  if (error) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Hotels</h1>
      <div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load hotels.')}</div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    mainElement.innerHTML = `
      <h1 class="mb-4">Hotels</h1>
      <div class="alert alert-info" role="alert">No hotels available yet.</div>
    `;
    return;
  }

  renderHotels(mainElement, data);
});
