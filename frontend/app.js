const dom = {
  navLinks: document.querySelectorAll('.nav-link'),
  views: document.querySelectorAll('.view'),
  navAccountBtn: document.getElementById('navAccountBtn'),
  medSearchInput: document.getElementById('medSearchInput'),
  medSearchBtn: document.getElementById('medSearchBtn'),
  searchTags: document.querySelectorAll('.tag'),
  resultsTitle: document.getElementById('resultsTitle'),
  resultsSub: document.getElementById('resultsSub'),
  resultsGrid: document.getElementById('resultsGrid'),
  resultsSection: document.getElementById('resultsSection'),
  sortSelect: document.getElementById('sortSelect'),
  filterInStock: document.getElementById('filterInStock'),
  altSuggestion: document.getElementById('altSuggestion'),
  altChips: document.getElementById('altChips'),
  tickerList: document.getElementById('tickerList'),
  lowStockTable: document.getElementById('lowStockTable'),
  demandList: document.getElementById('demandList'),
  inventoryTable: document.getElementById('inventoryTable'),
  reservationList: document.getElementById('reservationList'),
  trendChart: document.getElementById('trendChart'),
  rxQueue: document.getElementById('rxQueue'),
  uploadRxBtn: document.getElementById('uploadRxBtn'),
  prescriptionInput: document.getElementById('prescriptionInput'),
  collectionTable: document.getElementById('collectionTable'),
  medInfoGrid: document.getElementById('medInfoGrid'),
  verificationTable: document.getElementById('verificationTable'),
  auditTable: document.getElementById('auditTable'),
  adminTrendChart: document.getElementById('adminTrendChart'),
  toast: document.getElementById('toast'),
  reserveModal: document.getElementById('reserveModal'),
  reserveStep1: document.getElementById('reserveStep1'),
  reserveStep2: document.getElementById('reserveStep2'),
  reserveMedName: document.getElementById('reserveMedName'),
  reservePharmName: document.getElementById('reservePharmName'),
  qtyInput: document.getElementById('qtyInput'),
  qtyMinus: document.getElementById('qtyMinus'),
  qtyPlus: document.getElementById('qtyPlus'),
  confirmReserveBtn: document.getElementById('confirmReserveBtn'),
  doneReserveBtn: document.getElementById('doneReserveBtn'),
  closeReserve: document.getElementById('closeReserve'),
  pageLinks: document.querySelectorAll('[data-page-link]'),
};

const state = {
  currentSearchKey: '',
  currentMedicine: null,
  currentResultItem: null,
  currentMaxQty: null,
  showInStockOnly: false,
  currentUser: null,
  authToken: null,
  assistantMessages: [],
  currentPrescriptionId: null,
};

const STORAGE_KEYS = {
  user: 'medifind-user',
  token: 'medifind-token',
  assistant: 'medifind-assistant',
  preferences: 'medifind-preferences',
};

const API_BASE_URL = localStorage.getItem('medifind-api-url') || 'http://localhost:5000';
const DEMO_PASSWORD = 'Demo@12345';
const SEEDED_PASSWORDS = {
  'admin@medifind.test': 'Admin@1234',
  'customer@medifind.test': 'Customer@1234',
  'pharmacist@medifind.test': 'Pharmacist@1234',
};

const readJson = (key, fallbackValue) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

const roleToApiRole = (role) => {
  const roleMap = {
    customer: 'CUSTOMER',
    pharmacist: 'PHARMACIST',
    admin: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
    PHARMACIST: 'PHARMACIST',
    ADMIN: 'ADMIN',
    PHARMACY_OWNER: 'PHARMACY_OWNER',
  };

  return roleMap[role] || 'CUSTOMER';
};

const roleFromApiRole = (role) => String(role || 'CUSTOMER').toLowerCase();

