/* =========================================================================
   MEDPALOOZA — Motion
   GSAP/ScrollTrigger setup, custom cursor, magnetic buttons, doodle
   ambient motion, per-view scroll sequences, and the shared page
   transition. Every animated piece here has a static, complete fallback
   under prefers-reduced-motion — checked once via reducedMotion().
   ========================================================================= */

function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function finePointer() { return window.matchMedia("(hover: hover) and (pointer: fine)").matches; }
function isMobileWidth() { return window.innerWidth < 900; }

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- boot: things that only need to happen once ---------- */
function initChrome() {
  initCustomCursor();
  initNavOverlayHover();
  initNavOverlayFocusTrap();
  // Global safety net: Escape always clears any in-progress Social drag,
  // even outside the nav overlay's own (locally-scoped) Escape handling.
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && window.resetSocialInteraction) resetSocialInteraction();
  });
}

/* ---------- called after every route render ---------- */
function initViewMotion(route) {
  const root = document.getElementById("view");
  initReveal(root);
  initMagneticButtons(root);
  initTiltPhotos(root);

  initMarquees(root);

  if (route === "home") initHomeMotion(root);
  if (route === "about") initAboutMotion(root);
  if (route === "members") initMembersMotion(root);
  if (route === "rush") initRushMotion(root);
  if (route === "social") initSocialMotion(root);
  if (route === "contact") initContactMotion(root);

  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
    refreshScrollTriggersOnceSettled(root);
  }
}

/* Every ScrollTrigger start/end position is computed from the page's
   layout at the moment it's created — but that's usually BEFORE images
   (and sometimes fonts) have finished loading. Anything below an image
   that then loads and changes height leaves every trigger below it with a
   stale, too-early position (this is exactly what caused the "How We
   Prepare Members" pin to fire while still over the previous photo
   section on About). Re-run refresh() once images/fonts have actually
   settled, and again on window resize/orientation change. */
function refreshScrollTriggersOnceSettled(root) {
  // ScrollTrigger.refresh() recalculates every trigger's start/end AND
  // re-measures every pin's natural (unpinned) box — safe right after
  // render, but not once the visitor has actually scrolled: this fires up
  // to 1500ms after render (or whenever a late image/font settles), and the
  // visitor is free to scroll immediately. Two different ways that turns
  // unsafe were reproduced directly: (1) landing while a pin is actively
  // engaged recomputes its geometry out from under itself mid-scroll and
  // the pinned content can come apart — forcing a refresh mid-pin on the
  // About stages sequence made the whole panel go blank, the mechanism
  // behind "How We Prepare Members" glitching on a slight scroll back; (2)
  // even with no pin currently active, calling it from well down the page
  // re-measured a since-released pin's start/end offset by whatever scrollY
  // the refresh happened to land on, corrupting it just the same (the Home
  // poster pin stopped re-engaging on scroll-back after this). The one
  // condition that measured correctly every time in both cases was being
  // back near the top of the page, so that's the gate: skip the refresh
  // outright once the visitor has scrolled any real distance, rather than
  // rescheduling it for later (a later scroll position is exactly what's
  // unsafe here). The trigger positions this would have corrected were
  // already set by the refresh in initViewMotion; missing one late
  // image/font's correction on the rare visit where the visitor has
  // already scrolled by this point is the far smaller risk.
  const doRefresh = () => {
    if (!window.ScrollTrigger) return;
    if (window.scrollY > 4) return;
    if (ScrollTrigger.getAll().some(st => st.pin && st.isActive)) return;
    ScrollTrigger.refresh();
  };
  const imgs = Array.from(root.querySelectorAll("img"));
  const pending = imgs.filter(img => !img.complete);
  let remaining = pending.length;
  if (remaining === 0) {
    requestAnimationFrame(doRefresh);
  } else {
    const onSettle = () => { remaining--; if (remaining <= 0) doRefresh(); };
    pending.forEach(img => {
      img.addEventListener("load", onSettle, { once: true });
      img.addEventListener("error", onSettle, { once: true });
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(doRefresh);
  // Safety net in case an image/font event is ever missed for any reason.
  setTimeout(doRefresh, 1500);
}

/* ---------- shared: marquee — duplicate content until it seamlessly spans
   the full viewport width, no matter how short the source content is ---------- */
function initMarquees(root) {
  root.querySelectorAll(".marquee-track").forEach(track => {
    if (!track.children.length || track.dataset.marqueeReady) return;
    track.dataset.marqueeReady = "1";

    if (reducedMotion()) {
      track.style.animation = "none";
      const wrap = track.closest(".marquee");
      if (wrap) wrap.style.overflowX = "auto";
      return;
    }

    const original = Array.from(track.children);
    // Repeat the source items until this one "half" of the track is
    // comfortably wider than the viewport — otherwise short content (e.g.
    // 3 stats) leaves a visible gap once translated. Generous 1.3x margin
    // covers resize/orientation changes without a re-measure.
    const target = Math.max(window.innerWidth, document.documentElement.clientWidth || 0) * 1.3;
    let guard = 0;
    while (track.scrollWidth < target && guard < 25) {
      original.forEach(node => track.appendChild(node.cloneNode(true)));
      guard++;
    }
    // Duplicate that whole (now wide-enough) block once more so the CSS
    // keyframe's translateX(-50%) loop is seamless.
    Array.from(track.children).forEach(node => track.appendChild(node.cloneNode(true)));

    const halfWidth = track.scrollWidth / 2;
    const pxPerSecond = 70;
    const duration = Math.max(14, halfWidth / pxPerSecond);
    track.style.setProperty("--marquee-duration", duration + "s");
  });
}

/* ---------- shared: scroll reveal ---------- */
function initReveal(root) {
  const items = root.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("active"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  items.forEach(el => {
    // Anything already on screen the instant this route mounts (e.g. some
    // of Members' headliner names straddle the fold depending on viewport
    // height) needs an actual scroll past the 15% threshold below to ever
    // fire — if the visitor never happens to scroll, it just sits at
    // opacity 0 forever, which reads as the reveal randomly not
    // happening. Nothing here should require a scroll to become visible
    // that's already in front of the visitor, so settle those instantly
    // and leave the threshold-based reveal for whatever's actually below
    // the fold.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add("active"); return; }
    observer.observe(el);
  });
  // On a cold load, web fonts (Anton in particular, used by most of what
  // gets .reveal'd) haven't necessarily finished swapping in yet at the
  // instant the check above runs — text still in a fallback font measures
  // a different size, so an element the *fallback* layout placed just
  // below the fold can end up genuinely stuck: too far below to satisfy
  // the observer's own threshold even after the later reflow moves it.
  // Re-running the same "already on screen" check once fonts truly settle
  // catches exactly that gap; already-active elements are simply skipped.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      items.forEach(el => {
        if (el.classList.contains("active")) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add("active"); observer.unobserve(el); }
      });
    });
  }
}

