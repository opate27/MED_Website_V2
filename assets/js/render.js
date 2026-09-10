/* =========================================================================
   MEDPALOOZA — Render layer
   Per-view render functions that turn siteData into the markup for the
   current route, mounted into #view by router.js. Persistent chrome
   (topbar / nav overlay / footer) is rendered once by main.js and never
   re-rendered on navigation.
   ========================================================================= */

/* ---------- utils ---------- */
function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function mount(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
  return el;
}
const ROTATIONS = [-4, 3, -2.5, 4, -3.5, 2, -2, 3.5];
function rot(i) { return ROTATIONS[i % ROTATIONS.length]; }
const TORNS = ["torn-1", "torn-2", "torn-3"];
function torn(i) { return TORNS[i % TORNS.length]; }

/* ---------- original hand-drawn doodle set (stroke, currentColor) ---------- */
const DOODLES = {
  star: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 6 L35 24 L54 24 L38 35 L44 53 L30 42 L16 53 L22 35 L6 24 L25 24 Z"/></svg>`,
  heart: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 51C12 39 6 29 6 19c0-8 6-13 12-13 6 0 10 4 12 9 2-5 6-9 12-9 6 0 12 5 12 13 0 10-6 20-24 32Z"/></svg>`,
  lightning: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M34 4 12 34h14l-4 22 26-32H34Z"/></svg>`,
  peace: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="24"/><path d="M30 6v48M30 30 13 47M30 30l17 17"/></svg>`,
  eye: `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 30c6-12 16-18 26-18s20 6 26 18c-6 12-16 18-26 18S10 42 4 30Z"/><circle cx="30" cy="30" r="8"/></svg>`,
  squiggle: `<svg viewBox="0 0 60 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M2 20c6-14 12-14 16 0s10 14 16 0 12-14 16 0-6-14-8 0"/></svg>`
};
function doodle(name, cls) {
  return `<span class="doodle${cls ? " " + cls : ""}">${DOODLES[name] || ""}</span>`;
}

/* ---------- shared building blocks ---------- */
function sectionHeaderHTML({ eyebrow, heading, body, center, tag }) {
  const H = tag || "h2";
  return `
    <div class="section-head${center ? " center" : ""} reveal">
      ${eyebrow ? `<div class="eyebrow-block"><span class="kicker">${esc(eyebrow)}</span></div>` : ""}
      <${H} class="section-title">${esc(heading)}</${H}>
      ${body ? `<p>${esc(body)}</p>` : ""}
    </div>
  `;
}
function collagePhotoHTML(img, i) {
  const wide = img.large ? " wide" : "";
  const depth = [0.18, 0.32, 0.24, 0.4, 0.28][i % 5];
  return `
    <div class="collage-photo torn ${torn(i)}${wide} reveal" style="--rot:${rot(i)}deg; transition-delay:${i * 60}ms" data-rot="${rot(i)}" data-depth="${depth}">
      <img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy">
      <span class="collage-cap">${esc(img.alt)}</span>
    </div>
  `;
}

/* =========================================================================
   HOME
   ========================================================================= */
function posterPieceHTML(p) {
  const style = [
    p.top !== undefined ? `top:${p.top}` : "",
    p.left !== undefined ? `left:${p.left}` : "",
    p.right !== undefined ? `right:${p.right}` : "",
    p.bottom !== undefined ? `bottom:${p.bottom}` : "",
    `--rot:${p.rot || 0}deg`
  ].filter(Boolean).join(";");
  return `<div class="poster-piece${p.hideMobile ? " hide-mobile" : ""}" style="${style}" data-depth="${p.depth || 0.2}" data-fly-x="${p.flyX || 0}" data-fly-y="${p.flyY || 0}">${p.html}</div>`;
}

