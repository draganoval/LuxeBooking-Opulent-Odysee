import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAuth } from '../auth/guards.js';
import { supabase } from '../supabaseClient.js';
import { getPublicUrl } from '../services/storageService.js';
import { cancelBookingById, getBookingsByUserId } from '../services/bookingsService.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getStatusBadgeClass(status) {
  if (status === 'pending') {
    return 'text-bg-warning';
  }

  if (status === 'cancelled') {
    return 'text-bg-secondary';
  }

  if (status === 'confirmed') {
    return 'text-bg-success';
  }

  return 'text-bg-light';
}

function renderError(mainElement, email, message) {
  mainElement.innerHTML = `
    <h1 class="mb-1">My Bookings</h1>
    <p class="text-secondary mb-4">${escapeHtml(email)}</p>
    <div class="alert alert-danger" role="alert">${escapeHtml(message)}</div>
  `;
}

function renderEmpty(mainElement, email) {
  mainElement.innerHTML = `
    <h1 class="mb-1">My Bookings</h1>
    <p class="text-secondary mb-4">${escapeHtml(email)}</p>
    <div class="alert alert-info" role="alert">You have no bookings yet.</div>
  `;
}

function renderTable(mainElement, email, bookings) {
  const rows = bookings
    .map((booking) => {
      const hotelName = booking.hotels?.name ?? '—';
      const dateRange = `${booking.start_date ?? '—'} → ${booking.end_date ?? '—'}`;
      const status = String(booking.status ?? 'unknown');
      const badgeClass = getStatusBadgeClass(status);

      let attachmentCell = '—';
      if (booking.attachment_path) {
        const { data, error } = getPublicUrl(booking.attachment_path);
        if (!error && data?.publicUrl) {
          attachmentCell = `<a href="${escapeHtml(data.publicUrl)}" target="_blank" rel="noopener noreferrer">Download</a>`;
        }
      }

      const actionCell =
        status === 'pending'
          ? `<button type="button" class="btn btn-sm btn-outline-danger" data-action="cancel-booking" data-booking-id="${booking.id}">Cancel</button>`
          : '—';

      return `
        <tr>
          <td>${escapeHtml(hotelName)}</td>
          <td>${escapeHtml(dateRange)}</td>
          <td>${escapeHtml(booking.guests)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
          <td>${attachmentCell}</td>
          <td>${actionCell}</td>
        </tr>
      `;
    })
    .join('');

  mainElement.innerHTML = `
    <h1 class="mb-1">My Bookings</h1>
    <p class="text-secondary mb-4">${escapeHtml(email)}</p>
    <div id="user-bookings-alert"></div>
    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">Hotel</th>
            <th scope="col">Dates</th>
            <th scope="col">Guests</th>
            <th scope="col">Status</th>
            <th scope="col">Attachment</th>
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

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAuth();
  if (!isAuthorized) {
    return;
  }

  initHeader('user');
  initFooter();

  const mainElement = document.querySelector('main.container');
  if (!mainElement) {
    return;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (sessionError || !user?.id) {
    renderError(mainElement, '', sessionError?.message || 'Unable to load user session.');
    return;
  }

  const userEmail = user.email ?? 'User';

  async function loadBookings() {
    const { data, error } = await getBookingsByUserId(user.id);

    if (error) {
      renderError(mainElement, userEmail, error.message || 'Unable to load bookings.');
      return;
    }

    if (!data || data.length === 0) {
      renderEmpty(mainElement, userEmail);
      return;
    }

    renderTable(mainElement, userEmail, data);
  }

  await loadBookings();

  mainElement.addEventListener('click', async (event) => {
    const cancelButton = event.target.closest('[data-action="cancel-booking"]');
    if (!cancelButton) {
      return;
    }

    const bookingId = Number(cancelButton.getAttribute('data-booking-id'));
    if (!Number.isInteger(bookingId)) {
      return;
    }

    cancelButton.disabled = true;

    const { error } = await cancelBookingById(bookingId, user.id);

    if (error) {
      const alertElement = document.getElementById('user-bookings-alert');
      if (alertElement) {
        alertElement.innerHTML = `
          <div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Unable to cancel booking.')}</div>
        `;
      }
      cancelButton.disabled = false;
      return;
    }

    await loadBookings();
  });
});