/* ---------- shared: magnetic buttons ---------- */
function initMagneticButtons(root) {
  if (reducedMotion() || !finePointer()) return;
  root.querySelectorAll("[data-magnetic]").forEach(el => {
    let raf = null;
    el.addEventListener("mousemove", e => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.transform = `translate(${relX * 0.22}px, ${relY * 0.32}px)`; });
    });
    el.addEventListener("mouseleave", () => { if (raf) cancelAnimationFrame(raf); el.style.transform = ""; });
  });
}

/* ---------- shared: subtle cursor-tilt on photography ---------- */
function initTiltPhotos(root) {
  if (reducedMotion() || !finePointer()) return;
  root.querySelectorAll(".torn").forEach(el => {
    el.addEventListener("mousemove", e => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotate(${el.style.getPropertyValue("--rot") || "0deg"}) perspective(600px) rotateX(${py * -6}deg) rotateY(${px * 6}deg)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ---------- custom cursor (desktop only) ---------- */
function initCustomCursor() {
  if (reducedMotion() || !finePointer()) return;
  document.documentElement.classList.add("has-custom-cursor");
  const dot = document.createElement("div"); dot.className = "cursor-dot";
  const label = document.createElement("div"); label.className = "cursor-label";
  document.body.appendChild(dot); document.body.appendChild(label);

  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  window.addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; window.__mx = e.clientX; window.__my = e.clientY; });
  (function tick() {
    x += (tx - x) * 0.28; y += (ty - y) * 0.28;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    label.style.transform = `translate3d(${x}px, ${y}px, 0)${label.classList.contains("show") ? " scale(1)" : " scale(.6)"}`;
    requestAnimationFrame(tick);
  })();

  document.addEventListener("mouseover", e => {
    const target = e.target.closest("[data-cursor]");
    if (target) { label.textContent = target.dataset.cursor; label.classList.add("show"); dot.classList.add("hide"); }
  });
  document.addEventListener("mouseout", e => {
    const target = e.target.closest("[data-cursor]");
    if (target && !e.relatedTarget?.closest?.("[data-cursor]")) { label.classList.remove("show"); dot.classList.remove("hide"); }
  });
}

/* ---------- nav overlay: hover-preview + focus trap ---------- */
const ROUTE_PREVIEW_IMAGE = {
  home: "assets/images/hero.jpg",
  about: "assets/images/gallery/about1.jpg",
  members: "assets/images/members/simone.jpg",
  alumni: "assets/images/gallery/chapter3.jpg",
  rush: "assets/images/gallery/chapter1.jpg",
  social: "assets/images/instagram/insta1.jpg",
  contact: "assets/images/gallery/about2.jpg"
};
function initNavOverlayHover() {
  const overlay = document.getElementById("navOverlay");
  if (!overlay) return;
  overlay.addEventListener("mouseover", e => {
    const link = e.target.closest("a[data-route]");
    if (!link) return;
    const img = ROUTE_PREVIEW_IMAGE[link.dataset.route];
    if (img) overlay.style.backgroundImage = `url('${img}')`;
    overlay.style.setProperty("--veil-color", `var(--${link.dataset.accent || "gold"})`);
  });
  overlay.addEventListener("mouseleave", () => { overlay.style.backgroundImage = ""; });
}
function initNavOverlayFocusTrap() {
  const menuBtn = document.getElementById("menuBtn");
  const overlay = document.getElementById("navOverlay");
  const closeBtn = document.getElementById("navCloseBtn");
  if (!menuBtn || !overlay) return;
  let lastFocused = null;
  function openNav() {
    lastFocused = document.activeElement;
    overlay.classList.add("open"); menuBtn.classList.add("open"); menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
    const first = overlay.querySelector(".nav-overlay-links a"); if (first) first.focus();
    document.addEventListener("keydown", onKeydown);
  }
  function closeNav() {
    overlay.classList.remove("open"); menuBtn.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused) lastFocused.focus();
  }
  function onKeydown(e) {
    if (e.key === "Escape") { closeNav(); return; }
    if (e.key === "Tab") {
      const focusable = overlay.querySelectorAll("a, button");
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  menuBtn.addEventListener("click", () => { overlay.classList.contains("open") ? closeNav() : openNav(); });
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  // Links close the overlay themselves via router's closeNavOverlayIfOpen();
  // this listener just keeps the local open/close state (classes) in sync
  // since router.js toggles the same classes directly.
}

/* ---------- shared page transition ---------- */
function playTransition(route) {
  return new Promise(resolve => {
    const veil = document.getElementById("transitionVeil");
    const meta = routeMeta(route);
    veil.innerHTML = `<div class="veil-word display-lg">${meta.word}</div>`;
    veil.style.setProperty("--veil-color", `var(--${meta.accent})`);
    veil.style.display = "flex";
    const word = veil.querySelector(".veil-word");
    gsap.timeline({ onComplete: () => { veil.style.display = "none"; resolve(); } })
      .fromTo(veil, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: .45, ease: "power3.inOut" })
      .fromTo(word, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .3 }, "-=.15")
      .to(word, { opacity: 0, duration: .2 }, "+=.2")
      .to(veil, { clipPath: "inset(100% 0 0 0)", duration: .4, ease: "power3.inOut" });
  });
}

/* ---------- Home: poster separation on first scroll ---------- */
function initHomeMotion(root) {
  const stage = root.querySelector("#posterStage");
  if (!stage) return;
  const allPieces = Array.from(stage.querySelectorAll(".poster-piece"));
  let scrollProgress = 0; // 0 = poster fully at rest; >0 = mid-deconstruction

  // Cursor parallax: every poster piece drifts by its own data-depth as the
  // mouse moves — pieces near the edges (higher depth) move more, reading
  // as layered depth rather than a flat poster. Paused once the scroll
  // deconstruction starts (both would otherwise fight over transform), and
  // skipped entirely on touch/reduced-motion — a perfectly static poster is
  // still a complete, legible poster.
  if (window.gsap && finePointer() && !reducedMotion()) {
    let raf = null;
    function updateParallax() {
      raf = null;
      if (scrollProgress > 0.001) return;
      const rect = stage.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const mx = (window.__mx ?? innerWidth / 2) - (rect.left + rect.width / 2);
      const my = (window.__my ?? innerHeight / 2) - (rect.top + rect.height / 2);
      allPieces.forEach(el => {
        const depth = +el.dataset.depth || 0.2;
        gsap.to(el, { x: (mx / rect.width) * depth * 60, y: (my / rect.height) * depth * 60, duration: .6, ease: "power2.out", overwrite: "auto" });
      });
    }
    window.addEventListener("mousemove", () => { if (!raf) raf = requestAnimationFrame(updateParallax); });
  }

  if (!window.ScrollTrigger || reducedMotion()) return;
  // Pin `stage` while triggering off its own wrapper (`pinWrap`) — same
  // shape as About's stages-pin/stages-frame and Rush's lineup-pin/
  // lineup-frame below, trigger and pin as two different elements rather
  // than pinning the trigger itself. The actual fix for the "blank section
  // after the animation" gap turned out to be the onLeave handler further
  // down (see its comment) rather than this split on its own, but this
  // keeps the one pin on this page structured the same way as the other
  // two rather than as the odd one out.
  const pinWrap = document.getElementById("posterStagePin") || stage.parentElement;
  const bg = stage.querySelector("#posterBg");
  const word = stage.querySelector(".center-word");
  const letters = stage.querySelectorAll(".poster-letter");
  const kicker = document.getElementById("posterKicker");
  const sub = document.getElementById("posterSub");
  const admitWrap = document.getElementById("posterAdmitWrap");
  const cue = stage.querySelector(".poster-scroll-cue");
  const pieces = stage.querySelectorAll(".poster-piece:not(.center-word)");

  // A longer pin (was +=120%) gives this room to be an actual sequence —
  // wind-up, the word breaking apart letter by letter (each on its own
  // heading/distance/timing, not the whole word moving as one block), an
  // aperture-close reveal on the photo instead of a plain fade, and the
  // scattered pieces clearing with more distance and a real stagger
  // between them — rather than the same motion just made bigger.
  gsap.set(stage, { transformPerspective: 1300 });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinWrap, pin: stage, start: "top top", end: "+=220%", scrub: 1,
      onUpdate: self => { scrollProgress = self.progress; },
      // Scrubbed inline transforms freeze at their end-of-timeline values
      // once you've scrolled past (scrub doesn't clear them on its own) —
      // at this sequence's exaggerated scale, bg's frozen 1.6x/contrast
      // state was measurably wider than the viewport even though it's
      // clipped while pinned. Once truly left, drop bg back to its
      // untransformed resting styles; scrolling back up re-asserts the
      // correct scrubbed values immediately since the timeline itself is
      // untouched. `stage` itself is deliberately NOT included here even
      // though it's also tweened (rotationX) — it's the pin target, and
      // ScrollTrigger writes its own compensating release transform onto
      // that same element the instant the pin lets go so the handoff from
      // fixed back to normal flow is seamless; clearProps touching that
      // element clobbers that transform (same inline `transform`
      // attribute) and was exactly what caused the pin to release into a
      // hard jump straight to a blank gap instead of continuing smoothly.
      // Everything stage was showing (letters, kicker, sub, admit, bg) is
      // already faded to opacity 0 by progress 1, so its own residual 6°
      // tilt is not visible regardless.
      onLeave: () => gsap.set(bg, { clearProps: "scale,filter,clipPath" })
    }
  });

  // wind-up: a slight dimensional tilt and push-in before anything breaks apart
  tl.to(stage, { rotationX: 6, ease: "none" }, 0)
    .to(bg, { scale: 1.6, filter: "contrast(1.18) saturate(1.15)", ease: "none" }, 0)
    .to(cue, { opacity: 0, y: 10, ease: "none" }, 0);

  // the word breaks apart — each letter its own direction, rotation and
  // moment, staggered across the first half of the scroll rather than
  // popping at once
  letters.forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const start = .06 + i * .022;
    tl.to(el, {
      x: dir * (6 + i * 3.4) + "vw", y: (((i % 3) - 1) * 16) + "vh",
      rotation: dir * (35 + i * 9), scale: .5, opacity: 0, ease: "none"
    }, start);
  });
  // kicker, subhead and the admit ticket each leave differently — never as
  // one rigid block
  if (kicker) tl.to(kicker, { y: -50, opacity: 0, ease: "none" }, .05);
  if (sub) tl.to(sub, { scale: 1.4, opacity: 0, ease: "none" }, .12);
  if (admitWrap) tl.to(admitWrap, { y: 90, rotation: -4, opacity: 0, ease: "none" }, .16);

  // the photo closes like a camera aperture instead of a plain cross-fade —
  // a real masking/reveal moment, not just opacity
  tl.fromTo(bg, { clipPath: "circle(150% at 50% 45%)" }, { clipPath: "circle(0% at 50% 45%)", ease: "power1.in" }, .5);

  // scattered pieces clear with more distance, more spin, and a genuine
  // stagger — some leave earlier/faster than others instead of every piece
  // moving in perfect lockstep
  pieces.forEach((el, i) => {
    const fx = (+el.dataset.flyX || 0) * 1.6 + "vw";
    const fy = (+el.dataset.flyY || 0) * 1.6 + "vh";
    tl.to(el, { x: fx, y: fy, opacity: 0, rotation: "+=" + (40 + i * 6), scale: .85, ease: "none" }, i * .025);
  });

  initCollageParallax(root);
}