function renderHomeView(root) {
  const hp = siteData.homepage;
  const org = siteData.organization;
  const g = hp.gallery.images;

  // The poster composition — every scattered element uses real MED facts
  // (chapter, founding year, stats, pillars) as its raw material. Position
  // and rotation are art-directed by hand here; motion.js reads
  // data-depth (cursor parallax) and data-fly-x/-y (scroll deconstruction).
  const pieces = [
    { html: `<span class="poster-tag-vert">${esc(org.chapter)} · ${esc(org.location)}</span>`, top: "14%", left: "3.5%", depth: 0.15, flyX: -14, flyY: -6 },
    { html: `<span class="poster-tag-vert">${esc(org.typeLine)}</span>`, bottom: "6%", right: "3.5%", depth: 0.15, flyX: 14, flyY: 10, hideMobile: true },
    { html: `<div class="poster-cutout"><img src="${esc(g[1].src)}" alt="${esc(g[1].alt)}" loading="lazy"></div>`, top: "9%", left: "9%", rot: -8, depth: 0.35, flyX: -22, flyY: -16, hideMobile: true },
    { html: `<div class="poster-cutout"><img src="${esc(g[3].src)}" alt="${esc(g[3].alt)}" loading="lazy"></div>`, bottom: "10%", right: "8%", rot: 6, depth: 0.4, flyX: 24, flyY: 18 },
    { html: doodle("peace"), top: "18%", right: "16%", rot: -6, depth: 0.5, flyX: 18, flyY: -14, hideMobile: true },
    { html: doodle("star"), bottom: "24%", left: "16%", rot: 10, depth: 0.5, flyX: -16, flyY: 14 },
    { html: doodle("lightning"), top: "10%", left: "42%", rot: -12, depth: 0.6, flyX: -6, flyY: -22, hideMobile: true },
    { html: `<div class="poster-stamp">Est.<br>${esc(org.founded)}</div>`, top: "10%", right: "8%", rot: 8, depth: 0.3, flyX: 20, flyY: -10 },
    { html: `<div class="poster-note"><span class="script">${hp.stats.items[0].value}+ members strong</span></div>`, bottom: "16%", left: "6%", rot: -3, depth: 0.25, flyX: -18, flyY: 20, hideMobile: true },
    { html: `<div class="poster-note"><span class="script">${org.pillars.map(p => p.name).join(" · ")}</span></div>`, top: "30%", right: "5%", rot: 4, depth: 0.28, flyX: 12, flyY: -24, hideMobile: true }
  ];

  root.innerHTML = `
    <div class="poster-stage-pin" id="posterStagePin">
      <section class="poster-stage maroon" id="posterStage">
        <div class="poster-layer poster-bg" id="posterBg"></div>
        ${pieces.map(posterPieceHTML).join("")}
        <div class="poster-piece center-word" data-depth="0.08" data-fly-x="0" data-fly-y="-30">
          <span class="kicker" id="posterKicker" style="justify-content:center">${esc(org.chapter)} · ${esc(org.university)}</span>
          <h1 class="display-xl" id="posterWord">${"MEDPALOOZA".split("").map((ch, i) => `<span class="poster-letter" data-letter="${i}">${ch}</span>`).join("")}</h1>
          <div class="poster-sub" id="posterSub">${esc(org.name)} · Fall Rush · Est. ${esc(org.founded)}</div>
          <div style="margin-top:28px" id="posterAdmitWrap">
            <div class="poster-admit">
              <span class="stub-label">Admit One</span>
              <a class="btn btn-primary" data-magnetic data-cursor="JOIN" data-route="${esc(hp.hero.primaryCta.href)}" href="#${esc(hp.hero.primaryCta.href)}">${esc(hp.hero.primaryCta.text)}</a>
              <a class="btn btn-ghost" data-magnetic data-cursor="VIEW" data-route="${esc(hp.hero.secondaryCta.href)}" href="#${esc(hp.hero.secondaryCta.href)}" style="border-color:var(--ink);color:var(--ink)">${esc(hp.hero.secondaryCta.text)}</a>
            </div>
          </div>
        </div>
        <div class="poster-scroll-cue"><span>Scroll to deconstruct</span><span class="line"></span></div>
      </section>
    </div>

    <section class="maroon" id="home-ticker"></section>
    <section class="section paper" id="home-about"><div class="container"></div></section>

    <section class="section paper-raised"><div class="container" id="home-gallery"></div></section>
    <section class="section paper"><div class="container" id="home-teasers"></div></section>
  `;

  const bg = document.getElementById("posterBg");
  if (bg) bg.style.backgroundImage = `url('${hp.hero.image}')`;

  const tickerItems = hp.stats.items.map(s => `<div class="stat-ticker-item"><span class="num">${s.value.toLocaleString()}</span><span class="label">${esc(s.label)}</span></div><span class="sep">✦</span>`).join("");
  mount("home-ticker", marqueeHTML("home-ticker", tickerItems));

  mount("home-about", `
    <div class="section-head reveal"><span class="kicker">The Pillars</span><h2 class="section-title">${esc(hp.about.heading)}</h2><p>${esc(hp.about.body)}</p></div>
    <div class="pillar-list">
      ${org.pillars.map((p, i) => `
        <div class="pillar-row reveal" style="transition-delay:${i * 90}ms">
          <span class="pillar-num">0${i + 1}</span>
          <div><h3 class="display-md">${esc(p.name)}</h3><p>${esc(p.description)}</p></div>
        </div>
      `).join("")}
    </div>
  `);

  mount("home-gallery", `
    ${sectionHeaderHTML({ eyebrow: "Chapter Life", heading: hp.gallery.heading, body: hp.gallery.body, center: true })}
    <div class="collage-wall">${hp.gallery.images.map(collagePhotoHTML).join("")}</div>
  `);

  const teasers = [
    { label: "The Lineup", desc: "Meet the Executive Board and the full brotherhood.", route: "members" },
    { label: "Get Your Pass", desc: "Fall Rush schedule and how to join.", route: "rush" },
    { label: "Live From MEDpalooza", desc: "Photos from the community, straight off the feed.", route: "social" }
  ];
  mount("home-teasers", `
    <div class="section-head reveal"><span class="kicker">Explore</span><h2 class="section-title">Where to next?</h2></div>
    <div class="teaser-list">
      ${teasers.map((t, i) => `
        <a class="teaser-row reveal" href="#${t.route}" data-route="${t.route}" style="transition-delay:${i * 80}ms">
          <span class="teaser-num">0${i + 1}</span>
          <span class="display-md">${esc(t.label)}</span>
          <span class="teaser-desc">${esc(t.desc)}</span>
          <span class="teaser-arrow">→</span>
        </a>
      `).join("")}
    </div>
  `);
}

/* =========================================================================
   ABOUT — "The MEDPALOOZA Experience"
   Five acts, one continuous descent into the festival: THE GATES (a pinned
   split-wordmark opener) -> THE MANIFESTO (editorial phrase-by-phrase
   reveals, normal flow) -> THE MAP (one pinned sequence: an illustrated
   festival map with a "YOU ARE HERE" marker that travels between four
   stage destinations, each taking over the viewport in turn) -> a quiet
   culture beat -> THE FINALE. No photography except one treated,
   duotone frame behind the Gates (art direction, not an inserted team
   photo). See motion.js's initAboutMotion for the scroll mechanics; every
   piece here renders a complete, correct state before any JS touches it —
   in particular Stage 0 of the map ships fully visible by default (the
   exact "invisible Stage 1" hazard named explicitly this round).
   ========================================================================= */

/* ---------- Act 1: the opener ----------
   Deliberately the opposite of Home's poster-stage: no photo, no pin, no
   scattered pieces. Home is the festival poster/invitation; About is
   opening the program to find out what MED actually is — so this follows
   "Wanna Talk?"'s philosophy (kicker + one confident statement + one
   accent line + real space, nothing fighting for attention) without
   reusing its layout: right-aligned instead of left, with one small
   festival-stamp detail instead of a floating doodle. */
