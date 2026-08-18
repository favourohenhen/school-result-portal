/**
 * Shared UI Utilities
 *
 * - showToast(message, type)
 * - showLoading(containerId)
 * - showEmpty(containerId, opts)
 * - setButtonLoading(btnId, loading)
 * - navigate(path)
 */

/* ── Toast notifications ──────────────────────────────────────── */

/**
 * Display a toast notification.
 * @param {string} message
 * @param {'default'|'success'|'error'|'warning'} type
 * @param {number} duration - ms before auto-dismiss (default 4000)
 */
export function showToast(message, type = 'default', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', default: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'default' ? `toast--${type}` : ''}`.trim();
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] || icons.default}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Loading state ────────────────────────────────────────────── */

/**
 * Replace a container's content with a loading spinner.
 * @param {string} containerId
 * @param {string} [message]
 */
export function showLoading(containerId, message = 'Loading…') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="loading-state" role="status" aria-label="${message}">
      <div class="spinner" aria-hidden="true"></div>
      <span class="text-secondary text-sm">${message}</span>
    </div>`;
}

/* ── Empty state ──────────────────────────────────────────────── */

/**
 * Replace a container's content with an empty state block.
 * @param {string} containerId
 * @param {Object} opts
 * @param {string} opts.icon
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.action]  - HTML for a CTA button
 */
export function showEmpty(containerId, { icon = '📭', title, message, action = '' } = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">${icon}</div>
      <p class="empty-state__title">${title}</p>
      <p class="empty-state__message">${message}</p>
      ${action}
    </div>`;
}

/* ── Button loading state ─────────────────────────────────────── */

/**
 * Toggle a button's loading state.
 * @param {string}  btnId
 * @param {boolean} loading
 * @param {string}  [loadingText]
 */
export function setButtonLoading(btnId, loading, loadingText = 'Please wait…') {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (loading) {
    btn._originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="btn__spinner" aria-hidden="true"></span> <span>${loadingText}</span>`;
    btn.disabled  = true;
    btn.classList.add('btn--loading');
  } else {
    btn.innerHTML = btn._originalHTML || btn.innerHTML;
    btn.disabled  = false;
    btn.classList.remove('btn--loading');
  }
}

/* ── Client-side navigation ───────────────────────────────────── */

/**
 * Navigate to a hash route.
 * @param {string} path - e.g. '/admin/dashboard'
 */
export function navigate(path) {
  window.location.hash = path;
}

/* ── Score badge helper ───────────────────────────────────────── */

/**
 * Return a score-badge span with the correct colour class.
 * @param {number} score
 */
export function scoreBadge(score) {
  let cls = 'score--poor';
  if (score >= 70) cls = 'score--excellent';
  else if (score >= 55) cls = 'score--good';
  else if (score >= 40) cls = 'score--average';
  return `<span class="score-badge ${cls}">${score}</span>`;
}

/* ── Escape HTML (prevent XSS when inserting user data) ──────── */
export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