/* Chapter Life: cursor-driven depth parallax (each photo drifts at its own
   speed, like a physical stack) plus a hover lift/forward + caption reveal.
   Uses GSAP for everything transform-related so the resting CSS rotation,
   the hover scale, and the cursor drift all compose instead of fighting —
   same approach as the poster pieces above. */
function initCollageParallax(root) {
  const wall = root.querySelector(".collage-wall");
  if (!wall || !window.gsap) return;
  const photos = Array.from(wall.querySelectorAll(".collage-photo"));
  photos.forEach(el => {
    gsap.set(el, { rotation: +el.dataset.rot || 0 });
    el.addEventListener("mouseenter", () => {
      gsap.to(el, { scale: 1.05, zIndex: 5, duration: .3, ease: "power2.out" });
      el.classList.add("colored"); // once seen, stays in color for the rest of this visit
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { scale: 1, zIndex: 1, duration: .3, ease: "power2.out" }));
  });

  if (!finePointer() || reducedMotion()) return;
  let raf = null;
  function update() {
    raf = null;
    const rect = wall.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const mx = (window.__mx ?? innerWidth / 2) - (rect.left + rect.width / 2);
    const my = (window.__my ?? innerHeight / 2) - (rect.top + rect.height / 2);
    photos.forEach(el => {
      const depth = +el.dataset.depth || 0.2;
      gsap.to(el, { x: (mx / rect.width) * depth * 50, y: (my / rect.height) * depth * 50, duration: .7, ease: "power2.out", overwrite: "auto" });
    });
  }
  window.addEventListener("mousemove", () => { if (!raf) raf = requestAnimationFrame(update); });
}