function aboutOpenHTML() {
  const org = siteData.organization;
  return `
    <section class="about-open">
      <div class="about-open-inner">
        <span class="about-open-prefix" id="aboutOpenPrefix">About</span>
        <h1 class="about-open-word" id="aboutOpenWord">${esc(org.shortName)}</h1>
      </div>
      <div class="scroll-cue-light" id="aboutOpenCue" aria-hidden="true"><span>Scroll</span><span class="line"></span></div>
    </section>
  `;
}

/* ---------- Act 2: THE MANIFESTO ----------
   Four editorial lines (data.js's about.manifesto — each paraphrases one
   sentence of the real about.intro). Presentation, not content, is what's
   different here: each line gets its own distinct, independently scrubbed
   (never pinned) entrance so nothing here can stack/overlap anything else. */
function manifestoLineHTML(line, i) {
  if (i === 1) {
    const words = line.split(" ");
    return `
      <div class="manifesto-line manifesto-line-1" data-index="1">
        <p class="manifesto-text">${words.map((w, wi) => `<span class="mf-word" data-word="${wi}">${esc(w)}</span>`).join(" ")}</p>
      </div>
    `;
  }
  if (i === 2) {
    return `
      <div class="manifesto-line manifesto-line-2" data-index="2">
        <p class="manifesto-text">${esc(line)}</p>
        <svg class="manifesto-underline" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden="true"><path d="M2 12 Q160 22 318 12"></path></svg>
      </div>
    `;
  }
  const doodleName = i === 0 ? "star" : i === 3 ? "lightning" : null;
  return `
    <div class="manifesto-line manifesto-line-${i}" data-index="${i}">
      <p class="manifesto-text">${esc(line)}</p>
      ${doodleName ? doodle(doodleName, "ambient manifesto-doodle") : ""}
    </div>
  `;
}
function manifestoHTML() {
  const a = siteData.about;
  return `
    <section class="section paper manifesto-section">
      <div class="container">
        <span class="kicker reveal">${esc(a.eyebrow)}</span>
        <div class="manifesto">${a.manifesto.map(manifestoLineHTML).join("")}</div>
      </div>
    </section>
  `;
}

/* ---------- Act 3+4: THE FOUR STAGES (the centerpiece) ----------
   No map/path visual — four full-viewport "moments" the visitor moves
   through on one pinned scrub, each taking over the whole frame in turn
   with its own distinct treatment (see STAGE_TREATMENTS below). */

/* Each stage gets a distinct takeover treatment (never a "card"). Stage 0
   ships with no special fragment markup because it's the one guaranteed
   visible by default — everything else here is enhancement motion.js
   layers on top once it runs. */
const STAGE_TREATMENTS = ["unfurl", "assemble", "ticker", "explode"];
function stageSpotlightHTML(item, i) {
  const cls = STAGE_TREATMENTS[i % STAGE_TREATMENTS.length];
  let body;
  if (cls === "ticker") {
    body = `
      <span class="stage-tag">Stage 0${i + 1}</span>
      <div class="stage-ticker-wrap">${marqueeHTML("stageTicker" + i, `<span class="stage-ticker-text">${esc(item.title)}</span>`)}</div>
      <p class="stage-desc">${esc(item.description)}</p>
    `;
  } else if (cls === "explode") {
    const words = item.title.split(" ");
    body = `
      <span class="stage-tag">Stage 0${i + 1}</span>
      <h3 class="stage-title stage-title-explode">${words.map((w, wi) => `<span class="stage-explode-word" data-word-index="${wi}">${esc(w)}</span>`).join(" ")}</h3>
      <p class="stage-desc">${esc(item.description)}</p>
    `;
  } else if (cls === "assemble") {
    body = `
      <span class="stage-tag stage-fragment" data-frag="0">Stage 0${i + 1}</span>
      <h3 class="stage-title stage-fragment" data-frag="1">${esc(item.title)}</h3>
      <p class="stage-desc stage-fragment" data-frag="2">${esc(item.description)}</p>
      ${doodle("eye", "stage-fragment stage-fragment-doodle")}
    `;
  } else {
    body = `
      <span class="stage-tag">Stage 0${i + 1}</span>
      <h3 class="stage-title">${esc(item.title)}</h3>
      <p class="stage-desc">${esc(item.description)}</p>
    `;
  }
  return `
    <div class="stage-spotlight stage-spotlight-${cls}" data-stage="${i}" id="stageSpotlight${i}">
      <span class="stage-numeral" aria-hidden="true">0${i + 1}</span>
      <div class="stage-content">${body}</div>
    </div>
  `;
}
function stageJourneyHTML(a) {
  const items = a.programs.items;
  return `
    <section class="section paper-raised" style="padding-bottom:0">
      <div class="container">${sectionHeaderHTML({ eyebrow: "The Set", heading: a.programs.heading })}</div>
    </section>
    <section class="paper-raised stages-pin">
      <div class="container stages-frame" id="stagesFrame">
        <div class="stage-zone">${items.map((it, i) => stageSpotlightHTML(it, i)).join("")}</div>
        <div class="stage-progress" aria-hidden="true">
          ${items.map((_, i) => `<span class="stage-dot${i === 0 ? " active" : ""}" data-dot="${i}"></span>`).join("")}
        </div>
        <div class="stage-fallback-list">
          ${items.map((p, i) => `<div class="stage-fallback-item"><span class="n">0${i + 1}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div></div>`).join("")}
        </div>
      </div>
    </section>
  `;
}

/* ---------- quiet beat: culture/community, kept close to the previous
   round's version (it wasn't what needed rethinking) ---------- */
function cultureStickerHTML(text, i) {
  return `<button type="button" class="culture-sticker torn ${torn(i)}" style="--rot:${rot(i)}deg">${esc(text)}</button>`;
}

