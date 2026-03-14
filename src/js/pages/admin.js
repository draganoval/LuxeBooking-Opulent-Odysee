import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAdmin } from '../auth/guards.js';
import {
  deleteBookingById,
  getAllBookingsForAdmin,
  updateBookingStatusById
} from '../services/bookingsService.js';
import { createAdventure, deleteAdventure, getAdventures, updateAdventure } from '../services/adventuresService.js';
import { createDestination, deleteDestinationById, getDestinations, updateDestinationById } from '../services/destinationsService.js';
import { createHotel, deleteHotelById, getHotels, updateHotelById } from '../services/hotelsService.js';
import { uploadAdventureImage, uploadDestinationImage, uploadHotelImage } from '../services/storageService.js';

const ALLOWED_ADVENTURE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getStatusBadgeClass(status) {
  if (status === 'pending') return 'text-bg-warning';
  if (status === 'approved') return 'text-bg-success';
  if (status === 'rejected') return 'text-bg-danger';
  if (status === 'cancelled') return 'text-bg-secondary';
  return 'text-bg-light';
}

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
}

function parseEntityId(value) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

function getImageMarkup(url, label) {
  if (url) {
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(label)}" class="img-thumbnail" style="width: 80px; height: 56px; object-fit: cover;" />`;
  }

  return '<div class="text-secondary small">No image</div>';
}