/* ---------- About: "The MEDPALOOZA Experience" ----------
   One pin (the Map+Stages sequence) — everything else, including the
   opener, is non-pinned scrub. Nothing here adds a window/document
   listener or a manually-created Observer, so the router's existing
   blanket ScrollTrigger.getAll().kill() on every navigation is sufficient
   cleanup — nothing extra to register or tear down. */
function initAboutMotion(root) {
  initAboutOpen(root);
  initManifesto(root);
  initStageJourney(root);
  initCultureStickers(root);
}

/* Act 1 — the opener: MED starts oversized (set via gsap.set, so the CSS
   default stays the normal resolved size — a safe, legible fallback if
   this never runs) and scrubs down to scale 1 over a short, non-pinned
   scroll range; "About" fades in only once it's mostly settled. One
   transform, one element — nothing else animates here. */
function initAboutOpen(root) {
  const section = root.querySelector(".about-open");
  const word = document.getElementById("aboutOpenWord");
  const prefix = document.getElementById("aboutOpenPrefix");
  const cue = document.getElementById("aboutOpenCue");
  if (!section || !word || !window.ScrollTrigger || reducedMotion()) return;
  gsap.set(word, { scale: 3.2, transformOrigin: "50% 50%" });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top top", end: "+=60%", scrub: .6 }
  });
  tl.to(word, { scale: 1, ease: "none" }, 0);
  if (prefix) tl.fromTo(prefix, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: "none" }, .5);
  // fades with the same motion, not lingering once the reader has already
  // moved on into the next section below
  if (cue) tl.to(cue, { opacity: 0, ease: "none" }, 0);
}