const injectEnhancements = () => {
  if (document.getElementById('assistantDock')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="assistant-dock" id="assistantDock">
      <button class="assistant-fab" id="assistantFab" type="button">
        <span class="assistant-fab-dot"></span>
        <span>Ask JSL Assist</span>
      </button>
      <aside class="assistant-panel" id="assistantPanel" aria-hidden="true">
        <div class="assistant-panel-head">
          <div>
            <p class="assistant-kicker">JSL Assist</p>
            <h3>Medicine help, sign-in help, and page guidance</h3>
          </div>
          <button class="assistant-close" id="assistantClose" type="button">&times;</button>
        </div>
        <div class="assistant-messages" id="assistantMessages" role="log" aria-live="polite"></div>
        <div class="assistant-suggestions">
          <button class="assistant-chip" type="button" data-assist="How do I reserve medicine?">Reserve medicine</button>
          <button class="assistant-chip" type="button" data-assist="Help me sign in">Sign in</button>
          <button class="assistant-chip" type="button" data-assist="Show me Paracetamol">Paracetamol</button>
        </div>
        <form class="assistant-form" id="assistantForm">
          <input id="assistantInput" type="text" placeholder="Ask about stock, reservations, or pages…" autocomplete="off">
          <button type="submit">Send</button>
        </form>
      </aside>
    </div>

    <input type="file" id="prescriptionInput" accept=".pdf,.jpg,.jpeg,.png,.txt" hidden>
  `);
};

const cacheEnhancementDom = () => {
  dom.assistantDock = document.getElementById('assistantDock');
  dom.assistantFab = document.getElementById('assistantFab');
  dom.assistantPanel = document.getElementById('assistantPanel');
  dom.assistantMessages = document.getElementById('assistantMessages');
  dom.assistantForm = document.getElementById('assistantForm');
  dom.assistantInput = document.getElementById('assistantInput');
  dom.authModal = document.getElementById('authModal');
  dom.closeAuth = document.getElementById('closeAuth');
  dom.uploadRxBtn = document.getElementById('uploadRxBtn');
  dom.prescriptionInput = document.getElementById('prescriptionInput');
  dom.authForm = document.getElementById('authForm');
  dom.authTitle = document.getElementById('authTitle');
  dom.authSubtitle = document.getElementById('authSubtitle');
  dom.authName = document.getElementById('authName');
  dom.authEmail = document.getElementById('authEmail');
  dom.authRole = document.getElementById('authRole');
  dom.authSubmit = document.getElementById('authSubmit');
  dom.authSignOut = document.getElementById('authSignOut');
};

const persistPreferences = () => {
  writeJson(STORAGE_KEYS.preferences, {
    search: state.currentSearchKey,
    sort: dom.sortSelect?.value || 'distance',
    inStockOnly: state.showInStockOnly,
  });
};

const loadPreferences = () => {
  const preferences = readJson(STORAGE_KEYS.preferences, {});
  if (dom.medSearchInput && preferences.search) {
    dom.medSearchInput.value = preferences.search;
    state.currentSearchKey = preferences.search;
  }
  if (dom.sortSelect && preferences.sort) {
    dom.sortSelect.value = preferences.sort;
  }
  state.showInStockOnly = Boolean(preferences.inStockOnly);
  if (dom.filterInStock) {
    dom.filterInStock.classList.toggle('active', state.showInStockOnly);
  }
};

const renderAuthState = () => {
  const userStr = localStorage.getItem('medifind-user');
  const navBtn = document.getElementById('navAccountBtn');
  
  if (!navBtn) return;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const safeName = user.name || 'User'; 
      const initial = safeName.charAt(0).toUpperCase();
      const firstName = safeName.split(' ')[0];

      // User IS logged in -> Show Name and make it a Logout button
      navBtn.innerHTML = `
        <span class="user-avatar" style="background: var(--ink); color: white; padding: 4px 8px; border-radius: 50%; margin-right: 8px; font-size: 0.8rem;">
          ${initial}
        </span>
        ${firstName} (Logout)
      `;

      navBtn.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('medifind-token');
        localStorage.removeItem('medifind-user');
        window.location.href = 'login.html'; // Kick them back to login page
      };
      
    } catch (e) {
      // If data is corrupted, default to logged out state
      navBtn.textContent = 'Sign in';
      navBtn.onclick = () => window.location.href = 'login.html';
    }
  } else {
    // User IS NOT logged in -> Send them to the real login page
    navBtn.textContent = 'Sign in';
    navBtn.onclick = () => window.location.href = 'login.html';
  }
};
const enforceRoleAccess = () => {
  const userStr = localStorage.getItem('medifind-user');
  if (!userStr) return;
  
  const user = JSON.parse(userStr);
  const role = user.role;

  // Find all navigation links across the platform
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    // Check where the link is trying to go (either via data-view or href)
    const target = link.dataset.view || link.getAttribute('href') || '';

    // Define which roles are allowed to see which links
    let allowedRoles = [];
    
    if (target.includes('customer') || target.includes('index.html')) {
      allowedRoles = ['CUSTOMER', 'PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('pharmacist') || target.includes('pharmacist-desk.html')) {
      allowedRoles = ['PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('pharmacy') || target.includes('pharmacy-dashboard.html')) {
      allowedRoles = ['OWNER', 'ADMIN', 'SUPER_ADMIN'];
    } else if (target.includes('admin') || target.includes('admin-console.html')) {
      allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
    }

    // Hide the link completely if the user's role is not authorized
    if (!allowedRoles.includes(role)) {
      link.style.display = 'none';
    }
  });
};
const openAuthModal = () => {
  const userStr = localStorage.getItem('medifind-user');
  if (userStr) {
    // If logged in, clicking logs them out
    localStorage.removeItem('medifind-token');
    localStorage.removeItem('medifind-user');
    window.location.href = 'login.html';
  } else {
    // If not logged in, send to the real login page
    window.location.href = 'login.html';
  }
};

const closeAuthModal = () => {
  if (!dom.authModal) return;
  dom.authModal.classList.remove('active');
};

const signOut = () => {
  state.currentUser = null;
  state.authToken = null;
  state.currentPrescriptionId = null;
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.token);
  renderAuthState();
  closeAuthModal();
  void renderAccountActivity();
  toastMessage('Signed out on this device.');
};

const ensureActivityPanel = () => {
  if (!dom.resultsSection) return null;
  let panel = dom.resultsSection.querySelector('[data-user-activity]');
  if (!panel) {
    dom.resultsSection.insertAdjacentHTML('beforeend', `
      <div class="panel-card" data-user-activity style="margin-top:20px;">
        <div class="panel-card-head">
          <h3>Your activity</h3>
          <span class="badge">Reservations & prescriptions</span>
        </div>
        <div data-user-activity-body></div>
      </div>
    `);
    panel = dom.resultsSection.querySelector('[data-user-activity]');
  }
  return panel;
};

const renderAccountActivity = async () => {
  const panel = ensureActivityPanel();
  const body = panel?.querySelector('[data-user-activity-body]');
  if (!body) return;

  if (!state.currentUser || !state.authToken) {
    body.innerHTML = '<p class="muted">Sign in to see your reservations and prescriptions.</p>';
    return;
  }

  body.innerHTML = '<p class="muted">Loading your recent activity…</p>';

  try {
    const [reservationsPayload, prescriptionsPayload] = await Promise.all([
      apiFetch('/api/reservations').catch(() => ({ success: true, data: [] })),
      apiFetch('/api/prescriptions').catch(() => ({ success: true, data: [] })),
    ]);

    const reservations = (reservationsPayload.data || []).slice(0, 3).map((reservation) => ({
      kind: 'reservation',
      title: reservation.items?.[0]?.medicine?.brandName || 'Medicine reservation',
      detail: `${reservation.items?.length || 1} item${reservation.items?.length === 1 ? '' : 's'} • ${reservation.pharmacy?.name || 'Pharmacy'}`,
      status: reservation.status,
      pillClass: reservation.status === 'COLLECTED' ? 'ok' : reservation.status === 'REJECTED' ? 'danger' : 'neutral',
      when: new Date(reservation.createdAt).toLocaleString(),
      code: reservation.reservationCode,
    }));

    const prescriptions = (prescriptionsPayload.data || []).slice(0, 3).map((prescription) => ({
      kind: 'prescription',
      title: 'Prescription upload',
      detail: prescription.fileUrl || 'Uploaded prescription',
      status: prescription.status,
      pillClass: prescription.status === 'APPROVED' ? 'ok' : prescription.status === 'REJECTED' ? 'danger' : 'neutral',
      when: new Date(prescription.createdAt).toLocaleString(),
      code: prescription.id,
    }));

    const items = [...reservations, ...prescriptions]
      .sort((a, b) => new Date(b.when) - new Date(a.when))
      .slice(0, 5);

    if (!items.length) {
      body.innerHTML = '<p class="muted">No reservations or prescriptions yet.</p>';
      return;
    }

    body.innerHTML = `
      <div class="reservation-list">
        ${items.map((item) => `
          <article class="reservation-row">
            <div class="reservation-info">
              <span class="reservation-id-mono">${escapeHtml(item.kind === 'reservation' ? item.code : item.code)}</span>
              <span class="reservation-customer">${escapeHtml(item.title)}</span>
              <span class="reservation-detail">${escapeHtml(item.detail)}</span>
            </div>
            <div class="reservation-actions">
              <span class="pill pill-${item.pillClass}">${escapeHtml(item.status)}</span>
              <span class="reservation-detail">${escapeHtml(item.when)}</span>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  } catch (error) {
    body.innerHTML = '<p class="muted">We could not load your recent activity right now.</p>';
  }
};

const uploadPrescriptionFile = async (file) => {
  if (!file) return;
  if (!state.authToken) {
    toastMessage('Please sign in before uploading a prescription.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state.authToken}`,
      },
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Prescription upload failed');
    }

    state.currentPrescriptionId = payload.data?.id || null;
    void renderAccountActivity();
    toastMessage('Prescription uploaded successfully.');
  } catch (error) {
    toastMessage(`Prescription upload failed: ${error.message}`);
  }
};

