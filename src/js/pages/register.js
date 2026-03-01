import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import {
  ensureProfile,
  getSession,
  registerUser
} from '../auth/authService.js';

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

document.addEventListener('DOMContentLoaded', () => {
  initHeader('register');
  initFooter();

  const form = document.getElementById('register-form');
  const alertContainer = document.getElementById('auth-alert');
  const submitButton = document.getElementById('register-submit');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alertContainer.innerHTML = '';

    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (!email || !password || !confirmPassword) {
      showAlert(alertContainer, 'danger', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert(alertContainer, 'danger', 'Passwords do not match.');
      return;
    }

    submitButton.disabled = true;

    const { error } = await registerUser(email, password);

    if (error) {
      showAlert(alertContainer, 'danger', error.message || 'Registration failed.');
      submitButton.disabled = false;
      return;
    }

    const sessionResult = await getSession();

    if (sessionResult.error) {
      showAlert(
        alertContainer,
        'danger',
        sessionResult.error.message || 'Unable to check session after registration.'
      );
      submitButton.disabled = false;
      return;
    }

    const sessionUser = sessionResult.data?.session?.user;

    if (sessionUser) {
      const profileResult = await ensureProfile();

      if (profileResult.error) {
        showAlert(
          alertContainer,
          'danger',
          profileResult.error.message || 'Profile sync failed after registration.'
        );
        submitButton.disabled = false;
        return;
      }

      window.location.href = './user.html';
      return;
    }

    showAlert(
      alertContainer,
      'info',
      'Check email to confirm'
    );

    setTimeout(() => {
      window.location.href = './login.html';
    }, 1500);
  });
});