/* Act 2 — THE MANIFESTO: four independent, non-pinned scrub triggers (one
   per real about.manifesto line) — nothing here pins anything, so there is
   zero stacking risk in this whole section. Each line gets a distinct
   physical treatment instead of a generic fade. */
function initManifesto(root) {
  if (!window.ScrollTrigger || reducedMotion()) return;
  root.querySelectorAll(".manifesto-line").forEach(line => {
    const idx = +line.dataset.index;
    const scrollTrigger = { trigger: line, start: "top 85%", end: "top 35%", scrub: .6 };
    const text = line.querySelector(".manifesto-text");
    if (idx === 0 && text) {
      gsap.fromTo(text, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger });
    } else if (idx === 1) {
      const words = line.querySelectorAll(".mf-word");
      if (words.length) gsap.fromTo(words, { scale: .5, opacity: .25 }, { scale: 1, opacity: 1, stagger: .08, ease: "none", scrollTrigger });
    } else if (idx === 2 && text) {
      gsap.fromTo(text, { x: "-12vw", opacity: 0 }, { x: 0, opacity: 1, ease: "none", scrollTrigger });
      const underline = line.querySelector(".manifesto-underline path");
      if (underline) {
        const len = underline.getTotalLength();
        gsap.set(underline, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(underline, { strokeDashoffset: 0, ease: "none", scrollTrigger });
      }
    } else if (text) {
      gsap.fromTo(text, { rotation: -6, scale: .85, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, ease: "none", scrollTrigger });
    }
  });
}

/* Act 3+4 — THE FOUR STAGES (the centerpiece). No map/path — four full-
   frame "moments" the visitor scrolls through, each taking over the whole
   pinned viewport in turn with its own distinct treatment (unfurl /
   assemble / ticker / explode — see enterAnimationFor). Stage 0's panel is
   opacity:1 in the HTML by default (see stageSpotlightHTML in render.js)
   — this function only ever fades stages IN as they're reached; it never
   has to "reveal" stage 0 because it's never hidden in the first place,
   the direct fix for the "invisible Stage 1" failure mode named explicitly
   earlier this project. Everything (active stage, active dot) is a pure,
   bidirectional function of scroll progress, so leaving and re-entering
   (in-page or via full navigation) always replays correctly from wherever
   the scrollbar actually is, and the pin's own start/end fully define
   where the sequence begins and ends. */