function renderAboutView(root) {
  const a = siteData.about;
  const org = siteData.organization;

  root.innerHTML = `
    ${aboutOpenHTML()}
    ${manifestoHTML()}
    ${stageJourneyHTML(a)}
    <section class="section paper"><div class="container" id="about-culture"></div></section>
    <section class="section maroon about-finale"><div class="container" id="about-finale"></div></section>
  `;

  mount("about-culture", `
    ${sectionHeaderHTML({ eyebrow: "Behind The Scenes", heading: a.community.heading, body: a.community.body })}
    <p class="reveal" style="font-size:clamp(16px,1.8vw,19px);max-width:680px;margin-bottom:22px">${esc(a.historyBody)}</p>
    <div class="chip-row reveal" style="margin-bottom:32px">${a.offerings.map(o => `<span class="chip">${esc(o)}</span>`).join("")}</div>
    <div class="culture-board">
      <div class="culture-group reveal">
        <span class="kicker" style="margin-bottom:14px">${esc(a.community.partnersLabel)}</span>
        <div class="culture-stickers">${a.community.partners.map((p, i) => cultureStickerHTML(p, i)).join("")}</div>
      </div>
      <div class="culture-group reveal" style="transition-delay:80ms">
        <span class="kicker" style="margin-bottom:14px">${esc(a.community.sponsorsLabel)}</span>
        <div class="culture-stickers">${a.community.sponsors.map((s, i) => cultureStickerHTML(s, i)).join("")}</div>
      </div>
    </div>
  `);

  const finaleTeasers = [
    { label: "The Lineup", desc: "Meet the Executive Board and the full brotherhood.", route: "members" },
    { label: "Get Your Pass", desc: "Fall Rush schedule and how to join.", route: "rush" },
    { label: "Chapter Life", desc: "Real moments from the MED community.", route: "home" }
  ];
  mount("about-finale", `
    <div class="display-xl reveal finale-word">MEDPALOOZA</div>
    <a class="btn btn-primary reveal" data-magnetic data-cursor="VIEW" data-route="${esc(a.closingCta.href)}" href="#${esc(a.closingCta.href)}" style="margin-top:28px">${esc(a.closingCta.text)}</a>
    <div class="teaser-list finale-teasers">
      ${finaleTeasers.map((t, i) => `
        <a class="teaser-row reveal" href="#${t.route}" data-route="${t.route}" style="transition-delay:${i * 80}ms">
          <span class="teaser-num">0${i + 1}</span>
          <span class="display-md">${esc(t.label)}</span>
          <span class="teaser-desc">${esc(t.desc)}</span>
          <span class="teaser-arrow">→</span>
        </a>
      `).join("")}
    </div>
  `);
}

/* =========================================================================
   MEMBERS — "The Lineup"
   ========================================================================= */
/* Deterministic "random" size step for general-roster names, so the field
   reads as organic/varied but never jumps between reloads. */
const NAME_SIZES = [16, 20, 15, 24, 17, 21];
function nameSize(i) { return NAME_SIZES[i % NAME_SIZES.length]; }

function lineupNameHTML(name, i, opts) {
  const tier = opts.tier;
  const attrs = [`data-tier="${tier}"`, `tabindex="0"`, `class="lineup-name reveal"`, `style="transition-delay:${(i % 20) * 20}ms;${tier === "member" ? ` --nsize:${nameSize(i)}px` : ""}"`];
  if (opts.className) attrs.push(`title="${esc(opts.className)}" data-class="${esc(opts.className)}"`);
  if (tier === "headliner") {
    attrs.push(`data-cursor="MEET"`, `data-name="${esc(opts.person.name)}"`, `data-role="${esc(opts.person.role)}"`, `data-major="${esc(opts.person.major)}${opts.person.track ? " · " + esc(opts.person.track) : ""}"`, `data-bio="${esc(opts.person.bio)}"`, `data-image="${esc(opts.person.image)}"`);
  }
  return `<span ${attrs.join(" ")}>${esc(name)}</span>`;
}

function crewItemHTML(group) {
  const positions = group.positions.map(p => `<div class="crew-position"><span class="title">${esc(p.title)}:</span> <span class="names">${p.names.map(esc).join(", ")}</span></div>`).join("");
  return `<div class="crew-item"><h3>${esc(group.committee)}</h3>${positions}</div>`;
}

function renderMembersView(root) {
  const ls = siteData.leadershipSection;
  const ch = siteData.chairs;
  const mb = siteData.members;

  root.innerHTML = `
    <section class="section paper" style="padding-top:50px;padding-bottom:0">
      <div class="lineup-hero container">
        <span class="kicker">${esc(ls.eyebrow)}</span>
        <h1 class="display-xl" style="margin-top:10px">THE LINEUP</h1>
        <p style="max-width:520px;margin:16px auto 0">${esc(ls.body)}</p>
        <div class="filter-row">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="headliner">Headliners</button>
          <button class="filter-btn" data-filter="member">Full Lineup</button>
          <button class="filter-btn" data-filter="chairs">Crew</button>
        </div>
      </div>
    </section>

    <section class="section paper" data-panel="names">
      <div class="container lineup-arena">
        <div class="lineup-field" id="lineup-field"></div>
        <div class="lineup-spotlight" id="lineupSpotlight">
          <img id="lineupSpotlightImg" src="${esc(siteData.homepage.gallery.images[0].src)}" class="show" alt="">
          <div class="tag" id="lineupSpotlightTag">The full brotherhood</div>
        </div>
      </div>
    </section>

    <section class="section paper-raised" data-panel="chairs" style="display:none">
      <div class="container">
        ${sectionHeaderHTML({ eyebrow: ch.eyebrow, heading: ch.heading, body: ch.body })}
        <div class="crew-columns">${ch.committees.map(crewItemHTML).join("")}</div>
      </div>
    </section>
  `;

  // Build the flowing field: headliners first (large, Anton), then the full
  // roster (small, varied, no boxes) — filters just toggle which tiers show.
  const fieldHTML = [];
  siteData.leadership.forEach((p, i) => fieldHTML.push(lineupNameHTML(p.name, i, { tier: "headliner", person: p })));
  let idx = 0;
  mb.pledgeClasses.forEach(pc => {
    pc.members.forEach(name => { fieldHTML.push(lineupNameHTML(name, idx++, { tier: "member", className: pc.name })); });
  });
  mount("lineup-field", fieldHTML.join(""));

  // Spotlight: hovering a headliner swaps in their real photo; hovering a
  // general member (no photo on file) updates the caption only — never a
  // fake photo.
  const spotImg = document.getElementById("lineupSpotlightImg");
  const spotTag = document.getElementById("lineupSpotlightTag");
  const defaultSpotlightImage = spotImg.src;
  root.querySelectorAll(".lineup-name").forEach(el => {
    el.addEventListener("mouseenter", () => {
      if (el.dataset.tier === "headliner") {
        spotImg.src = el.dataset.image;
        spotImg.classList.add("show");
        spotTag.textContent = `${el.dataset.name} · ${el.dataset.role}`;
      } else {
        // Reset off any exec photo left showing from a previous hover —
        // the general roster has no photos on file, so it falls back to
        // the same default group shot the panel opens with.
        spotImg.src = defaultSpotlightImage;
        spotTag.textContent = `${el.textContent} · ${el.dataset.class || ""}`;
      }
      spotTag.classList.add("show");
    });
  });

  // Filters: "all" shows headliners + members in the field, hides crew;
  // "chairs" hides the field entirely and shows the crew list instead.
  const filterBtns = root.querySelectorAll(".filter-btn");
  const namesPanel = root.querySelector('[data-panel="names"]');
  const chairsPanel = root.querySelector('[data-panel="chairs"]');
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      if (f === "chairs") {
        namesPanel.style.display = "none";
        chairsPanel.style.display = "";
      } else {
        namesPanel.style.display = "";
        chairsPanel.style.display = "none";
        root.querySelectorAll(".lineup-name").forEach(el => {
          el.style.display = (f === "all" || el.dataset.tier === f) ? "" : "none";
        });
      }
    });
  });

  // Click a headliner for the full animated profile card.
  root.querySelectorAll('.lineup-name[data-tier="headliner"]').forEach(el => {
    el.addEventListener("click", () => openMemberDetail(el.dataset));
    el.addEventListener("keydown", e => { if (e.key === "Enter") openMemberDetail(el.dataset); });
  });
}

