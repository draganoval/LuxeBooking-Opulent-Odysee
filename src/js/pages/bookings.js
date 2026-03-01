import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { requireAuth } from '../auth/guards.js';
import { supabase } from '../supabaseClient.js';
import { uploadBookingAttachment } from '../services/storageService.js';

function showAlert(container, type, message) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAuth();
  if (!isAuthorized) {
    return;
  }

  initHeader('bookings');
  initFooter();

  const form =
    document.getElementById('booking-form') ||
    document.getElementById('bookings-form') ||
    document.querySelector('form[data-booking-form="true"]');

  const alertContainer =
    document.getElementById('booking-alert') ||
    document.getElementById('bookings-alert') ||
    document.querySelector('[data-booking-alert="true"]');

  if (!form) {
    showAlert(alertContainer, 'danger', 'Booking form is missing.');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }

    const formData = new FormData(form);

    const hasRequiredFields =
      formData.has('hotel_id') &&
      formData.has('start_date') &&
      formData.has('end_date') &&
      formData.has('guests') &&
      formData.has('note');

    if (!hasRequiredFields) {
      showAlert(alertContainer, 'danger', 'Booking form fields are incomplete.');
      return;
    }

    const hotelIdRaw = String(formData.get('hotel_id') ?? '').trim();
    const startDate = String(formData.get('start_date') ?? '').trim();
    const endDate = String(formData.get('end_date') ?? '').trim();
    const guestsRaw = String(formData.get('guests') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    const file = formData.get('attachment');

    if (!hotelIdRaw || !startDate || !endDate || !guestsRaw) {
      showAlert(alertContainer, 'danger', 'Hotel, dates, and guests are required.');
      return;
    }

    const hotelId = Number(hotelIdRaw);
    const guests = Number(guestsRaw);

    if (!Number.isInteger(hotelId) || !Number.isInteger(guests) || guests <= 0) {
      showAlert(alertContainer, 'danger', 'Hotel and guests values are invalid.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (sessionError || !user?.id) {
      showAlert(alertContainer, 'danger', sessionError?.message || 'You must be logged in.');
      return;
    }

    let attachmentPath = null;
    const hasFile = file instanceof File && file.size > 0;

    if (hasFile) {
      const { data: uploadData, error: uploadError } = await uploadBookingAttachment(file, user.id);
      if (uploadError) {
        showAlert(alertContainer, 'danger', uploadError.message || 'Attachment upload failed.');
        return;
      }

      attachmentPath = uploadData?.path ?? null;
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      hotel_id: hotelId,
      start_date: startDate,
      end_date: endDate,
      guests,
      note,
      attachment_path: attachmentPath,
      status: 'pending'
    });

    if (insertError) {
      showAlert(alertContainer, 'danger', insertError.message || 'Failed to create booking.');
      return;
    }

    showAlert(alertContainer, 'success', 'Booking created successfully.');
    form.reset();
  });
});
