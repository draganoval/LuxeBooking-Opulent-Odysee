export function initFooter() {
  const footerContainer = document.getElementById('app-footer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="bg-light border-top mt-5 py-3">
      <div class="container text-center text-muted small">
        © ${new Date().getFullYear()} LuxeBooking Opulent Odyssey
      </div>
    </footer>
  `;
}
