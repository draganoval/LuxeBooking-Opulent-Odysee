import { initHeader } from '../ui/header.js';
import { initFooter } from '../ui/footer.js';
import { ensureProfile, loginUser } from '../auth/authService.js';

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
  initHeader('login');
  initFooter();

  const form = document.getElementById('login-form');
  const alertContainer = document.getElementById('auth-alert');
  const submitButton = document.getElementById('login-submit');

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (alertContainer) {
      alertContainer.innerHTML = '';
    }

    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      showAlert(alertContainer, 'danger', 'Email and password are required.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    const { data, error } = await loginUser(email, password);

    if (error) {
      showAlert(alertContainer, 'danger', error.message || 'Login failed.');
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    const profileResult = await ensureProfile();

    if (profileResult.error) {
      showAlert(
        alertContainer,
        'danger',
        profileResult.error.message || 'Profile sync failed after login.'
      );
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    if (data?.session) {
      window.location.href = './user.html';
      return;
    }

    showAlert(alertContainer, 'danger', 'Login did not create an active session.');
    if (submitButton) {
      submitButton.disabled = false;
    }
  });
});