function initStageJourney(root) {
  const pinSection = root.querySelector(".stages-pin");
  const frame = root.querySelector(".stages-frame");
  const items = (window.siteData || siteData).about.programs.items;
  if (!pinSection || !frame || !items.length) return;

  const fallback = root.querySelector(".stage-fallback-list");
  if (!window.ScrollTrigger || reducedMotion()) {
    // No pin — the plain stacked list (already in the HTML, hidden by
    // default) is the complete reduced-motion experience; CSS shows it and
    // hides the stage machinery for this media query.
    return;
  }
  if (fallback) fallback.style.display = "none";

  const numEls = root.querySelectorAll(".stage-numeral");
  const dots = root.querySelectorAll(".stage-dot");
  const panels = root.querySelectorAll(".stage-spotlight");
  let stageTweens = [];
  function killStageTweens() { stageTweens.forEach(t => t.kill()); stageTweens = []; }

  function enterAnimationFor(panel) {
    if (panel.classList.contains("stage-spotlight-unfurl")) {
      const content = panel.querySelector(".stage-content");
      return content && gsap.fromTo(content, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: .6, ease: "power2.out", overwrite: true });
    }
    if (panel.classList.contains("stage-spotlight-assemble")) {
      const frags = panel.querySelectorAll(".stage-fragment");
      return frags.length && gsap.fromTo(frags, {
        x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-80, 80),
        opacity: 0, rotation: () => gsap.utils.random(-20, 20)
      }, { x: 0, y: 0, opacity: 1, rotation: 0, stagger: .07, duration: .5, ease: "power2.out", overwrite: true });
    }
    if (panel.classList.contains("stage-spotlight-explode")) {
      const words = panel.querySelectorAll(".stage-explode-word");
      return words.length && gsap.fromTo(words, { x: 0, opacity: 0, scale: 1.6 }, {
        x: (i2) => (i2 - (words.length - 1) / 2) * 44, opacity: 1, scale: 1, stagger: .05, duration: .5, ease: "power3.out", overwrite: true
      });
    }
    const content = panel.querySelector(".stage-content");
    return content && gsap.fromTo(content, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, overwrite: true });
  }

  function activateStage(idx) {
    killStageTweens();
    panels.forEach((panel, i) => {
      gsap.to(panel, { opacity: i === idx ? 1 : 0, duration: i === idx ? .4 : .3, overwrite: true });
      panel.style.zIndex = i === idx ? 2 : 0;
      if (i === idx) { const tw = enterAnimationFor(panel); if (tw) stageTweens.push(tw); }
    });
    numEls.forEach((n, i) => n.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /* Used only at the pin's own start/end boundaries (onEnter/onLeave/
     onEnterBack/onLeaveBack) — an instant, animation-free settle instead
     of activateStage's tweened one. onUpdate's idx-diffing already
     handles every transition *inside* the sequence exactly as before;
     this only guarantees that the moment the section is entered or left,
     nothing is ever left mid-tween (a partially-assembled/exploded
     fragment, a part-open clip-path) that could still be visible —
     the fix for stage content surviving past the section's own edges. */
  function hardSettle(idx) {
    killStageTweens();
    panels.forEach((panel, i) => {
      gsap.set(panel, { opacity: i === idx ? 1 : 0 });
      panel.style.zIndex = i === idx ? 2 : 0;
    });
    root.querySelectorAll(".stage-fragment, .stage-explode-word").forEach(el => gsap.set(el, { clearProps: "transform,opacity" }));
    const content = panels[idx] && panels[idx].querySelector(".stage-content");
    if (content) gsap.set(content, { clearProps: "clipPath,opacity,y" });
    numEls.forEach((n, i) => n.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  /* Every stage keeps its full 90% dwell so the 0→1→2→3 transitions feel
     exactly as before — only the *last* stage's trailing room is short
     (30% instead of 90%), just enough for its own enter animation to
     read before the pin releases straight into Community & Brotherhood,
     instead of sitting on stage 4 alone for a full extra dwell. */
  const DWELL = 90, FINAL_TAIL = 30;
  const segmentEnds = items.map((_, i) => i < items.length - 1 ? (i + 1) * DWELL : (items.length - 1) * DWELL + FINAL_TAIL);
  const totalPercent = segmentEnds[segmentEnds.length - 1];

  let lastIdx = 0;
  ScrollTrigger.create({
    trigger: pinSection, start: "top top", end: "+=" + totalPercent + "%",
    pin: frame, scrub: 1, invalidateOnRefresh: true,
    onUpdate: self => {
      const scrollPct = self.progress * totalPercent;
      let idx = segmentEnds.findIndex(end => scrollPct < end);
      if (idx === -1) idx = items.length - 1;
      if (idx !== lastIdx) { lastIdx = idx; activateStage(idx); }
    },
    onEnter: () => hardSettle(lastIdx),
    onEnterBack: () => hardSettle(lastIdx),
    onLeave: () => { lastIdx = items.length - 1; hardSettle(lastIdx); },
    onLeaveBack: () => { lastIdx = 0; hardSettle(lastIdx); }
  });
}

/* Culture & Crew: a click gives a sticker a tactile stamp pulse (reuses the
   existing .stamped class / @keyframes stampPulse already used on the Rush
   pass CTA). Cursor-tilt comes free from the already-global, already-gated
   initTiltPhotos via the shared .torn class — no listener added here for
   that part. */
function initCultureStickers(root) {
  root.querySelectorAll(".culture-sticker").forEach(el => {
    el.addEventListener("click", () => {
      el.classList.remove("stamped");
      void el.offsetWidth;
      el.classList.add("stamped");
    });
  });
}

/* ---------- Members: filter-switch fade (spotlight hover is wired in render.js) ---------- */
function initMembersMotion(root) {
  if (window.gsap) {
    const panels = root.querySelectorAll("[data-panel]");
    root.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (reducedMotion()) return;
        panels.forEach(p => {
          if (p.style.display !== "none") gsap.fromTo(p, { opacity: .4 }, { opacity: 1, duration: .35 });
        });
      });
    });
  }
}

/* ---------- Rush: wristband step tracking + pass stamp ---------- */
function initRushMotion(root) {
  const steps = root.querySelectorAll(".wristband-step");
  if (steps.length) {
    const sectionMap = [
      root.querySelector("#rush-header"),
      root.querySelector("#rush-schedule-wrap"),
      root.querySelector("#rush-wristband"),
      root.querySelector("#rush-pass")
    ];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const idx = sectionMap.indexOf(entry.target);
        if (idx === -1) return;
        if (entry.isIntersecting) {
          for (let i = 0; i <= idx; i++) steps[i]?.classList.add("done");
        }
      });
    }, { threshold: 0.4 });
    sectionMap.forEach(el => { if (el) observer.observe(el); });
  }

  initLineupMotion(root);

  const cta = document.getElementById("passCta");
  if (cta) {
    cta.addEventListener("click", () => {
      cta.classList.remove("stamped"); void cta.offsetWidth; cta.classList.add("stamped");
      const confirm = document.getElementById("passConfirm");
      if (confirm) confirm.textContent = "Pass claimed — check your email after submitting the form.";
    });
  }
}