function openMemberDetail(d) {
  const overlay = document.getElementById("memberDetail");
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="member-detail-card">
      <button class="member-detail-close" id="memberDetailClose" aria-label="Close">✕</button>
      <img src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy">
      <div>
        <span class="role-tag">${esc(d.role)}</span>
        <h3>${esc(d.name)}</h3>
        <div class="major">${esc(d.major)}</div>
        <p>${esc(d.bio)}</p>
      </div>
    </div>
  `;
  overlay.classList.add("open");
  document.getElementById("memberDetailClose").addEventListener("click", closeMemberDetail);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeMemberDetail(); });
}
function closeMemberDetail() {
  const overlay = document.getElementById("memberDetail");
  if (overlay) overlay.classList.remove("open");
}

/* =========================================================================
   ALUMNI — "The Archive"
   ========================================================================= */
function renderAlumniView(root) {
  const s = siteData.alumniSection;
  const alumni = siteData.alumni;
  const founded = parseInt(siteData.organization.founded, 10);
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let y = founded; y <= thisYear; y++) years.push(y);

  root.innerHTML = `
    <section class="section paper" style="padding-top:60px">
      <div class="container">
        ${sectionHeaderHTML({ eyebrow: s.eyebrow, heading: s.heading, body: s.body, center: true })}
      </div>
      <div class="archive-strip" id="archiveStrip">
        ${years.map(y => `<div class="archive-year" data-year="${y}" tabindex="0">${y}</div>`).join("")}
      </div>
      <div class="container">
        <div class="archive-panel" id="archivePanel"></div>
      </div>
    </section>
  `;

  const alumniByYear = {};
  alumni.forEach(p => { if (p.graduationYear) (alumniByYear[p.graduationYear] = alumniByYear[p.graduationYear] || []).push(p); });

  function showYear(y) {
    root.querySelectorAll(".archive-year").forEach(el => el.classList.toggle("active", +el.dataset.year === y));
    const panel = document.getElementById("archivePanel");
    if (y === founded) {
      panel.innerHTML = `<div class="display-lg">${founded}</div><p>${esc(siteData.organization.foundedNote)}</p>`;
    } else if (alumniByYear[y] && alumniByYear[y].length) {
      panel.innerHTML = `<div class="alumni-year-grid" style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center">${alumniByYear[y].map(p => `
        <div class="credential">${esc(p.name)}${p.currentPath ? " · " + esc(p.currentPath) : ""}</div>
      `).join("")}</div>`;
    } else {
      panel.innerHTML = `<div class="display-md">${esc(s.emptyState.title)}</div><p style="margin-top:10px">${esc(s.emptyState.body)}</p>`;
    }
  }

  root.querySelectorAll(".archive-year").forEach(el => {
    el.addEventListener("click", () => { showYear(+el.dataset.year); el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); });
    el.addEventListener("keydown", e => { if (e.key === "Enter") el.click(); });
  });
  showYear(thisYear);
}

/* =========================================================================
   RUSH — "Get Your Pass" + Set Times
   ========================================================================= */
