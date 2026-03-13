import { getUser, logoutUser } from '../auth/authService.js';
import { supabase } from '../supabaseClient.js';

const baseLinks = [
  { key: 'home', label: 'Home', href: './index.html' },
  { key: 'hotels', label: 'Hotels', href: './hotels.html' },
  { key: 'destinations', label: 'Destinations', href: './destinations.html' },
  { key: 'adventures', label: 'Adventures', href: './adventures.html' },
  { key: 'bookings', label: 'Bookings', href: './bookings.html' }
];

const adminLink = { key: 'admin', label: 'Admin', href: './admin.html' };

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHeader(headerContainer, activePage, user, isAdmin) {
  const links = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  const linksMarkup = links
    .map((link) => {
      const activeClass = link.key === activePage ? 'active' : '';
      const ariaCurrent = link.key === activePage ? 'aria-current="page"' : '';
      return `<li class="nav-item"><a class="nav-link lux-nav-link ${activeClass}" href="${link.href}" ${ariaCurrent}>${link.label}</a></li>`;
    })
    .join('');

  const authMarkup = user
    ? `
      <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 ms-lg-3 mt-3 mt-lg-0">
        <a class="btn btn-sm ${activePage === 'user' ? 'btn-dark' : 'btn-outline-dark'}" href="./user.html">My Account</a>
        <button id="header-logout-btn" type="button" class="btn btn-outline-dark btn-sm">Logout</button>
      </div>
    `
    : `
      <div class="d-flex gap-2 ms-lg-3 mt-3 mt-lg-0">
        <a class="btn btn-sm ${activePage === 'login' ? 'btn-dark' : 'btn-outline-dark'}" href="./login.html">Login</a>
        <a class="btn btn-sm ${activePage === 'register' ? 'btn-dark' : 'btn-outline-dark'}" href="./register.html">Register</a>
      </div>
    `;

  headerContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top lux-navbar">
      <div class="container">
        <a class="navbar-brand lux-brand" href="./index.html">Opulent Odyssey</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${linksMarkup}
          </ul>
          ${authMarkup}
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
  let isAdmin = false;

  if (user?.id) {
    const { data: adminRoleRow, error: adminRoleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    isAdmin = !adminRoleError && Boolean(adminRoleRow);
  }

  renderHeader(headerContainer, activePage, user, isAdmin);
}

export function initHeader(activePage) {
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  renderHeader(headerContainer, activePage, null, false);
  refreshAuthHeaderState(activePage);
}