/* ---------- Rush: THE LINEUP — stage-schedule signboard ----------
   Desktop: one pinned frame. A giant date/day ("marquee reel") lives
   behind everything and is only ever atmospheric (aria-hidden) — the
   actual info of record is the ticket-shaped card in front of it, so
   legibility never depends on the reel. A fanned stack of ticket stubs
   (not a line of dots) tracks progress; the active stub pulls forward.
   Only two elements ever get a real tween per step (the outgoing +
   incoming reel numeral, exactly like a physical sign flipping) — every
   other stub/card/numeral is snapped with gsap.set, so scrubbing fast
   through all nine beats stays cheap regardless of how many are skipped.
   The final beat (Final Interviews) is a deliberate climax: the backdrop
   blacks out, the reel numeral gilds, and the final stub gets the same
   .stamped pulse already used on the pass CTA/culture stickers.
   Mobile swaps the pin for a native scroll-snap strip of self-contained
   cards — a different interaction for touch, not the desktop one shrunk
   — so it needs no ScrollTrigger and no reduced-motion gate of its own. */
function initLineupMotion(root) {
  const frame = root.querySelector("#lineupFrame");
  const pinSection = root.querySelector(".lineup-pin");
  if (!frame || !pinSection) return;

  const mobileStrip = root.querySelector("#lineupMobileStrip");
  const mobileCounter = root.querySelector("#lineupMobileCounter");
  if (mobileStrip && mobileCounter) {
    const cards = mobileStrip.querySelectorAll(".lineup-m-card");
    const total = cards.length;
    const update = () => {
      if (!total) return;
      const stripLeft = mobileStrip.getBoundingClientRect().left;
      let idx = 0, best = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.getBoundingClientRect().left - stripLeft);
        if (d < best) { best = d; idx = i; }
      });
      mobileCounter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    };
    let ticking = false;
    mobileStrip.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    update();
  }

  if (!window.ScrollTrigger || reducedMotion() || isMobileWidth()) return;

  const megas = root.querySelectorAll(".lineup-date-mega");
  const cards = root.querySelectorAll(".lineup-card");
  const stubs = root.querySelectorAll(".lineup-stub");
  const backdrop = root.querySelector("#lineupBackdrop");
  const cue = root.querySelector("#lineupCue");
  const total = megas.length;
  if (!total) return;

  gsap.set([...megas].slice(1), { yPercent: 100 });

  // Every beat's tweens (mega reel flip, card fromTo, backdrop/cue fades) run
  // on real durations (.25s–.6s), not scrubbed ones — scrubbing 9 beats
  // through in a normal scroll easily outruns them, so the LAST beat's
  // enter tween (the "Final Interviews" card/reel) can still be mid-flight
  // the instant the pin's own end is reached and it un-pins. Left alone,
  // that tween keeps animating in on the now-unpinned, normally-scrolling
  // frame — the card visibly finishing its pop-in *after* the section has
  // already started leaving, reading as Final Interviews flashing/repeating
  // right as "Join The Lineup" comes in. hardSettle (same pattern as
  // About's stage journey) snaps whichever beat is current to its finished,
  // animation-free state the instant the pin's own boundaries are crossed,
  // so nothing is ever mid-tween at the handoff.
  let activeTweens = [];
  function killActiveTweens() { activeTweens.forEach(t => t.kill()); activeTweens = []; }

  function activate(idx, prev) {
    killActiveTweens();
    megas.forEach((mega, i) => {
      if (i === idx) activeTweens.push(gsap.to(mega, { yPercent: 0, opacity: 1, duration: .6, ease: "power3.out", overwrite: true }));
      else if (i === prev) activeTweens.push(gsap.to(mega, { yPercent: i < idx ? -100 : 100, opacity: 0, duration: .45, ease: "power2.in", overwrite: true }));
      else gsap.set(mega, { yPercent: i < idx ? -100 : 100, opacity: 0 });
    });
    cards.forEach((card, i) => {
      if (i === idx) {
        activeTweens.push(gsap.fromTo(card, { opacity: 0, y: 26, rotation: -1.4, scale: .96 },
          { opacity: 1, y: 0, rotation: 0, scale: 1, duration: .5, ease: "back.out(1.5)", overwrite: true }));
        card.style.zIndex = 2; card.style.pointerEvents = "auto";
      } else {
        activeTweens.push(gsap.to(card, { opacity: 0, duration: .25, overwrite: true }));
        card.style.zIndex = 0; card.style.pointerEvents = "none";
      }
    });
    stubs.forEach((s, i) => s.classList.toggle("active", i === idx));
    if (backdrop) activeTweens.push(gsap.to(backdrop, { opacity: (idx / (total - 1)) * .85, duration: .6, overwrite: true }));
    if (cue) activeTweens.push(gsap.to(cue, { opacity: idx === 0 ? 1 : 0, duration: .3, overwrite: true }));
    const climax = idx === total - 1;
    frame.classList.toggle("climax", climax);
    if (climax) {
      const stub = stubs[idx];
      if (stub) { stub.classList.remove("stamped"); void stub.offsetWidth; stub.classList.add("stamped"); }
    }
  }

  // Instant, tween-free settle — used only at the pin's own start/end
  // boundaries so whichever beat is current is always fully resolved the
  // moment the section is entered or left, never mid-flight.
  function hardSettle(idx) {
    killActiveTweens();
    megas.forEach((mega, i) => gsap.set(mega, { yPercent: i === idx ? 0 : (i < idx ? -100 : 100), opacity: i === idx ? 1 : 0 }));
    cards.forEach((card, i) => {
      gsap.set(card, { opacity: i === idx ? 1 : 0, y: 0, rotation: 0, scale: 1 });
      card.style.zIndex = i === idx ? 2 : 0;
      card.style.pointerEvents = i === idx ? "auto" : "none";
    });
    stubs.forEach((s, i) => s.classList.toggle("active", i === idx));
    if (backdrop) gsap.set(backdrop, { opacity: (idx / (total - 1)) * .85 });
    if (cue) gsap.set(cue, { opacity: idx === 0 ? 1 : 0 });
    frame.classList.toggle("climax", idx === total - 1);
  }

  let lastIdx = 0;
  ScrollTrigger.create({
    trigger: pinSection, start: "top top", end: "+=" + (total * 55) + "%",
    pin: frame, scrub: 1, invalidateOnRefresh: true,
    onUpdate: self => {
      const idx = Math.min(total - 1, Math.floor(self.progress * total));
      if (idx !== lastIdx) { const prev = lastIdx; lastIdx = idx; activate(idx, prev); }
    },
    onEnter: () => { gsap.set(pinSection, { opacity: 1 }); hardSettle(lastIdx); },
    onEnterBack: () => { gsap.set(pinSection, { opacity: 1 }); hardSettle(lastIdx); },
    // Once unpinned, `frame` keeps whatever hardSettle just locked in (the
    // Final Interviews beat) and simply continues on in normal flow — so
    // without this, it stays fully visible for its own ~650px of ordinary
    // scrolling before Join The Lineup arrives, reading as Final Interviews
    // lingering/reappearing rather than the sequence actually finishing.
    // Fading the whole `pinSection` (frame *and* its surrounding backdrop,
    // not just frame) out fast right as the pin releases is what actually
    // ends it — fading frame alone left its paper-raised backdrop still
    // fully opaque and, being position:relative with its own stacking
    // order, it kept painting over the next section regardless of frame's
    // own opacity. onEnterBack/onEnter above restore it the instant the
    // visitor scrolls back up into range.
    onLeave: () => { lastIdx = total - 1; hardSettle(lastIdx); gsap.to(pinSection, { opacity: 0, duration: .35, ease: "power1.in", overwrite: true }); },
    onLeaveBack: () => { lastIdx = 0; hardSettle(lastIdx); }
  });
}