function renderRushView(root) {
  const r = siteData.recruitment;
  root.innerHTML = `
    <section class="section paper" style="padding-top:60px;padding-bottom:16px">
      <div class="container" id="rush-header"></div>
    </section>

    <section class="lineup-pin paper-raised" id="rush-schedule-wrap">
      <div class="container" id="rush-schedule-inner"></div>
    </section>

    <section class="section maroon rush-finale">
      ${doodle("star", "ambient")}
      <div class="container" style="text-align:center;position:relative;z-index:1">
        <div id="rush-wristband"></div>
        <div id="rush-pass"></div>
      </div>
    </section>
  `;

  mount("rush-header", `
    <span class="kicker reveal">${esc(r.eyebrow)}</span>
    <h1 class="display-lg reveal" style="margin-top:16px">${r.active ? "SET TIMES" : "Rush"}</h1>
    <p class="reveal" style="font-size:17px;max-width:640px;margin-top:16px">${r.active ? esc(r.description) : esc(r.closedMessage)}</p>
  `);

  if (!r.active) { mount("rush-schedule-inner", ""); mount("rush-wristband", ""); mount("rush-pass", ""); return; }

  /* THE LINEUP — a stage-schedule signboard, not a timeline. One pinned
     frame per Rush event: a giant date/day treated like marquee signage
     scrolls through behind a stamped ticket-card that carries the real
     info, with a fanned stub-rack (not a line of dots) tracking where you
     are. The final event (Final Interviews) gets a blackout/spotlight +
     stamp for a real climax. Mobile trades the pin for a native swipe
     strip of self-contained ticket cards — a different interaction, not
     a shrunk one. See initLineupMotion in motion.js. */
  const items = r.timeline;
  const total = items.length;

  const dateMegaHTML = (item, i) => `
    <div class="lineup-date-mega" data-idx="${i}">
      <span class="lineup-date-day">${esc(item.day)}</span>
      <span class="lineup-date-num">${esc(item.date)}</span>
    </div>
  `;
  const cardHTML = (item, i) => `
    <div class="lineup-card" data-idx="${i}">
      <span class="lineup-card-n">${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
      <span class="lineup-card-day">${esc(item.day)} · ${esc(item.date)}</span>
      <h3 class="lineup-card-title">${esc(item.title)}</h3>
      <div class="lineup-card-meta">
        <span>${esc(item.time)}</span>
        <span class="lineup-card-loc">@ ${esc(item.location)}</span>
        ${item.dress ? `<span class="lineup-card-dress">${esc(item.dress)}</span>` : ""}
      </div>
      ${item.note ? `<div class="lineup-card-note">${esc(item.note)}</div>` : ""}
    </div>
  `;
  const stubHTML = (item, i) => {
    const rot = (i % 2 === 0 ? 1 : -1) * (2 + (i % 4) * 2);
    return `<span class="lineup-stub${i === 0 ? " active" : ""}" data-stub="${i}" style="--r:${rot}deg"><span class="lineup-stub-n">${String(i + 1).padStart(2, "0")}</span><span class="lineup-stub-day">${esc(item.day)}</span></span>`;
  };
  const fallbackHTML = (item, i) => `
    <div class="lineup-fallback-item">
      <span class="n">${String(i + 1).padStart(2, "0")}</span>
      <div>
        <span class="lineup-fallback-day">${esc(item.day)} · ${esc(item.date)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.time)} @ ${esc(item.location)}${item.dress ? ` — ${esc(item.dress)}` : ""}</p>
        ${item.note ? `<p class="note">${esc(item.note)}</p>` : ""}
      </div>
    </div>
  `;
  const mobileCardHTML = (item, i) => `
    <div class="lineup-m-card">
      <span class="lineup-m-n">${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
      <span class="lineup-m-day">${esc(item.day)}</span>
      <span class="lineup-m-date">${esc(item.date)}</span>
      <h3 class="lineup-m-title">${esc(item.title)}</h3>
      <div class="lineup-m-meta">
        <span>${esc(item.time)}</span>
        <span class="lineup-m-loc">@ ${esc(item.location)}</span>
        ${item.dress ? `<span class="lineup-m-dress">${esc(item.dress)}</span>` : ""}
      </div>
      ${item.note ? `<div class="lineup-m-note">${esc(item.note)}</div>` : ""}
    </div>
  `;

  mount("rush-schedule-inner", `
    <div class="lineup-frame" id="lineupFrame">
      <div class="lineup-backdrop" id="lineupBackdrop" aria-hidden="true"></div>
      <div class="lineup-reel-mask" aria-hidden="true">
        ${items.map(dateMegaHTML).join("")}
      </div>
      <div class="lineup-card-zone">
        ${items.map(cardHTML).join("")}
      </div>
      <div class="lineup-stub-rack" id="lineupStubRack" aria-hidden="true">
        ${items.map(stubHTML).join("")}
      </div>
      <div class="lineup-cue" id="lineupCue">Scroll to move through the week ↓</div>
    </div>

    <div class="lineup-mobile-strip" id="lineupMobileStrip">
      ${items.map(mobileCardHTML).join("")}
    </div>
    <div class="lineup-mobile-counter" id="lineupMobileCounter" aria-hidden="true">01 / ${String(total).padStart(2, "0")}</div>

    <div class="lineup-fallback-list" id="lineupFallbackList">
      ${items.map(fallbackHTML).join("")}
    </div>
  `);

  const steps = ["Discover MED", "Set Times", "Meet The Members", "Claim Your Pass"];
  mount("rush-wristband", `
    <span class="kicker" style="justify-content:center">${esc(siteData.organization.shortName)} Wristband — Your Progress</span>
    <div class="wristband-flow reveal" id="wristbandSteps">
      ${steps.map((s, i) => `<div class="wristband-step" data-step="${i}"><span class="n">${i + 1}</span>${esc(s)}</div>`).join("")}
    </div>
  `);

  mount("rush-pass", `
    <h2 class="display-xl reveal" style="margin-top:10px">JOIN THE<br>LINEUP</h2>
    <p class="reveal" style="color:var(--cream-dim);max-width:520px;margin-inline:auto">Interested in learning more about ${esc(siteData.organization.name)}? Claim your pass to stay updated on rush events and chapter information.</p>
    <div class="poster-admit reveal" style="margin:34px auto 0">
      <span class="stub-label">Admit One</span>
      <a class="btn btn-primary" id="passCta" data-magnetic data-cursor="JOIN" href="${esc(siteData.interestForm.url)}" target="_blank" rel="noopener noreferrer">${esc(siteData.interestForm.ctaText)}</a>
    </div>
    <div class="form-note" id="passConfirm" style="color:var(--cream-dim)">${esc(siteData.interestForm.note)}</div>
  `);
}

/* =========================================================================
   SOCIAL — "Live From MEDpalooza"
   ========================================================================= */