const getPasswordForProfile = (profile) => {
  return SEEDED_PASSWORDS[profile.email.toLowerCase()] || DEMO_PASSWORD;
};

const saveProfile = async (event) => {
  event.preventDefault();
  const profile = {
    name: dom.authName.value.trim(),
    email: dom.authEmail.value.trim().toLowerCase(),
    role: roleToApiRole(dom.authRole.value),
  };
  if (!profile.name || !profile.email) return;

  const password = getPasswordForProfile(profile);
  const previousLabel = dom.authSubmit?.textContent;
  if (dom.authSubmit) {
    dom.authSubmit.disabled = true;
    dom.authSubmit.textContent = 'Connecting...';
  }

  try {
    let authPayload;

    try {
      authPayload = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...profile, password }),
      });
    } catch (error) {
      if (!/already registered/i.test(error.message)) throw error;
      authPayload = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: profile.email, password }),
      });
    }

    state.currentUser = {
      ...authPayload.user,
      role: roleFromApiRole(authPayload.user.role),
    };
    state.authToken = authPayload.token;
    writeJson(STORAGE_KEYS.user, state.currentUser);
    localStorage.setItem(STORAGE_KEYS.token, state.authToken);
    renderAuthState();
    closeAuthModal();
    void renderAccountActivity();
    toastMessage(`Welcome, ${state.currentUser.name.split(' ')[0]}.`);
  } catch (error) {
    toastMessage(`Sign in failed: ${error.message}`);
  } finally {
    if (dom.authSubmit) {
      dom.authSubmit.disabled = false;
      dom.authSubmit.textContent = previousLabel || 'Save profile';
    }
  }
};

const loadProfile = async () => {
  // 1. Grab data from local storage
  state.currentUser = readJson('medifind-user', null);
  state.authToken = localStorage.getItem('medifind-token');
  renderAuthState(); // Update the button immediately

  if (!state.authToken) return;

  // 2. Try to verify with backend in the background
  try {
    const payload = await apiFetch('/api/auth/me');
    if (payload?.user) {
      state.currentUser = {
        ...payload.user,
        role: String(payload.user.role || 'CUSTOMER').toUpperCase(),
      };
      writeJson('medifind-user', state.currentUser);
      renderAuthState();
    }
  } catch (error) {
    // If backend ping fails, log the error but DO NOT delete the session!
    console.warn("Backend validation ping failed, but keeping session active:", error);
  }
};
const loadAssistantHistory = () => {
  const savedMessages = readJson(STORAGE_KEYS.assistant, []);
  state.assistantMessages = savedMessages.length ? savedMessages : [
    { role: 'assistant', text: 'I can help you search medicines, reserve stock, sign in, or jump to a dashboard.' },
  ];
};

