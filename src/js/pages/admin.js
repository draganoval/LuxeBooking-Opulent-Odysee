import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAdmin } from '../auth/guards.js';
import {
  deleteBookingById,
  getAllBookingsForAdmin,
  updateBookingStatusById
} from '../services/bookingsService.js';
import { createHotel, deleteHotelById, getHotels } from '../services/hotelsService.js';

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

function renderLayout(mainElement) {
  mainElement.innerHTML = `
    <h1 class="mb-4">Admin Panel</h1>

    <section class="mb-5">
      <h2 class="h4 mb-3">Booking Moderation</h2>
      <div id="admin-bookings-alert"></div>
      <div id="admin-bookings-content"><p class="text-secondary mb-0">Loading bookings...</p></div>
    </section>

    <section>
      <h2 class="h4 mb-3">Hotels Management</h2>
      <div id="admin-hotels-alert"></div>
      <form id="admin-add-hotel-form" class="row g-3 mb-4">
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
        <div class="col-12">
          <button type="submit" class="btn btn-dark btn-sm">Add Hotel</button>
        </div>
      </form>
      <div id="admin-hotels-content"><p class="text-secondary mb-0">Loading hotels...</p></div>
    </section>
  `;
}

function renderBookings(bookingsContent, bookings) {
  if (!bookings || bookings.length === 0) {
    bookingsContent.innerHTML = '<div class="alert alert-info" role="alert">No bookings found.</div>';
    return;
  }

  const rows = bookings
    .map((booking) => {
      const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
      const userEmail = profile?.email ?? '—';
      const hotelName = booking.hotels?.name ?? '—';
      const status = String(booking.status ?? 'unknown');
      const createdAt = booking.created_at ? new Date(booking.created_at).toLocaleString() : '—';
      const badgeClass = getStatusBadgeClass(status);
      const disableAction = status !== 'pending';
      const actionAttr = disableAction ? 'disabled' : '';

      return `
        <tr>
          <td>${escapeHtml(userEmail)}</td>
          <td>${escapeHtml(hotelName)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
          <td>${escapeHtml(createdAt)}</td>
          <td>
            <div class="d-flex gap-2">
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
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
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
          <td>
            <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-hotel" data-hotel-id="${hotel.id}">Delete</button>
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
  const addHotelForm = document.getElementById('admin-add-hotel-form');

  if (!bookingsContent || !hotelsContent || !addHotelForm) {
    return;
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

    renderHotels(hotelsContent, data);
  }

  await Promise.all([loadBookings(), loadHotels()]);

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

    actionButton.disabled = true;

    if (deleteButton) {
      const { error } = await deleteBookingById(bookingId);
      if (error) {
        setAlert(bookingsAlert, 'danger', error.message || 'Unable to delete booking.');
        actionButton.disabled = false;
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
      actionButton.disabled = false;
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
    const name = String(formData.get('name') ?? '').trim();
    const destination = String(formData.get('destination') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();

    if (!name || !destination) {
      setAlert(hotelsAlert, 'danger', 'Name and destination are required.');
      return;
    }

    const { error } = await createHotel({ name, destination, description });
    if (error) {
      setAlert(hotelsAlert, 'danger', error.message || 'Unable to add hotel.');
      return;
    }

    setAlert(hotelsAlert, 'success', 'Hotel added successfully.');
    addHotelForm.reset();
    await loadHotels();
  });

  hotelsContent.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-action="delete-hotel"]');
    if (!deleteButton) {
      return;
    }

    const hotelId = Number(deleteButton.getAttribute('data-hotel-id'));
    if (!Number.isInteger(hotelId)) {
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
    await loadHotels();
  });
});