/* Hand-placed wall layout — the real Instagram posts, and ONLY the real
   posts (no filler photography). They're the dominant, clickable anchors,
   sized in vw so scale scales with viewport — some huge, some smaller,
   several overlapping or bleeding past the edge. Extend this array if more
   posts get added to data.js; it wraps via index % length, so a slot count
   smaller than the real post count silently reuses an earlier slot's exact
   position/size for the extra post(s) — it'll render, just fully hidden
   behind whichever post shares its slot (higher z-index wins). Keep this
   array's length >= siteData.social.instagram.posts.length. */
const WALL_LAYOUT = [
  { top: "0%", left: "3%", w: "44vw", maxW: 640, rot: -3, speed: .3 },
  { top: "3%", right: "-3%", w: "24vw", maxW: 340, rot: 6, speed: .55 },
  { top: "42%", left: "30%", w: "40vw", maxW: 580, rot: -4, speed: .35 },
  { top: "33%", left: "-4%", w: "22vw", maxW: 310, rot: 5, speed: .45 },
  { top: "68%", right: "1%", w: "30vw", maxW: 430, rot: -5, speed: .3 },
  { top: "83%", left: "6%", w: "42vw", maxW: 600, rot: 4, speed: .5 },
  { top: "16%", left: "58%", w: "26vw", maxW: 360, rot: 8, speed: .4 }
];

/* Decorative doodles + handwritten scraps — real MED language only
   (org name, pillars, chapter, handle), nothing invented. */
function wallDoodles() {
  return [
    { name: "lightning", top: "6%", left: "52%", w: 34, rot: -10 },
    { name: "star", top: "23%", right: "8%", w: 36, rot: -8 },
    { name: "heart", top: "60%", left: "38%", w: 30, rot: 10 },
    { name: "peace", top: "90%", right: "28%", w: 36, rot: 6 }
  ];
}
function wallNotes() {
  const org = siteData.organization;
  return [
    { text: `est. ${org.founded}`, top: "17%", left: "6%", rot: -4 },
    { text: org.pillars.map(p => p.name).join(" · "), top: "53%", right: "9%", rot: 3 },
    { text: siteData.social.instagram.handle, top: "96%", left: "48%", rot: -5 }
  ];
}

function renderSocialView(root) {
  const posts = siteData.social.instagram.posts;

  const dominant = posts.map((p, i) => {
    const l = WALL_LAYOUT[i % WALL_LAYOUT.length];
    const pos = [l.top ? `top:${l.top}` : "", l.left ? `left:${l.left}` : "", l.right ? `right:${l.right}` : ""].filter(Boolean).join(";");
    return `
      <div class="wall-photo" style="${pos};width:${l.w};max-width:${l.maxW}px;--rot:${l.rot}deg;z-index:${10 + i}" data-url="${esc(p.url)}" data-speed="${l.speed}">
        <img src="${esc(p.image)}" alt="MED Instagram post" loading="lazy" draggable="false">
        <span class="cap">VIEW POST →</span>
      </div>
    `;
  }).join("");

  const doodles = wallDoodles().map(d => {
    const pos = [d.top ? `top:${d.top}` : "", d.left ? `left:${d.left}` : "", d.right ? `right:${d.right}` : ""].filter(Boolean).join(";");
    return `<div class="wall-doodle" style="${pos};width:${d.w}px;transform:rotate(${d.rot}deg);z-index:25">${DOODLES[d.name]}</div>`;
  }).join("");

  const notes = wallNotes().map(n => {
    const pos = [n.top ? `top:${n.top}` : "", n.left ? `left:${n.left}` : "", n.right ? `right:${n.right}` : ""].filter(Boolean).join(";");
    return `<div class="wall-note script" style="${pos};transform:rotate(${n.rot}deg);z-index:22">${esc(n.text)}</div>`;
  }).join("");

  root.innerHTML = `
    <section class="social-header paper">
      <div class="social-runner" id="socialRunner"><span>${esc(siteData.social.instagram.handle)} · ${esc(siteData.social.instagram.handle)} · ${esc(siteData.social.instagram.handle)} · </span></div>
      <div class="container section-head center">
        <span class="kicker">Live From MEDpalooza</span>
        <h1 class="display-lg" style="margin-top:6px">The Community, Unfiltered</h1>
        <p>Drag a photo. Click one to open the real post.</p>
      </div>
    </section>

    <section class="paper-raised">
      <div class="wall" id="socialWall">${doodles}${notes}${dominant}</div>
      <div class="drag-hint">Drag to rearrange · Click a polaroid to open</div>
      <div style="text-align:center;margin:30px 0 60px">
        <a class="btn btn-ghost" href="${esc(siteData.social.instagram.url)}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN">Follow ${esc(siteData.social.instagram.handle)}</a>
      </div>
    </section>
  `;
  initDragCollage(document.getElementById("socialWall"));
}

/* Module-level so router.js can force-clear a mid-drag photo's elevated
   z-index / pointer capture the instant the user navigates away, presses
   Escape, or opens the nav overlay — a drag that's interrupted (rather than
   ending in a normal pointerup) must never leave state behind. */
let activeDragPhoto = null;
let activeDragPointerId = null;

function resetSocialInteraction() {
  if (!activeDragPhoto) return;
  if (activeDragPointerId !== null) {
    try { activeDragPhoto.releasePointerCapture(activeDragPointerId); } catch (e) { /* already released */ }
  }
  activeDragPhoto.style.zIndex = activeDragPhoto.dataset.baseZ || "";
  activeDragPhoto.classList.remove("dragging");
  activeDragPhoto = null;
  activeDragPointerId = null;
}