const renderAssistantMessages = () => {
  if (!dom.assistantMessages) return;
  dom.assistantMessages.innerHTML = state.assistantMessages.map((message) => `
    <div class="assistant-bubble ${message.role === 'user' ? 'user' : 'assistant'}">
      <span>${escapeHtml(message.text)}</span>
    </div>
  `).join('');
  dom.assistantMessages.scrollTop = dom.assistantMessages.scrollHeight;
};

const storeAssistantMessage = (message) => {
  state.assistantMessages.push(message);
  if (state.assistantMessages.length > 40) {
    state.assistantMessages = state.assistantMessages.slice(-40);
  }
  writeJson(STORAGE_KEYS.assistant, state.assistantMessages);
  renderAssistantMessages();
};

const findMedicineMatch = (text) => {
  const query = text.toLowerCase();
  return Object.values(MEDICINES_DB).find((medicine) => {
    if (query.includes(medicine.name.toLowerCase()) || query.includes(medicine.generic.toLowerCase())) return true;
    return (medicine.brands || []).some((brand) => query.includes(brand.toLowerCase()));
  });
};

const getAssistantReply = (text) => {
  const query = text.toLowerCase();
  const matchedMedicine = findMedicineMatch(text);

  if (/^(hi|hello|hey)\b/.test(query)) {
    return 'Hello. I can help you search medicine, reserve stock, sign in, or move between the dashboard pages.';
  }
  if (query.includes('sign in') || query.includes('login') || query.includes('account')) {
    return 'Use the Sign in button in the header to save your profile. Your name, email, and role are stored on this device.';
  }
  if (query.includes('reserve') || query.includes('booking') || query.includes('hold stock')) {
    return 'Search a medicine first, then use Reserve on a result card. I can help you find in-stock options before you confirm.';
  }
  if (query.includes('pharmacy') || query.includes('dashboard')) {
    return 'The site includes Pharmacy Dashboard, Pharmacist Desk, and Admin Console pages. Use the header tabs to switch between them.';
  }
  if (matchedMedicine) {
    const topResult = matchedMedicine.results[0];
    const stockNote = matchedMedicine.requiresRx ? 'It requires a prescription.' : 'It is available without a prescription.';
    return `${matchedMedicine.name} is tracked here. The nearest listed pharmacy is ${topResult.pharmacy}, about ${formatDistance(topResult.distance)}, with ${topResult.qty} units at ${formatCurrency(topResult.price)}. ${stockNote}`;
  }
  if (query.includes('search')) {
    return 'Use the search box at the top of the page, then sort by distance, price, or stock.';
  }
  return 'I can help with medicine search, reservations, sign in, and navigating the site. Ask me about a medicine name to get started.';
};

const openAssistant = () => {
  if (!dom.assistantPanel) return;
  dom.assistantPanel.classList.add('active');
  dom.assistantPanel.setAttribute('aria-hidden', 'false');
  dom.assistantFab?.setAttribute('aria-expanded', 'true');
  dom.assistantInput?.focus();
};

const closeAssistant = () => {
  if (!dom.assistantPanel) return;
  dom.assistantPanel.classList.remove('active');
  dom.assistantPanel.setAttribute('aria-hidden', 'true');
  dom.assistantFab?.setAttribute('aria-expanded', 'false');
};

const toggleAssistant = () => {
  if (!dom.assistantPanel) return;
  if (dom.assistantPanel.classList.contains('active')) {
    closeAssistant();
  } else {
    openAssistant();
  }
};

const submitAssistantMessage = (rawText) => {
  const text = rawText.trim();
  if (!text) return;
  storeAssistantMessage({ role: 'user', text });
  storeAssistantMessage({ role: 'assistant', text: getAssistantReply(text) });
};

const formatCurrency = (value) => `₹${Number(value).toFixed(0)}`;
const formatDistance = (value) => `${Number(value).toFixed(1)} km`;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const toastMessage = (message) => {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  window.clearTimeout(dom.toast.timer);
  dom.toast.timer = window.setTimeout(() => dom.toast.classList.remove('show'), 2500);
};

const setActiveNav = (view) => {
  dom.navLinks.forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  dom.views.forEach((panel) => panel.classList.toggle('active', panel.id === `view-${view}`));
};

