import { getUser, logoutUser } from '../auth/authService.js';

const baseLinks = [
  { key: 'home', label: 'Home', href: './index.html' },
  { key: 'hotels', label: 'Hotels', href: './hotels.html' },
  { key: 'destinations', label: 'Destinations', href: './destinations.html' },
  { key: 'adventures', label: 'Adventures', href: './adventures.html' },
  { key: 'bookings', label: 'Bookings', href: './bookings.html' },
  { key: 'user', label: 'User', href: './user.html' },
  { key: 'admin', label: 'Admin', href: './admin.html' }
];

const guestLinks = [
  { key: 'login', label: 'Login', href: './login.html' },
  { key: 'register', label: 'Register', href: './register.html' }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHeader(headerContainer, activePage, user) {
  const links = user ? baseLinks : [...baseLinks, ...guestLinks];

  const linksMarkup = links
    .map((link) => {
      const activeClass = link.key === activePage ? 'active' : '';
      return `<li class="nav-item"><a class="nav-link ${activeClass}" href="${link.href}">${link.label}</a></li>`;
    })
    .join('');

  const authMarkup = user
    ? `
      <li class="nav-item d-flex align-items-center me-2 text-light">Hello, ${escapeHtml(user.email ?? 'User')}</li>
      <li class="nav-item"><button id="header-logout-btn" type="button" class="btn btn-outline-light btn-sm">Logout</button></li>
    `
    : '';

  headerContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="./index.html">LuxeBooking</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            ${linksMarkup}
            ${authMarkup}
          </ul>
        </div>
      </div>
    </nav>
  `;

  if (user) {
    const logoutButton = document.getElementById('header-logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = './index.html';
      });
    }
  }
}

export async function refreshAuthHeaderState(activePage) {
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  const { data, error } = await getUser();
  const user = error ? null : data?.user ?? null;

  renderHeader(headerContainer, activePage, user);
}

export function initHeader(activePage) {
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  renderHeader(headerContainer, activePage, null);
  refreshAuthHeaderState(activePage);
}