function initDragCollage(container) {
  if (!container) return;
  let dragEl = null, startX = 0, startY = 0, startLeft = 0, startTop = 0, moved = false;

  function endDrag(photo) {
    if (photo) {
      photo.style.zIndex = photo.dataset.baseZ || "";
      photo.classList.remove("dragging");
    }
    dragEl = null;
    activeDragPhoto = null;
    activeDragPointerId = null;
  }

  container.querySelectorAll(".wall-photo").forEach(photo => {
    if (!photo.dataset.baseZ) photo.dataset.baseZ = photo.style.zIndex || "";
    photo.addEventListener("pointerdown", e => {
      dragEl = photo; moved = false;
      activeDragPhoto = photo; activeDragPointerId = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      const rect = photo.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      startLeft = rect.left - parentRect.left; startTop = rect.top - parentRect.top;
      photo.setPointerCapture(e.pointerId);
      photo.classList.add("dragging");
      photo.style.zIndex = 50;
    });
    photo.addEventListener("pointermove", e => {
      if (dragEl !== photo) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      photo.style.left = startLeft + dx + "px";
      photo.style.top = startTop + dy + "px";
    });
    photo.addEventListener("pointerup", e => {
      if (dragEl === photo && !moved && photo.dataset.url) window.open(photo.dataset.url, "_blank", "noopener,noreferrer");
      try { photo.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
      endDrag(photo);
    });
    // A drag can be interrupted (browser gesture, tab switch, etc.) without
    // ever firing pointerup — pointercancel is the browser's own signal
    // that this drag is over and must be cleaned up the same way.
    photo.addEventListener("pointercancel", () => endDrag(photo));
  });
}

/* =========================================================================
   CONTACT — "Find Us After The Show"
   ========================================================================= */
function renderContactView(root) {
  const c = siteData.contact;
  const ig = siteData.social.instagram;
  root.innerHTML = `
    <section class="section paper contact-sheet">
      ${doodle("heart", "ambient")}
      <div class="container">
        <span class="kicker reveal">${esc(c.eyebrow)}</span>
        <h1 class="display-xl" id="contactWannaTalk" style="margin-top:10px"><span class="pop-word" id="contactWannaWord">WANNA</span><span class="pop-word" id="contactTalkWord">TALK?</span></h1>
        <p class="script reveal" style="color:var(--orange-deep);margin-top:8px">${esc(c.description)}</p>

        <div class="contact-lines">
          <a class="contact-line reveal" href="mailto:${esc(c.email)}" data-magnetic>
            <span class="contact-label">Email</span>
            <span class="contact-value">${esc(c.email)}</span>
          </a>
          <a class="contact-line reveal" href="${esc(ig.url)}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN" data-magnetic>
            <span class="contact-label">Instagram</span>
            <span class="contact-value">${esc(ig.handle)}</span>
          </a>
          <a class="contact-line reveal" href="#rush" data-route="rush" data-magnetic>
            <span class="contact-label">Rushing?</span>
            <span class="contact-value">Get your pass →</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

/* =========================================================================
   Persistent chrome
   ========================================================================= */
function renderTopbar() {
  mount("topbar", `
    <div class="container topbar-inner">
      <a href="#home" data-route="home" class="topbar-logo"><span class="dot"></span>MEDPALOOZA</a>
      <div class="topbar-actions">
        <div class="wristband-mini" id="wristbandMini" aria-hidden="true"></div>
        <a class="btn btn-primary" href="${esc(siteData.interestForm.url)}" target="_blank" rel="noopener noreferrer" data-cursor="JOIN">Pass</a>
        <button id="menuBtn" class="menu-trigger" aria-expanded="false" aria-controls="navOverlay"><span class="bars"><span></span><span></span><span></span></span> <span class="label">Menu</span></button>
      </div>
    </div>
  `);
  renderWristbandMini();
}

function renderWristbandMini() {
  const el = document.getElementById("wristbandMini");
  if (!el) return;
  const visited = getVisitedRoutes();
  el.innerHTML = siteData.navigation.map(n => `<span class="stamp${visited.has(n.route) ? " on" : ""}"></span>`).join("");
}

function renderNavOverlay(currentRoute) {
  const links = siteData.navigation.map((item, i) => {
    const activeClass = item.route === currentRoute ? " active" : "";
    return `<a href="#${esc(item.route)}" data-route="${esc(item.route)}" data-accent="${esc(item.accent)}" class="${activeClass.trim()}"><span class="idx">0${i + 1}</span>${esc(item.label)}</a>`;
  }).join("");
  mount("navOverlay", `
    <button class="nav-overlay-close" id="navCloseBtn" aria-label="Close menu">Close ✕</button>
    <div class="nav-overlay-inner">
      <div class="nav-overlay-kicker">The Directory</div>
      <nav class="nav-overlay-links">${links}</nav>
      <div class="nav-overlay-foot">
        <span>${esc(siteData.organization.chapter)} · ${esc(siteData.organization.university)}</span>
        <a href="${esc(siteData.social.instagram.url)}" target="_blank" rel="noopener noreferrer">${esc(siteData.social.instagram.handle)}</a>
        <a href="mailto:${esc(siteData.social.email)}">${esc(siteData.social.email)}</a>
      </div>
    </div>
  `);
}

function renderFooter() {
  const year = new Date().getFullYear();
  mount("site-footer", `
    <div class="container">
      <div class="footer-top">
        <div class="display-md">${esc(siteData.footer.closing)}</div>
        <div class="footer-links">
          <a href="${esc(siteData.social.instagram.url)}" target="_blank" rel="noopener noreferrer" data-cursor="OPEN">${esc(siteData.social.instagram.handle)}</a>
          <a href="mailto:${esc(siteData.social.email)}">${esc(siteData.social.email)}</a>
          <a href="${esc(siteData.interestForm.url)}" target="_blank" rel="noopener noreferrer" data-cursor="JOIN">Get Your Pass</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>MEDPALOOZA · ${esc(siteData.footer.orgName)} © ${year}</span>
        <span>${esc(siteData.footer.tagline)}</span>
      </div>
    </div>
  `);
}

/* ---------- marquee (used on Home) ---------- */
function marqueeHTML(mountId, itemsHtml, variant) {
  return `<div class="marquee${variant ? " marquee--" + variant : ""}"><div class="marquee-track" id="${mountId}-track">${itemsHtml}</div></div>`;
}