const setActiveDashboardPanel = (root, defaultPanel) => {
  if (!root) return;
  const buttons = root.querySelectorAll('.dash-nav-item');
  const panels = root.closest('.dash-shell')?.querySelectorAll('.dash-panel') || [];

  const activatePanel = (panelName) => {
    buttons.forEach((button) => button.classList.toggle('active', button.dataset.panel === panelName));
    panels.forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${panelName}`));
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => activatePanel(button.dataset.panel));
  });

  activatePanel(defaultPanel || buttons[0]?.dataset.panel);
};

const renderTicker = () => {
  if (!dom.tickerList) return;
  dom.tickerList.innerHTML = TICKER_ITEMS.map((item) => `
    <div class="ticker-item">
      <div class="ticker-item-left">
        <span class="pulse-dot pulse-dot--sm ${item.status === 'in' ? 'live' : item.status === 'low' ? 'low' : 'out'}"></span>
        <div>
          <div class="ticker-med">${escapeHtml(item.med)}</div>
          <span class="ticker-pharmacy">${escapeHtml(item.pharmacy)}</span>
        </div>
      </div>
      <span class="ticker-status ${item.status}">${item.status.toUpperCase()}</span>
    </div>
  `).join('');
};

const renderAltSuggestions = (query) => {
  if (!dom.altSuggestion || !dom.altChips) return;
  const suggestions = ALTERNATIVE_SUGGESTIONS[query] || [];
  if (!suggestions.length) {
    dom.altSuggestion.hidden = true;
    dom.altChips.innerHTML = '';
    return;
  }

  dom.altSuggestion.hidden = false;
  dom.altChips.innerHTML = suggestions.map((alt) => `<button class="tag" type="button" data-alt="${escapeHtml(alt)}">${escapeHtml(alt)}</button>`).join('');
  dom.altChips.querySelectorAll('[data-alt]').forEach((button) => {
    button.addEventListener('click', () => {
      const alt = button.dataset.alt || '';
      if (dom.medSearchInput) dom.medSearchInput.value = alt;
      state.currentSearchKey = alt;
      renderSearchResults();
    });
  });
};

const normalizeApiMedicine = (medicine) => ({
  id: medicine.id,
  name: medicine.brandName,
  generic: medicine.genericName,
  dosage: [medicine.dosageForm, medicine.strength].filter(Boolean).join(' '),
  requiresRx: Boolean(medicine.prescriptionRequired),
  maxReservation: DEFAULT_MAX_RESERVATION,
  saltComposition: medicine.saltComposition,
  hsnCode: medicine.hsnCode,
  packSize: medicine.packSize,
  gstRate: medicine.gstRate,
  results: (medicine.pharmacies || []).map((item, index) => ({
    pharmacy: item.pharmacyName,
    pharmacyId: item.pharmacyId,
    medicineId: medicine.id,
    batchId: item.batchId,
    batchNumber: item.batchNumber,
    distance: item.distance || Number((0.6 + index * 0.5).toFixed(1)),
    price: item.sellingPrice,
    mrp: item.mrp,
    ptr: item.ptr,
    qty: item.availableQuantity,
    updated: 'just now',
    expiryDate: item.expiryDate,
    rackNumber: item.rackNumber,
    shelfNumber: item.shelfNumber,
    supplierName: item.supplierName,
  })),
});

const searchMedicinesFromApi = async (query) => {
  const payload = await apiFetch(`/api/medicines?q=${encodeURIComponent(query)}`);
  return (payload.data || []).map(normalizeApiMedicine);
};

const bindReserveButtons = () => {
  document.querySelectorAll('.result-reserve').forEach((button) => {
    button.addEventListener('click', () => {
      if (!state.currentMedicine) return;
      const item = state.currentMedicine.results.find((result) => result.pharmacyId === button.dataset.pharmacyId);
      if (!item) return;
      state.currentResultItem = item;
      openReserveModal(state.currentMedicine.name, item.pharmacy);
    });
  });
};

const openReserveModal = (medicineName, pharmacyName) => {
  if (!dom.reserveModal) return;
  if (dom.reserveMedName) dom.reserveMedName.textContent = medicineName;
  if (dom.reservePharmName) dom.reservePharmName.textContent = pharmacyName;
  if (dom.qtyInput) dom.qtyInput.value = 1;

  // Use per-medicine maxReservation if set, otherwise fall back to admin-configured global cap
 const med = state.currentMedicine;
const globalCap = parseInt(localStorage.getItem('medifind-resv-cap'), 10) || DEFAULT_MAX_RESERVATION;
const maxQty = (med && med.maxReservation) ? med.maxReservation : globalCap;

if (dom.qtyInput) dom.qtyInput.max = maxQty;
state.currentMaxQty = maxQty;

  if (dom.reserveStep1) dom.reserveStep1.hidden = false;
  if (dom.reserveStep2) dom.reserveStep2.hidden = true;
  dom.reserveModal.classList.add('active');
};

const closeReserveModal = () => {
  if (!dom.reserveModal) return;
  dom.reserveModal.classList.remove('active');
};

const renderSearchResults = async () => {
  if (!dom.resultsGrid) return;

  const query = state.currentSearchKey.trim();
  if (!query) {
    dom.resultsTitle.textContent = 'Search a medicine to see live pharmacy stock';
    dom.resultsSub.textContent = 'Results show distance, price, and exact quantity on shelf - updated within minutes.';
    dom.resultsGrid.innerHTML = '';
    if (dom.altSuggestion) dom.altSuggestion.hidden = true;
    state.currentMedicine = null;
    return;
  }

  dom.resultsTitle.textContent = `Searching “${query}”...`;
  dom.resultsSub.textContent = 'Fetching live stock from the backend.';
  dom.resultsGrid.innerHTML = '<div class="empty-state"><p>Searching live inventory…</p></div>';

  try {
    const medicines = await searchMedicinesFromApi(query);
    const medicine = medicines.find((item) => {
      const haystack = `${item.name} ${item.generic} ${item.saltComposition || ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    }) || medicines[0] || null;

    state.currentMedicine = medicine;

    if (!medicine || !medicine.results.length) {
      dom.resultsTitle.textContent = `No live results for “${query}”`;
      dom.resultsSub.textContent = 'Try a generic name or another common brand.';
      dom.resultsGrid.innerHTML = '<div class="empty-state"><p>No pharmacies currently list that medicine.</p></div>';
      if (dom.altSuggestion) dom.altSuggestion.hidden = true;
      return;
    }

    dom.resultsTitle.textContent = `${medicine.name} available nearby`;
    dom.resultsSub.textContent = medicine.requiresRx ? 'Prescription required for this medicine.' : 'Live stock and pricing across nearby pharmacies.';

    const results = medicine.results.slice();
    const sortValue = dom.sortSelect?.value || 'distance';
    if (sortValue === 'distance') results.sort((a, b) => a.distance - b.distance);
    if (sortValue === 'price') results.sort((a, b) => a.price - b.price);
    if (sortValue === 'stock') results.sort((a, b) => b.qty - a.qty);

    const filtered = results.filter((item) => (state.showInStockOnly ? item.qty > 0 : true));
    dom.resultsGrid.innerHTML = filtered.length ? filtered.map((item) => {
     const currentQty = item.qty || 0;
      const outOfStock = currentQty === 0;
      
      const stockClass = outOfStock ? 'out-stock' : currentQty <= 10 ? 'low-stock' : 'in-stock';
      const stockLabel = outOfStock ? 'Out of stock' : `${currentQty} units`;

      return `
        <article class="result-card" data-pharmacy="${escapeHtml(item.pharmacy)}">
          <div class="result-pharmacy">
            <div class="result-pharmacy-name">${escapeHtml(item.pharmacy)}</div>
            <div class="result-meta">
              <span>${formatDistance(item.distance)}</span>
              <span>•</span>
              <span>Updated ${escapeHtml(item.updated)}</span>
            </div>
          </div>
          <div class="result-col">
            <span class="result-col-label">Price</span>
            <span class="result-col-value price">${formatCurrency(item.price)}</span>
          </div>
          <div class="result-col">
            <span class="result-col-label">Quantity</span>
            <span class="result-col-value">${stockLabel}</span>
          </div>
          <div class="stock-status ${stockClass}">
            <span class="pulse-dot pulse-dot--sm ${outOfStock ? 'out' : item.qty <= 10 ? 'low' : 'live'}"></span>
            ${outOfStock ? 'Unavailable' : currentQty <= 10 ? 'Low stock' : 'In stock'}
          </div>
<button class="btn-reserve result-reserve" data-pharmacy-id="${item.pharmacyId}" data-pharmacy="${escapeHtml(item.pharmacy)}" ${outOfStock ? 'disabled' : ''}>Reserve</button>        </article>
      `;
    }).join('') : '<div class="empty-state"><p>No pharmacies match your filters. Try removing the in-stock filter or searching a nearby alternative.</p></div>';

    renderAltSuggestions(query);
    bindReserveButtons();
  } catch (error) {
    state.currentMedicine = null;
    dom.resultsTitle.textContent = 'Unable to load live inventory';
    dom.resultsSub.textContent = 'The backend search is temporarily unavailable.';
    dom.resultsGrid.innerHTML = '<div class="empty-state"><p>Unable to load live inventory right now.</p></div>';
    if (dom.altSuggestion) dom.altSuggestion.hidden = true;
  }
};

