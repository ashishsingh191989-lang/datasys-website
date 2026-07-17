let catalogue = { meta: {}, products: [] };
let activeCategory = 'All';
let currentVersion = '';

const grid = document.getElementById('productGrid');
const filters = document.getElementById('filters');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');

const escapeHtml = value => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function products() {
  return [...(catalogue.products || [])].sort((a, b) => a.name.localeCompare(b.name));
}

function updateSummary() {
  const list = products();
  const categories = new Set(list.map(product => product.category));
  const offline = list.filter(product => /offline|local-first|private by design/i.test(product.privacy)).length;

  document.getElementById('heroCount').textContent = list.length;
  document.getElementById('productCount').textContent = list.length;
  document.getElementById('categoryCount').textContent = categories.size;
  document.getElementById('offlineCount').textContent = offline;
  document.getElementById('footerMeta').textContent = `${list.length} products across ${categories.size} everyday life areas.`;
}

function buildFilters() {
  const categories = ['All', ...new Set(products().map(product => product.category))];
  filters.innerHTML = categories.map(category => `
    <button class="filter ${category === activeCategory ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join('');

  filters.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      buildFilters();
      render();
    });
  });
}

function matches(product) {
  if (activeCategory !== 'All' && product.category !== activeCategory) return false;
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return true;
  return [
    product.name,
    product.category,
    product.description,
    product.audience,
    product.privacy,
    ...(product.functions || [])
  ].join(' ').toLowerCase().includes(query);
}

function icon(product) {
  if (product.icon) return `<img class="app-icon" src="${escapeHtml(product.icon)}" alt="">`;
  const initials = product.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return `<span class="initial-icon">${escapeHtml(initials || 'D')}</span>`;
}

function privacyLabel(product) {
  if (/offline/i.test(product.privacy || '')) return 'Works offline';
  if (/local-first|private by design/i.test(product.privacy || '')) return 'Private by design';
  return 'DataSys product';
}

function productCard(product) {
  const pageLink = product.publicUrl
    ? `<a class="product-link" href="${escapeHtml(product.publicUrl)}">Explore product →</a>`
    : '';

  return `
    <article class="product-card">
      <div class="card-head">
        ${icon(product)}
        <span class="benefit-badge">${escapeHtml(privacyLabel(product))}</span>
      </div>
      <p class="product-category">${escapeHtml(product.category)}</p>
      <h3>${escapeHtml(product.name)}</h3>
      <p class="product-description">${escapeHtml(product.description)}</p>
      <ul class="function-list">
        ${(product.functions || []).slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      ${pageLink ? `<div class="card-footer">${pageLink}</div>` : ''}
    </article>
  `;
}

function render() {
  const visible = products().filter(matches);
  grid.innerHTML = visible.map(productCard).join('');
  emptyState.hidden = visible.length !== 0;
}

async function loadCatalogue() {
  const response = await fetch(`generated/products.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Catalogue not generated');
  catalogue = await response.json();
  updateSummary();
  buildFilters();
  render();
}

async function checkVersion() {
  try {
    const response = await fetch(`generated/catalog-version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;
    const info = await response.json();
    if (!currentVersion) {
      currentVersion = info.version;
      return;
    }
    if (currentVersion !== info.version) {
      currentVersion = info.version;
      await loadCatalogue();
    }
  } catch {}
}

searchInput.addEventListener('input', render);

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('datasys-public-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('datasys-public-theme', next);
});

loadCatalogue().then(checkVersion).catch(() => {
  document.getElementById('footerMeta').textContent = 'Start the local catalogue to load the product portfolio.';
});
setInterval(checkVersion, 4000);