/* ---------- Social: per-photo scroll parallax + running handle ---------- */
function initSocialMotion(root) {
  const runner = root.querySelector("#socialRunner span");
  if (runner && window.gsap && !reducedMotion()) {
    gsap.to(runner, { xPercent: -50, ease: "none", scrollTrigger: { trigger: "#socialRunner", start: "top bottom", end: "bottom top", scrub: 1 } });
  }
  if (!window.gsap || reducedMotion()) return;
  root.querySelectorAll(".wall-photo").forEach(el => {
    const speed = +el.dataset.speed || 0.3;
    gsap.to(el, {
      yPercent: -30 * speed, ease: "none",
      scrollTrigger: { trigger: el.closest(".wall"), start: "top bottom", end: "bottom top", scrub: 1 }
    });
  });
}

/* ---------- Contact: "WANNA TALK?" pop-in ----------
   Deliberately punchier than the shared .reveal fade-up every other line on
   this page uses (kicker/description/contact-lines keep that, unchanged) —
   the same family of motion as the stamped CTAs elsewhere (stampPulse)
   rather than a new animation language, just turned up: each word (see
   render.js's .pop-word spans) pops in on its own beat — a bigger scale
   swing, a bit of rotation snapping to level, punched in fast with a hard
   overshoot — instead of one block fading up as a whole, so the entrance
   actually reads as an event rather than a transition. Runs once, on
   arrival at the route; the words have no scale/opacity/rotation in their
   base CSS, so with no JS (or reduced motion) they're just there, fully
   legible, no animation needed to reach a correct state. */
function initContactMotion(root) {
  if (!window.gsap || reducedMotion()) return;
  const words = root.querySelectorAll("#contactWannaTalk .pop-word");
  if (!words.length) return;
  gsap.fromTo(words,
    { opacity: 0, scale: .45, y: 46, rotation: gsap.utils.wrap([-7, 6]), transformOrigin: "0% 50%" },
    { opacity: 1, scale: 1, y: 0, rotation: 0, duration: .65, ease: "back.out(2.4)", stagger: .12 });
}
