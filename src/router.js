/**
 * Client-side Hash Router
 *
 * Routes are matched against window.location.hash (e.g. #/admin/dashboard).
 * Each route module must export:
 *   - render()  → returns HTML string
 *   - init()    → (optional) attaches event listeners after render
 */

import { render as renderLogin,            init as initLogin            } from '../pages/login.js';
import { render as renderAdminLogin,        init as initAdminLogin        } from '../pages/admin-login.js';
import { render as renderAdminDashboard,    init as initAdminDashboard    } from '../pages/admin-dashboard.js';
import { render as renderTeacherDashboard,  init as initTeacherDashboard  } from '../pages/teacher-dashboard.js';
import { render as renderStudentDashboard,  init as initStudentDashboard  } from '../pages/student-dashboard.js';

/* ── Route table ──────────────────────────────────────────────── */
const ROUTES = [
  { path: '/login',              render: renderLogin,            init: initLogin            },
  { path: '/admin/login',        render: renderAdminLogin,       init: initAdminLogin       },
  { path: '/admin/dashboard',    render: renderAdminDashboard,   init: initAdminDashboard   },
  { path: '/teacher/dashboard',  render: renderTeacherDashboard, init: initTeacherDashboard },
  { path: '/student/dashboard',  render: renderStudentDashboard, init: initStudentDashboard },
];

const DEFAULT_PATH = '/login';
const APP_EL_ID    = 'app';

/* ── Helpers ──────────────────────────────────────────────────── */
function getCurrentPath() {
  const hash = window.location.hash;
  // Strip leading '#' and optional '/'
  const path = hash.replace(/^#\/?/, '').trim();
  return path ? '/' + path : DEFAULT_PATH;
}

function matchRoute(path) {
  // Exact match first
  const exact = ROUTES.find(r => r.path === path);
  if (exact) return exact;

  // Prefix match (for sub-routes like /admin/students → /admin/dashboard)
  const prefix = ROUTES.find(r => path.startsWith(r.path + '/'));
  if (prefix) return prefix;

  // Fallback to default
  return ROUTES.find(r => r.path === DEFAULT_PATH);
}

/* ── Core render ──────────────────────────────────────────────── */
function renderRoute() {
  const path  = getCurrentPath();
  const route = matchRoute(path);
  const app   = document.getElementById(APP_EL_ID);

  if (!app || !route) return;

  // Render HTML
  app.innerHTML = route.render();

  // Run page initialiser (attaches event listeners)
  if (typeof route.init === 'function') {
    route.init();
  }

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update document title
  const label = route.path.replace('/', '').replace(/\//g, ' › ').replace(/\b\w/g, c => c.toUpperCase());
  document.title = `${label || 'Login'} — Result Hub`;
}

/* ── Public API ───────────────────────────────────────────────── */

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute(); // Render on initial load
}
