/* =========================================================================
   MEDPALOOZA — Router
   Tiny hash router. Persistent chrome (topbar/nav overlay/footer) is
   rendered once and never touched here; only #view swaps.
   ========================================================================= */

const VALID_ROUTES = siteData.navigation.map(n => n.route);
const RENDERERS = {
  home: renderHomeView,
  about: renderAboutView,
  members: renderMembersView,
  alumni: renderAlumniView,
  rush: renderRushView,
  social: renderSocialView,
  contact: renderContactView
};

function currentRouteFromHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  return VALID_ROUTES.includes(hash) ? hash : "home";
}

function getVisitedRoutes() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem("med_visited") || "[]"));
  } catch (e) { return new Set(); }
}
function markVisited(route) {
  try {
    const set = getVisitedRoutes();
    set.add(route);
    sessionStorage.setItem("med_visited", JSON.stringify(Array.from(set)));
  } catch (e) { /* sessionStorage unavailable — non-fatal, stamps just won't persist */ }
}

function routeMeta(route) {
  return siteData.navigation.find(n => n.route === route) || siteData.navigation[0];
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Render a route into #view. Kills any ScrollTriggers from the previous
 * view first (they'd otherwise reference DOM nodes we're about to remove).
 */
function performRender(route) {
  if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(st => st.kill());
  closeMemberDetail();
  resetSocialInteraction();
  const viewEl = document.getElementById("view");
  const fn = RENDERERS[route] || renderHomeView;
  fn(viewEl);
  document.body.dataset.route = route;
  window.scrollTo(0, 0);
  // Belt-and-suspenders against the browser's own scroll restoration racing
  // this call (observed: it can silently win a moment later, especially on
  // tall/deeply-scrollable routes, landing a revisited page far from the
  // top despite the scrollTo above) — re-assert on the next frame and once
  // more shortly after, cheap and harmless if nothing was fighting it.
  requestAnimationFrame(() => window.scrollTo(0, 0));
  setTimeout(() => window.scrollTo(0, 0), 60);
  markVisited(route);
  renderWristbandMini();
  renderNavOverlay(route);
  if (window.initViewMotion) initViewMotion(route);
}

function closeNavOverlayIfOpen() {
  const overlay = document.getElementById("navOverlay");
  const menuBtn = document.getElementById("menuBtn");
  if (overlay && overlay.classList.contains("open")) {
    overlay.classList.remove("open");
    if (menuBtn) { menuBtn.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
    document.body.classList.remove("nav-open");
  }
}

/**
 * Single entry point for in-app navigation. Plays the shared transition
 * (unless reduced motion / already on that route), then swaps the view.
 */
async function goTo(route, opts = {}) {
  if (!VALID_ROUTES.includes(route)) route = "home";
  const same = route === currentRouteFromHash();
  closeNavOverlayIfOpen();
  resetSocialInteraction();
  if (same) return;

  history.pushState({ route }, "", "#" + route);

  if (opts.transition !== false && window.gsap && !prefersReducedMotion()) {
    await playTransition(route);
  }
  performRender(route);
}

function initRouter() {
  // The browser's own scroll restoration (default "auto") tries to restore
  // whatever scroll offset was last associated with a given history entry —
  // on tall, deeply-scrollable routes this can win a race against our own
  // performRender()'s window.scrollTo(0,0) below, silently landing a
  // revisited route hundreds of pixels down instead of at the top. This app
  // owns scroll position itself on every navigation, so opt out of the
  // browser's version entirely rather than fight it.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // Intercept every in-app link (nav overlay, CTAs, teaser cards) so we can
  // choreograph the transition instead of a hard hash jump.
  document.addEventListener("click", e => {
    // Only ever intercept actual <a data-route> links — never buttons like
    // the menu trigger, which must be free to run their own click handler
    // without goTo()'s side effects (it closes the nav overlay) firing too.
    const link = e.target.closest("a[data-route]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;
    e.preventDefault();
    goTo(link.dataset.route);
  });

  window.addEventListener("popstate", () => {
    performRender(currentRouteFromHash());
  });

  performRender(currentRouteFromHash());
}