function truncatePreview(value, maxLength = 140) {
  const text = String(value ?? '').trim();
  if (!text) {
    return 'No content available.';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function renderLayout(mainElement) {
  mainElement.innerHTML = `
    <h1 class="mb-4">Admin Panel</h1>

    <section class="mb-5">
      <h2 class="h4 mb-3">Booking Moderation</h2>
      <div id="admin-bookings-alert"></div>
      <div id="admin-bookings-content"><p class="text-secondary mb-0">Loading bookings...</p></div>
    </section>

    <section class="mb-5">
      <h2 class="h4 mb-3">Hotels Management</h2>
      <div id="admin-hotels-alert"></div>
      <form id="admin-add-hotel-form" class="row g-3 mb-4">
        <input type="hidden" name="hotel_id" />
        <input type="hidden" name="current_image_url" />
        <div class="col-12 col-md-4">
          <label for="admin-hotel-name" class="form-label">Name</label>
          <input id="admin-hotel-name" name="name" class="form-control" required />
        </div>
        <div class="col-12 col-md-4">
          <label for="admin-hotel-destination" class="form-label">Destination</label>
          <input id="admin-hotel-destination" name="destination" class="form-control" required />
        </div>
        <div class="col-12 col-md-4">
          <label for="admin-hotel-description" class="form-label">Description</label>
          <input id="admin-hotel-description" name="description" class="form-control" />
        </div>
        <div class="col-12 col-md-6">
          <label for="admin-hotel-image" class="form-label">Image</label>
          <input id="admin-hotel-image" name="image" class="form-control" type="file" accept="image/*" />
        </div>
        <div class="col-12 col-md-6 d-flex align-items-end">
          <small id="admin-hotel-image-hint" class="text-secondary">No image selected.</small>
        </div>
        <div class="col-12">
          <button type="submit" id="admin-hotel-submit" class="btn btn-dark btn-sm">Add Hotel</button>
          <button type="button" id="admin-hotel-cancel-edit" class="btn btn-outline-secondary btn-sm ms-2 d-none">Cancel edit</button>
        </div>
      </form>
      <div id="admin-hotels-content"><p class="text-secondary mb-0">Loading hotels...</p></div>
    </section>

    <section class="mb-5">
      <h2 class="h4 mb-3">Destinations Management</h2>
      <div id="admin-destinations-alert"></div>
      <form id="admin-add-destination-form" class="row g-3 mb-4">
        <input type="hidden" name="destination_id" />
        <input type="hidden" name="current_image_url" />
        <div class="col-12 col-md-4">
          <label for="admin-destination-name" class="form-label">Name</label>
          <input id="admin-destination-name" name="name" class="form-control" required />
        </div>
        <div class="col-12 col-md-4">
          <label for="admin-destination-country" class="form-label">Location</label>
          <input id="admin-destination-country" name="country" class="form-control" required />
        </div>
        <div class="col-12 col-md-4">
          <label for="admin-destination-description" class="form-label">Description</label>
          <input id="admin-destination-description" name="description" class="form-control" />
        </div>
        <div class="col-12 col-md-6">
          <label for="admin-destination-image" class="form-label">Image</label>
          <input id="admin-destination-image" name="image" class="form-control" type="file" accept="image/*" />
        </div>
        <div class="col-12 col-md-6 d-flex align-items-end">
          <small id="admin-destination-image-hint" class="text-secondary">No image selected.</small>
        </div>
        <div class="col-12">
          <button type="submit" id="admin-destination-submit" class="btn btn-dark btn-sm">Add Destination</button>
          <button type="button" id="admin-destination-cancel-edit" class="btn btn-outline-secondary btn-sm ms-2 d-none">Cancel edit</button>
        </div>
      </form>
      <div id="admin-destinations-content"><p class="text-secondary mb-0">Loading destinations...</p></div>
    </section>

    <section>
      <h2 class="h4 mb-3">Manage Adventures</h2>
      <div id="admin-adventures-alert"></div>
      <form id="admin-add-adventure-form" class="row g-3 mb-4">
        <input type="hidden" name="adventure_id" />
        <input type="hidden" name="current_image_url" />
        <div class="col-12 col-md-6">
          <label for="admin-adventure-title" class="form-label">Title</label>
          <input id="admin-adventure-title" name="title" class="form-control" required />
        </div>
        <div class="col-12 col-md-6">
          <label for="admin-adventure-author" class="form-label">Author Name</label>
          <input id="admin-adventure-author" name="author_name" class="form-control" />
        </div>
        <div class="col-12">
          <label for="admin-adventure-content" class="form-label">Content</label>
          <textarea id="admin-adventure-content" name="content" class="form-control" rows="4" required></textarea>
        </div>
        <div class="col-12">
          <label for="admin-adventure-image" class="form-label">Image (optional)</label>
          <input id="admin-adventure-image" name="image" class="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
        </div>
        <div class="col-12">
          <small id="admin-adventure-image-hint" class="text-secondary">No image selected.</small>
        </div>
        <div class="col-12">
          <button type="submit" id="admin-adventure-submit" class="btn btn-dark btn-sm">Add Adventure</button>
          <button type="button" id="admin-adventure-cancel-edit" class="btn btn-outline-secondary btn-sm ms-2 d-none">Cancel edit</button>
        </div>
      </form>
      <div id="admin-adventures-content"><p class="text-secondary mb-0">Loading adventures...</p></div>
    </section>
  `;
}

function renderBookings(bookingsContent, bookings) {
  if (!bookings || bookings.length === 0) {
    bookingsContent.innerHTML = '<div class="alert alert-info" role="alert">No bookings found.</div>';
    return;
  }

  const statusCounts = bookings.reduce(
    (accumulator, booking) => {
      const status = String(booking.status ?? 'unknown');
      accumulator[status] = (accumulator[status] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const summaryBadges = Object.entries(statusCounts)
    .map(([status, count]) => {
      const badgeClass = getStatusBadgeClass(status);
      return `<span class="badge ${badgeClass}">${escapeHtml(status)}: ${count}</span>`;
    })
    .join(' ');

  const rows = bookings
    .map((booking) => {
      const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
      const userEmail = profile?.email ?? '—';
      const hotelName = booking.hotels?.name ?? '—';
      const status = String(booking.status ?? 'unknown');
      const createdAt = formatDateTime(booking.created_at);
      const badgeClass = getStatusBadgeClass(status);
      const disableAction = status !== 'pending';
      const actionAttr = disableAction ? 'disabled' : '';

      return `
        <tr>
          <td>${escapeHtml(userEmail)}</td>
          <td>${escapeHtml(hotelName)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
          <td class="text-nowrap">${escapeHtml(createdAt)}</td>
          <td>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-success btn-sm" data-action="approve-booking" data-booking-id="${booking.id}" ${actionAttr}>Approve</button>
              <button type="button" class="btn btn-danger btn-sm" data-action="reject-booking" data-booking-id="${booking.id}" ${actionAttr}>Reject</button>
              <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete-booking" data-booking-id="${booking.id}">Delete booking</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  bookingsContent.innerHTML = `
    <div class="d-flex flex-wrap gap-2 mb-3">
      ${summaryBadges}
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover table-bordered align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th scope="col">User Email</th>
            <th scope="col">Hotel Name</th>
            <th scope="col">Status</th>
            <th scope="col">Created At</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderHotels(hotelsContent, hotels) {
  if (!hotels || hotels.length === 0) {
    hotelsContent.innerHTML = '<div class="alert alert-info" role="alert">No hotels found.</div>';
    return;
  }

  const rows = hotels
    .map((hotel) => {
      return `
        <tr>
          <td>${escapeHtml(hotel.id)}</td>
          <td>${escapeHtml(hotel.name)}</td>
          <td>${escapeHtml(hotel.destination)}</td>
          <td>${escapeHtml(hotel.description ?? '')}</td>
          <td>${getImageMarkup(hotel.image_url, `${hotel.name} image`)}</td>
          <td>
            <div class="d-flex gap-2 flex-wrap">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                data-action="edit-hotel"
                data-hotel-id="${hotel.id}"
                data-hotel-name="${escapeHtml(hotel.name)}"
                data-hotel-destination="${escapeHtml(hotel.destination)}"
                data-hotel-description="${escapeHtml(hotel.description ?? '')}"
                data-hotel-image-url="${escapeHtml(hotel.image_url ?? '')}"
              >Edit</button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-hotel" data-hotel-id="${hotel.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  hotelsContent.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Destination</th>
            <th scope="col">Description</th>
            <th scope="col">Image</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderDestinations(destinationsContent, destinations) {
  if (!destinations || destinations.length === 0) {
    destinationsContent.innerHTML = '<div class="alert alert-info" role="alert">No destinations found.</div>';
    return;
  }

  const rows = destinations
    .map((destination) => {
      return `
        <tr>
          <td>${escapeHtml(destination.id)}</td>
          <td>${escapeHtml(destination.name)}</td>
          <td>${escapeHtml(destination.country)}</td>
          <td>${escapeHtml(destination.description ?? '')}</td>
          <td>${getImageMarkup(destination.image_url, `${destination.name} image`)}</td>
          <td>
            <div class="d-flex gap-2 flex-wrap">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                data-action="edit-destination"
                data-destination-id="${destination.id}"
                data-destination-name="${escapeHtml(destination.name)}"
                data-destination-country="${escapeHtml(destination.country)}"
                data-destination-description="${escapeHtml(destination.description ?? '')}"
                data-destination-image-url="${escapeHtml(destination.image_url ?? '')}"
              >Edit</button>
              <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-destination" data-destination-id="${destination.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  destinationsContent.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Location</th>
            <th scope="col">Description</th>
            <th scope="col">Image</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdventures(adventuresContent, adventures) {
  if (!adventures || adventures.length === 0) {
    adventuresContent.innerHTML = '<div class="alert alert-info" role="alert">No adventures found.</div>';
    return;
  }

  const rows = adventures
    .map((adventure) => {
      return `
        <tr>
          <td>${escapeHtml(adventure.title ?? '')}</td>
          <td>${escapeHtml(adventure.author_name ?? '—')}</td>
          <td class="text-nowrap">${escapeHtml(formatDateTime(adventure.created_at))}</td>
          <td>${escapeHtml(truncatePreview(adventure.content))}</td>
          <td>${getImageMarkup(adventure.image_url, `${adventure.title ?? 'Adventure'} image`)}</td>
          <td>
            <div class="d-flex gap-2 flex-wrap">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                data-action="edit-adventure"
                data-adventure-id="${adventure.id}"
              >Edit</button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                data-action="delete-adventure"
                data-adventure-id="${adventure.id}"
              >Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  adventuresContent.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Author</th>
            <th scope="col">Created At</th>
            <th scope="col">Preview</th>
            <th scope="col">Image</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function setAlert(container, type, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `<div class="alert alert-${type} py-2" role="alert">${escapeHtml(message)}</div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAdmin();
  if (!isAuthorized) {
    return;
  }

  initHeader('admin');
  initFooter();

  const mainElement = document.querySelector('main.container');
  if (!mainElement) {
    return;
  }

  renderLayout(mainElement);

  const bookingsAlert = document.getElementById('admin-bookings-alert');
  const bookingsContent = document.getElementById('admin-bookings-content');
  const hotelsAlert = document.getElementById('admin-hotels-alert');
  const hotelsContent = document.getElementById('admin-hotels-content');
  const destinationsAlert = document.getElementById('admin-destinations-alert');
  const destinationsContent = document.getElementById('admin-destinations-content');
  const adventuresAlert = document.getElementById('admin-adventures-alert');
  const adventuresContent = document.getElementById('admin-adventures-content');
  const addHotelForm = document.getElementById('admin-add-hotel-form');
  const addDestinationForm = document.getElementById('admin-add-destination-form');
  const addAdventureForm = document.getElementById('admin-add-adventure-form');
  const hotelSubmitButton = document.getElementById('admin-hotel-submit');
  const destinationSubmitButton = document.getElementById('admin-destination-submit');
  const adventureSubmitButton = document.getElementById('admin-adventure-submit');
  const hotelCancelEditButton = document.getElementById('admin-hotel-cancel-edit');
  const destinationCancelEditButton = document.getElementById('admin-destination-cancel-edit');
  const adventureCancelEditButton = document.getElementById('admin-adventure-cancel-edit');
  const hotelImageHint = document.getElementById('admin-hotel-image-hint');
  const destinationImageHint = document.getElementById('admin-destination-image-hint');
  const adventureImageHint = document.getElementById('admin-adventure-image-hint');

  if (
    !bookingsContent ||
    !hotelsContent ||
    !destinationsContent ||
    !adventuresContent ||
    !addHotelForm ||
    !addDestinationForm ||
    !addAdventureForm ||
    !hotelSubmitButton ||
    !destinationSubmitButton ||
    !adventureSubmitButton ||
    !hotelCancelEditButton ||
    !destinationCancelEditButton ||
    !adventureCancelEditButton ||
    !hotelImageHint ||
    !destinationImageHint ||
    !adventureImageHint
  ) {
    return;
  }

  let hotelsCache = [];
  let destinationsCache = [];
  let adventuresCache = [];

  function resetHotelForm() {
    addHotelForm.reset();
    addHotelForm.elements.hotel_id.value = '';
    addHotelForm.elements.current_image_url.value = '';
    hotelSubmitButton.textContent = 'Add Hotel';
    hotelCancelEditButton.classList.add('d-none');
    hotelImageHint.textContent = 'No image selected.';
  }

  function setHotelFormEditMode(hotel) {
    addHotelForm.elements.hotel_id.value = String(hotel.id);
    addHotelForm.elements.current_image_url.value = hotel.image_url ?? '';
    addHotelForm.elements.name.value = hotel.name ?? '';
    addHotelForm.elements.destination.value = hotel.destination ?? '';
    addHotelForm.elements.description.value = hotel.description ?? '';
    addHotelForm.elements.image.value = '';
    hotelSubmitButton.textContent = 'Update Hotel';
    hotelCancelEditButton.classList.remove('d-none');
    hotelImageHint.textContent = hotel.image_url ? 'Current image will be kept unless replaced.' : 'No existing image.';
  }

  function resetDestinationForm() {
    addDestinationForm.reset();
    addDestinationForm.elements.destination_id.value = '';
    addDestinationForm.elements.current_image_url.value = '';
    destinationSubmitButton.textContent = 'Add Destination';
    destinationCancelEditButton.classList.add('d-none');
    destinationImageHint.textContent = 'No image selected.';
  }

  function setDestinationFormEditMode(destination) {
    addDestinationForm.elements.destination_id.value = String(destination.id);
    addDestinationForm.elements.current_image_url.value = destination.image_url ?? '';
    addDestinationForm.elements.name.value = destination.name ?? '';
    addDestinationForm.elements.country.value = destination.country ?? '';
    addDestinationForm.elements.description.value = destination.description ?? '';
    addDestinationForm.elements.image.value = '';
    destinationSubmitButton.textContent = 'Update Destination';
    destinationCancelEditButton.classList.remove('d-none');
    destinationImageHint.textContent = destination.image_url ? 'Current image will be kept unless replaced.' : 'No existing image.';
  }

  function resetAdventureForm() {
    addAdventureForm.reset();
    addAdventureForm.elements.adventure_id.value = '';
    addAdventureForm.elements.current_image_url.value = '';
    adventureSubmitButton.textContent = 'Add Adventure';
    adventureCancelEditButton.classList.add('d-none');
    adventureImageHint.textContent = 'No image selected.';
  }

  function setAdventureFormEditMode(adventure) {
    addAdventureForm.elements.adventure_id.value = String(adventure.id);
    addAdventureForm.elements.current_image_url.value = adventure.image_url ?? '';
    addAdventureForm.elements.title.value = adventure.title ?? '';
    addAdventureForm.elements.author_name.value = adventure.author_name ?? '';
    addAdventureForm.elements.content.value = adventure.content ?? '';
    addAdventureForm.elements.image.value = '';
    adventureSubmitButton.textContent = 'Update Adventure';
    adventureCancelEditButton.classList.remove('d-none');
    adventureImageHint.textContent = adventure.image_url ? 'Current image will be kept unless replaced.' : 'No existing image.';
  }

  async function loadBookings() {
    bookingsContent.innerHTML = '<p class="text-secondary mb-0">Loading bookings...</p>';
    const { data, error } = await getAllBookingsForAdmin();

    if (error) {
      bookingsContent.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load bookings.')}</div>`;
      return;
    }

    renderBookings(bookingsContent, data);
  }

  async function loadHotels() {
    hotelsContent.innerHTML = '<p class="text-secondary mb-0">Loading hotels...</p>';
    const { data, error } = await getHotels();

    if (error) {
      hotelsContent.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load hotels.')}</div>`;
      return;
    }

    hotelsCache = Array.isArray(data) ? data : [];
    renderHotels(hotelsContent, hotelsCache);
  }

  async function loadDestinations() {
    destinationsContent.innerHTML = '<p class="text-secondary mb-0">Loading destinations...</p>';
    const { data, error } = await getDestinations();

    if (error) {
      destinationsContent.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load destinations.')}</div>`;
      return;
    }

    destinationsCache = Array.isArray(data) ? data : [];
    renderDestinations(destinationsContent, destinationsCache);
  }

  async function loadAdventures() {
    adventuresContent.innerHTML = '<p class="text-secondary mb-0">Loading adventures...</p>';
    const { data, error } = await getAdventures();

    if (error) {
      adventuresContent.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to load adventures.')}</div>`;
      return;
    }

    adventuresCache = Array.isArray(data) ? data : [];
    renderAdventures(adventuresContent, adventuresCache);
  }

  await Promise.all([loadBookings(), loadHotels(), loadDestinations(), loadAdventures()]);

  bookingsContent.addEventListener('click', async (event) => {
    const approveButton = event.target.closest('[data-action="approve-booking"]');
    const rejectButton = event.target.closest('[data-action="reject-booking"]');
    const deleteButton = event.target.closest('[data-action="delete-booking"]');
    const actionButton = approveButton || rejectButton || deleteButton;

    if (!actionButton || actionButton.disabled) {
      return;
    }

    const bookingId = Number(actionButton.getAttribute('data-booking-id'));
    if (!Number.isInteger(bookingId)) {
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    if (bookingsAlert) {
      bookingsAlert.innerHTML = '';
    }

    const rowElement = actionButton.closest('tr');
    const rowActionButtons = rowElement
      ? Array.from(rowElement.querySelectorAll('button[data-booking-id]'))
      : [actionButton];

    if (deleteButton) {
      const isConfirmed = window.confirm('Delete this booking permanently?');
      if (!isConfirmed) {
        return;
      }
    }

    rowActionButtons.forEach((button) => {
      button.disabled = true;
    });

    if (deleteButton) {
      const { error } = await deleteBookingById(bookingId);
      if (error) {
        setAlert(bookingsAlert, 'danger', error.message || 'Unable to delete booking.');
        rowActionButtons.forEach((button) => {
          button.disabled = false;
        });
        return;
      }

      setAlert(bookingsAlert, 'success', 'Booking deleted successfully.');
      await loadBookings();
      return;
    }

    const status = approveButton ? 'approved' : 'rejected';

    const { error } = await updateBookingStatusById(bookingId, status);
    if (error) {
      setAlert(bookingsAlert, 'danger', error.message || 'Unable to update booking status.');
      rowActionButtons.forEach((button) => {
        button.disabled = false;
      });
      return;
    }

    setAlert(bookingsAlert, 'success', `Booking ${status} successfully.`);
    await loadBookings();
  });

  addHotelForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (hotelsAlert) {
      hotelsAlert.innerHTML = '';
    }

    const formData = new FormData(addHotelForm);
    const hotelId = parseEntityId(formData.get('hotel_id'));
    const name = String(formData.get('name') ?? '').trim();
    const destination = String(formData.get('destination') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const currentImageUrl = String(formData.get('current_image_url') ?? '').trim();
    const imageFile = formData.get('image');

    if (!name || !destination) {
      setAlert(hotelsAlert, 'danger', 'Name and destination are required.');
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    let imageUrl = currentImageUrl || null;
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadResult = await uploadHotelImage(imageFile);
      if (uploadResult.error) {
        setAlert(hotelsAlert, 'danger', uploadResult.error.message || 'Unable to upload hotel image.');
        return;
      }

      imageUrl = uploadResult.data?.publicUrl ?? null;
    }

    const payload = { name, destination, description, image_url: imageUrl };

    const operationResult = hotelId
      ? await updateHotelById(hotelId, payload)
      : await createHotel(payload);

    const { error } = operationResult;
    if (error) {
      setAlert(hotelsAlert, 'danger', error.message || 'Unable to save hotel.');
      return;
    }

    setAlert(hotelsAlert, 'success', hotelId ? 'Hotel updated successfully.' : 'Hotel added successfully.');
    resetHotelForm();
    await loadHotels();
  });

  addHotelForm.elements.image.addEventListener('change', () => {
    const selectedFile = addHotelForm.elements.image.files?.[0];
    if (!selectedFile) {
      const hasCurrentImage = Boolean(addHotelForm.elements.current_image_url.value);
      hotelImageHint.textContent = hasCurrentImage ? 'Current image will be kept unless replaced.' : 'No image selected.';
      return;
    }

    hotelImageHint.textContent = `Selected: ${selectedFile.name}`;
  });

  hotelCancelEditButton.addEventListener('click', () => {
    if (hotelsAlert) {
      hotelsAlert.innerHTML = '';
    }
    resetHotelForm();
  });

  hotelsContent.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-action="edit-hotel"]');
    const deleteButton = event.target.closest('[data-action="delete-hotel"]');

    if (editButton) {
      const hotelId = parseEntityId(editButton.getAttribute('data-hotel-id'));
      if (!hotelId) {
        return;
      }

      const hotel = hotelsCache.find((item) => item.id === hotelId);
      if (!hotel) {
        setAlert(hotelsAlert, 'danger', 'Hotel not found for editing.');
        return;
      }

      if (hotelsAlert) {
        hotelsAlert.innerHTML = '';
      }
      setHotelFormEditMode(hotel);
      addHotelForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!deleteButton) {
      return;
    }

    const hotelId = Number(deleteButton.getAttribute('data-hotel-id'));
    if (!Number.isInteger(hotelId)) {
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    const isConfirmed = window.confirm('Delete this hotel?');
    if (!isConfirmed) {
      return;
    }

    deleteButton.disabled = true;

    const { error } = await deleteHotelById(hotelId);
    if (error) {
      setAlert(hotelsAlert, 'danger', error.message || 'Unable to delete hotel. It may have existing bookings.');
      deleteButton.disabled = false;
      return;
    }

    setAlert(hotelsAlert, 'success', 'Hotel deleted successfully.');
    if (String(addHotelForm.elements.hotel_id.value) === String(hotelId)) {
      resetHotelForm();
    }
    await loadHotels();
  });

  addDestinationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (destinationsAlert) {
      destinationsAlert.innerHTML = '';
    }

    const formData = new FormData(addDestinationForm);
    const destinationId = parseEntityId(formData.get('destination_id'));
    const name = String(formData.get('name') ?? '').trim();
    const country = String(formData.get('country') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const currentImageUrl = String(formData.get('current_image_url') ?? '').trim();
    const imageFile = formData.get('image');

    if (!name || !country) {
      setAlert(destinationsAlert, 'danger', 'Name and location are required.');
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    let imageUrl = currentImageUrl || null;
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadResult = await uploadDestinationImage(imageFile);
      if (uploadResult.error) {
        setAlert(destinationsAlert, 'danger', uploadResult.error.message || 'Unable to upload destination image.');
        return;
      }

      imageUrl = uploadResult.data?.publicUrl ?? null;
    }

    const payload = { name, country, description, image_url: imageUrl };

    const operationResult = destinationId
      ? await updateDestinationById(destinationId, payload)
      : await createDestination(payload);

    const { error } = operationResult;
    if (error) {
      setAlert(destinationsAlert, 'danger', error.message || 'Unable to save destination.');
      return;
    }

    setAlert(destinationsAlert, 'success', destinationId ? 'Destination updated successfully.' : 'Destination added successfully.');
    resetDestinationForm();
    await loadDestinations();
  });

  addDestinationForm.elements.image.addEventListener('change', () => {
    const selectedFile = addDestinationForm.elements.image.files?.[0];
    if (!selectedFile) {
      const hasCurrentImage = Boolean(addDestinationForm.elements.current_image_url.value);
      destinationImageHint.textContent = hasCurrentImage ? 'Current image will be kept unless replaced.' : 'No image selected.';
      return;
    }

    destinationImageHint.textContent = `Selected: ${selectedFile.name}`;
  });

  destinationCancelEditButton.addEventListener('click', () => {
    if (destinationsAlert) {
      destinationsAlert.innerHTML = '';
    }
    resetDestinationForm();
  });

  destinationsContent.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-action="edit-destination"]');
    const deleteButton = event.target.closest('[data-action="delete-destination"]');

    if (editButton) {
      const destinationId = parseEntityId(editButton.getAttribute('data-destination-id'));
      if (!destinationId) {
        return;
      }

      const destination = destinationsCache.find((item) => item.id === destinationId);
      if (!destination) {
        setAlert(destinationsAlert, 'danger', 'Destination not found for editing.');
        return;
      }

      if (destinationsAlert) {
        destinationsAlert.innerHTML = '';
      }
      setDestinationFormEditMode(destination);
      addDestinationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!deleteButton) {
      return;
    }

    const destinationId = parseEntityId(deleteButton.getAttribute('data-destination-id'));
    if (!destinationId) {
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    const isConfirmed = window.confirm('Delete this destination?');
    if (!isConfirmed) {
      return;
    }

    deleteButton.disabled = true;

    const { error } = await deleteDestinationById(destinationId);
    if (error) {
      setAlert(destinationsAlert, 'danger', error.message || 'Unable to delete destination.');
      deleteButton.disabled = false;
      return;
    }

    setAlert(destinationsAlert, 'success', 'Destination deleted successfully.');
    if (String(addDestinationForm.elements.destination_id.value) === String(destinationId)) {
      resetDestinationForm();
    }
    await loadDestinations();
  });

  addAdventureForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (adventuresAlert) {
      adventuresAlert.innerHTML = '';
    }

    const formData = new FormData(addAdventureForm);
    const adventureId = parseEntityId(formData.get('adventure_id'));
    const title = String(formData.get('title') ?? '').trim();
    const author_name = String(formData.get('author_name') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();
    const currentImageUrl = String(formData.get('current_image_url') ?? '').trim();
    const imageFile = formData.get('image');

    if (!title || !content) {
      setAlert(adventuresAlert, 'danger', 'Title and content are required.');
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    let image_url = currentImageUrl || null;
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!ALLOWED_ADVENTURE_IMAGE_TYPES.has(imageFile.type)) {
        setAlert(adventuresAlert, 'danger', 'Only JPG, JPEG, PNG, and WEBP images are allowed.');
        return;
      }

      const uploadResult = await uploadAdventureImage(imageFile);
      if (uploadResult.error) {
        setAlert(adventuresAlert, 'danger', uploadResult.error.message || 'Unable to upload adventure image.');
        return;
      }

      image_url = uploadResult.data?.publicUrl ?? null;
    }

    const payload = {
      title,
      author_name,
      content,
      image_url
    };

    const { error } = adventureId
      ? await updateAdventure(adventureId, payload)
      : await createAdventure(payload);

    if (error) {
      setAlert(adventuresAlert, 'danger', error.message || 'Unable to save adventure.');
      return;
    }

    setAlert(adventuresAlert, 'success', adventureId ? 'Adventure updated successfully.' : 'Adventure added successfully.');
    resetAdventureForm();
    await loadAdventures();
  });

  addAdventureForm.elements.image.addEventListener('change', () => {
    const selectedFile = addAdventureForm.elements.image.files?.[0];
    if (!selectedFile) {
      const hasCurrentImage = Boolean(addAdventureForm.elements.current_image_url.value);
      adventureImageHint.textContent = hasCurrentImage ? 'Current image will be kept unless replaced.' : 'No image selected.';
      return;
    }

    if (!ALLOWED_ADVENTURE_IMAGE_TYPES.has(selectedFile.type)) {
      adventureImageHint.textContent = 'Invalid file type. Use JPG, JPEG, PNG, or WEBP.';
      return;
    }

    adventureImageHint.textContent = `Selected: ${selectedFile.name}`;
  });

  adventureCancelEditButton.addEventListener('click', () => {
    if (adventuresAlert) {
      adventuresAlert.innerHTML = '';
    }
    resetAdventureForm();
  });

  adventuresContent.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-action="edit-adventure"]');
    const deleteButton = event.target.closest('[data-action="delete-adventure"]');

    if (editButton) {
      const adventureId = parseEntityId(editButton.getAttribute('data-adventure-id'));
      if (!adventureId) {
        return;
      }

      const adventure = adventuresCache.find((item) => item.id === adventureId);
      if (!adventure) {
        setAlert(adventuresAlert, 'danger', 'Adventure not found for editing.');
        return;
      }

      if (adventuresAlert) {
        adventuresAlert.innerHTML = '';
      }

      setAdventureFormEditMode(adventure);
      addAdventureForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!deleteButton) {
      return;
    }

    const adventureId = parseEntityId(deleteButton.getAttribute('data-adventure-id'));
    if (!adventureId) {
      return;
    }

    const isStillAdmin = await requireAdmin();
    if (!isStillAdmin) {
      return;
    }

    const isConfirmed = window.confirm('Delete this adventure?');
    if (!isConfirmed) {
      return;
    }

    deleteButton.disabled = true;

    const { error } = await deleteAdventure(adventureId);
    if (error) {
      setAlert(adventuresAlert, 'danger', error.message || 'Unable to delete adventure.');
      deleteButton.disabled = false;
      return;
    }

    setAlert(adventuresAlert, 'success', 'Adventure deleted successfully.');
    if (String(addAdventureForm.elements.adventure_id.value) === String(adventureId)) {
      resetAdventureForm();
    }
    await loadAdventures();
  });

  resetHotelForm();
  resetDestinationForm();
  resetAdventureForm();
});
