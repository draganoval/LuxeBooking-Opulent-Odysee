const navLinks = [
  { key: 'home', label: 'Home', href: './index.html' },
  { key: 'hotels', label: 'Hotels', href: './hotels.html' },
  { key: 'destinations', label: 'Destinations', href: './destinations.html' },
  { key: 'adventures', label: 'Adventures', href: './adventures.html' },
  { key: 'bookings', label: 'Bookings', href: './bookings.html' },
  { key: 'user', label: 'User', href: './user.html' },
  { key: 'admin', label: 'Admin', href: './admin.html' },
  { key: 'login', label: 'Login', href: './login.html' },
  { key: 'register', label: 'Register', href: './register.html' }
];

export function initHeader(activePage) {
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  const linksMarkup = navLinks
    .map((link) => {
      const activeClass = link.key === activePage ? 'active' : '';
      return `<li class="nav-item"><a class="nav-link ${activeClass}" href="${link.href}">${link.label}</a></li>`;
    })
    .join('');

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
          </ul>
        </div>
      </div>
    </nav>
  `;
}