const confirmReservation = async () => {
  if (!state.currentResultItem || !dom.qtyInput || !dom.reserveStep1 || !dom.reserveStep2) return;

  if (!state.currentUser || !state.authToken) {
    toastMessage('Please sign in before reserving medicine.');
    return;
  }

  if (state.currentMedicine?.requiresRx && !state.currentPrescriptionId) {
    toastMessage('This medicine requires an approved prescription before reservation.');
    return;
  }

const qty = Math.max(1, Number(dom.qtyInput.value) || 1);

  try {
    const payload = await apiFetch('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        pharmacyId: state.currentResultItem.pharmacyId,
        medicineId: state.currentResultItem.medicineId,
        quantity: qty,
        prescriptionId: state.currentPrescriptionId || undefined,
      }),
    });

    dom.reserveStep1.hidden = true;
    dom.reserveStep2.hidden = false;

    const reservationIdDisplay = document.getElementById('reservationIdDisplay');
    if (reservationIdDisplay) {
      reservationIdDisplay.textContent = payload.data?.reservationCode || 'MF-000000';
    }

    await renderSearchResults();
    void renderAccountActivity();
    toastMessage('Reservation confirmed.');
  } catch (error) {
    toastMessage(`Reservation failed: ${error.message}`);
  }
};

const renderLowStockTable = () => {
  if (!dom.lowStockTable) return;
  dom.lowStockTable.innerHTML = `
    <thead>
      <tr><th>Medicine</th><th>Batch</th><th>Qty</th><th>Threshold</th></tr>
    </thead>
    <tbody>
      ${LOW_STOCK_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.batch)}</td>
          <td>${item.qty}</td>
          <td>${item.threshold}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderDemandList = () => {
  if (!dom.demandList) return;
  const maxValue = Math.max(...DEMAND_DATA.map((item) => item.value), 1);
  dom.demandList.innerHTML = DEMAND_DATA.map((item) => {
    const percent = Math.round((item.value / maxValue) * 100);
    return `
      <div class="bar-row">
        <div class="bar-row-label">
          <span>${escapeHtml(item.name)}</span>
          <span>${item.value}</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width: ${percent}%"></div></div>
      </div>
    `;
  }).join('');
};

const renderInventoryTable = () => {
  if (!dom.inventoryTable) return;
  dom.inventoryTable.innerHTML = `
    <thead>
      <tr><th>Medicine</th><th>Batch</th><th>Qty</th><th>Price</th><th>Expiry</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${INVENTORY_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.batch)}</td>
          <td>${item.qty}</td>
          <td>${formatCurrency(item.price)}</td>
          <td>${escapeHtml(item.expiry)}</td>
          <td><span class="pill pill-${item.status === 'ok' ? 'ok' : item.status === 'low' ? 'warn' : 'danger'}">${escapeHtml(item.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderReservationList = () => {
  if (!dom.reservationList) return;
  dom.reservationList.innerHTML = RESERVATIONS_DATA.map((item) => `
    <article class="reservation-row">
      <div class="reservation-info">
        <span class="reservation-id-mono">${escapeHtml(item.id)}</span>
        <span class="reservation-customer">${escapeHtml(item.customer)}</span>
        <span class="reservation-detail">${escapeHtml(item.medicine)} • ${item.qty} units</span>
      </div>
      <div class="reservation-actions">
        <span class="pill pill-${item.status === 'collected' ? 'ok' : item.status === 'accepted' ? 'neutral' : 'warn'}">${escapeHtml(item.status.replace('_', ' '))}</span>
        <span class="reservation-detail">${escapeHtml(item.time)}</span>
      </div>
    </article>
  `).join('');
};

const renderTrendChart = (svg, data, color = '#0f766e') => {
  if (!svg || !data.length) return;
  const width = 600;
  const height = 220;
  const padding = 26;
  const maxVal = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2) / Math.max(data.length - 1, 1));
    const y = height - padding - ((item.value / maxVal) * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendGradient-${color.replace('#', '')}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon points="${points} ${width - padding},${height - padding} ${padding},${height - padding}" fill="url(#trendGradient-${color.replace('#', '')})" />
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    ${data.map((item, index) => {
      const x = padding + (index * (width - padding * 2) / Math.max(data.length - 1, 1));
      const y = height - padding - ((item.value / maxVal) * (height - padding * 2));
      return `<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${color}" stroke-width="3"></circle>`;
    }).join('')}
  `;
};

const renderRxQueue = () => {
  const rxQueue = document.getElementById('rxQueue');
  if (!rxQueue) return;
  
  // Clean empty state ready for backend integration
  rxQueue.innerHTML = `
    <div class="empty-state" style="background: #fff; padding: 40px; border-radius: var(--radius-md); box-shadow: var(--shadow-card);">
      <p style="margin: 0; color: var(--slate);">No pending prescriptions to review.</p>
    </div>
  `;
};

const renderCollectionTable = () => {
  if (!dom.collectionTable) return;
  dom.collectionTable.innerHTML = `
    <thead>
      <tr><th>Reservation</th><th>Customer</th><th>Medicine</th><th>Qty</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${COLLECTION_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.customer)}</td>
          <td>${escapeHtml(item.medicine)}</td>
          <td>${item.qty}</td>
          <td><span class="pill pill-${item.status === 'collected' ? 'ok' : 'neutral'}">${escapeHtml(item.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderMedInfoGrid = () => {
  if (!dom.medInfoGrid) return;
  dom.medInfoGrid.innerHTML = MED_INFO_DATA.map((item) => `
    <article class="med-info-card">
      <h3>${escapeHtml(item.name)}</h3>
      <div class="med-info-row"><span>Generic</span><span>${escapeHtml(item.generic)}</span></div>
      <div class="med-info-row"><span>Dosage</span><span>${escapeHtml(item.dosage)}</span></div>
      <div class="med-info-row"><span>Alternatives</span><span>${escapeHtml(item.alt)}</span></div>
    </article>
  `).join('');
};

const renderVerificationTable = () => {
  if (!dom.verificationTable) return;
  dom.verificationTable.innerHTML = `
    <thead>
      <tr><th>Pharmacy</th><th>Owner</th><th>License</th><th>Submitted</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${VERIFICATION_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.owner)}</td>
          <td>${escapeHtml(item.license)}</td>
          <td>${escapeHtml(item.submitted)}</td>
          <td><span class="pill pill-${item.status === 'approved' ? 'ok' : 'warn'}">${escapeHtml(item.status)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const renderAuditTable = () => {
  if (!dom.auditTable) return;
  dom.auditTable.innerHTML = `
    <thead>
      <tr><th>Time</th><th>Actor</th><th>Action</th><th>Level</th></tr>
    </thead>
    <tbody>
      ${AUDIT_DATA.map((item) => `
        <tr>
          <td>${escapeHtml(item.time)}</td>
          <td>${escapeHtml(item.actor)}</td>
          <td>${escapeHtml(item.action)}</td>
          <td><span class="pill pill-${escapeHtml(item.level)}">${escapeHtml(item.level)}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
};

const setupEventListeners = () => {
  dom.navLinks.forEach((button) => {
    button.addEventListener('click', () => setActiveNav(button.dataset.view));
  });

  dom.searchTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const query = tag.dataset.q || '';
      if (dom.medSearchInput) dom.medSearchInput.value = query;
      state.currentSearchKey = query;
      void renderSearchResults();
    });
  });

 if (dom.medSearchBtn) {
    dom.medSearchBtn.addEventListener('click', () => {
      const query = dom.medSearchInput.value.trim();
      if (!query) return;
      state.currentSearchKey = query;
      void renderSearchResults();
      persistPreferences();
    });
  }

  if (dom.medSearchInput) {
    dom.medSearchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        state.currentSearchKey = dom.medSearchInput.value.trim();
        void renderSearchResults();
        persistPreferences();
      }
    });
    dom.medSearchInput.addEventListener('input', () => {
      state.currentSearchKey = dom.medSearchInput.value;
      persistPreferences();
    });
  }

  if (dom.sortSelect) {
    dom.sortSelect.addEventListener('change', () => {
      void renderSearchResults();
      persistPreferences();
    });
  }

  if (dom.filterInStock) {
    dom.filterInStock.addEventListener('click', () => {
      state.showInStockOnly = !state.showInStockOnly;
      dom.filterInStock.classList.toggle('active', state.showInStockOnly);
      void renderSearchResults();
      persistPreferences();
    });
  }

 

  if (dom.closeReserve) dom.closeReserve.addEventListener('click', closeReserveModal);
  if (dom.reserveModal) {
    dom.reserveModal.addEventListener('click', (event) => {
      if (event.target === dom.reserveModal) closeReserveModal();
    });
  }
  if (dom.qtyMinus && dom.qtyInput) {
    dom.qtyMinus.addEventListener('click', () => {
      const value = Number(dom.qtyInput.value) || 1;
      dom.qtyInput.value = Math.max(1, value - 1);
    });
  }
  if (dom.qtyPlus && dom.qtyInput) {
   dom.qtyPlus.addEventListener('click', () => {
    const value = Number(dom.qtyInput.value) || 1;
    const maxQty = state.currentMaxQty || DEFAULT_MAX_RESERVATION;
    dom.qtyInput.value = Math.min(maxQty, value + 1);
});
  }
  if (dom.confirmReserveBtn) dom.confirmReserveBtn.addEventListener('click', () => { void confirmReservation(); });
  if (dom.doneReserveBtn) dom.doneReserveBtn.addEventListener('click', closeReserveModal);

  if (dom.uploadRxBtn) {
    dom.uploadRxBtn.addEventListener('click', () => dom.prescriptionInput?.click());
  }
  if (dom.prescriptionInput) {
    dom.prescriptionInput.addEventListener('change', (event) => {
      const [file] = event.target.files || [];
      if (file) {
        void uploadPrescriptionFile(file);
      }
      event.target.value = '';
    });
  }

  if (dom.assistantFab) dom.assistantFab.addEventListener('click', toggleAssistant);
  if (dom.assistantClose) dom.assistantClose.addEventListener('click', closeAssistant);
  if (dom.assistantForm) {
    dom.assistantForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitAssistantMessage(dom.assistantInput?.value || '');
      if (dom.assistantInput) dom.assistantInput.value = '';
    });
  }
  document.querySelectorAll('[data-assist]').forEach((chip) => {
    chip.addEventListener('click', () => {
      submitAssistantMessage(chip.dataset.assist || '');
      openAssistant();
    });
  });

  if (dom.authForm) dom.authForm.addEventListener('submit', saveProfile);
  if (dom.closeAuth) dom.closeAuth.addEventListener('click', closeAuthModal);
  if (dom.authSignOut) dom.authSignOut.addEventListener('click', signOut);
  if (dom.authModal) {
    dom.authModal.addEventListener('click', (event) => {
      if (event.target === dom.authModal) closeAuthModal();
    });
  }

  dom.pageLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.dataset.pageLink;
      if (!target) return;
      window.location.href = target;
    });
  });
};
const enforceRoleUI = () => {
  const userStr = localStorage.getItem('medifind-user');
  if (!userStr) return;
  
  try {
    const user = JSON.parse(userStr);
    const role = user.role; 

    // 1. Clean up the Navigation Bar Links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const target = link.getAttribute('href') || link.dataset.view || '';
      let isAllowed = false;

      // Lock down the search page strictly to Customers and Admins
      if (target.includes('index') || target === 'customer') {
        isAllowed = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
      }
      // Pharmacist Desk access
      else if (target.includes('pharmacist') && ['PHARMACIST', 'OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }
      // Pharmacy Dashboard access
      else if (target.includes('pharmacy') && ['OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }
      // Admin Console access
      else if (target.includes('admin') && ['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        isAllowed = true;
      }

      if (!isAllowed) {
        link.style.display = 'none';
      }
    });

    // 2. Destroy the "Back to search" button for non-customers
    const backToSearchBtn = document.querySelector('a.nav-cta[href="index.html"]');
    if (backToSearchBtn && role !== 'CUSTOMER' && role !== 'ADMIN') {
      backToSearchBtn.style.display = 'none';
    }

  } catch (error) {
    console.error("Failed to parse user for UI segregation:", error);
  }
};
const init = () => {
  injectEnhancements();
  cacheEnhancementDom();
  loadProfile();
  loadPreferences();
  loadAssistantHistory();

  renderTicker();
  renderLowStockTable();
  renderDemandList();
  renderInventoryTable();
  renderReservationList();
  renderTrendChart(dom.trendChart, DEMAND_DATA, '#0f766e');
  renderRxQueue();
  renderCollectionTable();
  renderMedInfoGrid();
  renderVerificationTable();
  renderAuditTable();
  renderTrendChart(dom.adminTrendChart, DEMAND_DATA, '#c77530');

  renderAssistantMessages();
  renderAuthState();
  enforceRoleUI();
  enforceRoleAccess();
  void renderAccountActivity();

  setupEventListeners();

  const activeView = document.body.dataset.view;
  if (activeView && dom.views.length) {
    setActiveNav(activeView);
  }

  const dashboardRoots = document.querySelectorAll('.dash-shell .dash-nav');
  dashboardRoots.forEach((root) => {
    const activePanel = root.querySelector('.dash-nav-item.active')?.dataset.panel || root.querySelector('.dash-nav-item')?.dataset.panel;
    setActiveDashboardPanel(root, activePanel);
  });

  if (dom.medSearchInput && dom.medSearchInput.value.trim()) {
    state.currentSearchKey = dom.medSearchInput.value.trim();
    void renderSearchResults();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
