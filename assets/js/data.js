/* =========================================================================
   MED UIUC — SITE CONTENT (single source of truth)
   ---------------------------------------------------------------------
   Everything a visitor reads on the site lives in this file. HTML/CSS/JS
   handle layout and behavior; this file handles words, names, dates, and
   links. To update the website, edit the values below and save — nothing
   else needs to change.

   Sections in this file:
     1. organization   — who MED is, mission, pillars
     2. navigation      — header menu
     3. social           — Instagram, email, other socials
     4. interestForm    — the ONE recruitment form URL, used everywhere
     5. homepage         — hero, stats, gallery, featured carousel
     6. about             — the full "What is MED?" page
     7. recruitment      — Rush timeline + interest form card
     8. leadership        — Executive Board (photo + bio)
     9. chairs             — Committee chair positions
     10. members            — full roster, grouped by pledge class
     11. alumni              — alumni network (add entries as they come in)
     12. contact              — contact page + footer

   Section-header objects (eyebrow/heading/body) appear next to the data
   they introduce — e.g. `leadershipSection` sits just above `leadership`,
   `alumniSection` just above `alumni`. Keep them paired like that.
   ========================================================================= */

const siteData = {

  /* 1. ORGANIZATION ------------------------------------------------------ */
  organization: {
    name: "Mu Epsilon Delta",
    shortName: "MED",
    chapter: "Epsilon Chapter",
    location: "Urbana-Champaign, IL",
    university: "University of Illinois Urbana-Champaign",
    founded: "2023",
    foundedNote: "UIUC is home to the first Illinois chapter of Mu Epsilon Delta.",
    typeLine: "A nationally recognized, co-educational, pre-health professional fraternity.",
    pillars: [
      {
        name: "Brotherhood",
        description: "A diverse, supportive brotherhood of future healthcare professionals, united by service and leadership."
      },
      {
        name: "Service",
        description: "Meaningful volunteer opportunities that empower members to give back and make a lasting impact in Champaign-Urbana."
      },
      {
        name: "Scholarship",
        description: "Mentorship, resources, and opportunities that help members reach their academic and professional goals in healthcare."
      }
    ]
  },

  /* 2. NAVIGATION ------------------------------------------------------------
     The site is a single page — `route` is the in-page destination (used in
     the URL as #route), `word` is what flashes across the screen during the
     transition to that page, `accent` picks which palette color that page's
     transition/nav-hover uses (must match a --token in styles.css, without
     the --). */
  navigation: [
    { label: "Home", route: "home", word: "MEDPALOOZA", accent: "gold" },
    { label: "About", route: "about", word: "THE STORY", accent: "orange" },
    { label: "Members", route: "members", word: "THE LINEUP", accent: "gold" },
    //{ label: "Alumni", route: "alumni", word: "THE ARCHIVE", accent: "maroon-light" },
    { label: "Rush", route: "rush", word: "GET YOUR PASS", accent: "orange" },
    { label: "Social", route: "social", word: "LIVE", accent: "gold" },
    { label: "Contact", route: "contact", word: "FIND US", accent: "orange" }
  ],

  /* 3. SOCIAL --------------------------------------------------------------- */
  social: {
    instagram: {
      handle: "@uiucmed",
      url: "https://www.instagram.com/uiucmed/",
      posts: [
        { image: "assets/images/instagram/insta1.jpg", url: "https://www.instagram.com/p/Dcy2QJpud09/" },
        { image: "assets/images/instagram/insta2.jpg", url: "https://www.instagram.com/p/DcYz6uLurY7/" },
        { image: "assets/images/instagram/insta3.jpg", url: "https://www.instagram.com/p/Dcv5uFSoK0A/?img_index=1" },
        { image: "assets/images/instagram/insta4.jpg", url: "https://www.instagram.com/p/DctYRpxulgA/" },
        { image: "assets/images/instagram/insta5.jpg", url: "https://www.instagram.com/p/Dcer0HvIE5a/?img_index=1" },
        { image: "assets/images/instagram/insta6.jpg", url: "https://www.instagram.com/p/DcXXMOeIL_s/?img_index=1" },
        { image: "assets/images/instagram/insta7.jpg", url: "https://www.instagram.com/p/DcLyVW_lUux/?img_index=1" }
      ]
    },
    email: "muepsiliondeltauiuc@gmail.com"
  },

  /* 4. INTEREST FORM ---------------------------------------------------------
     Every "Join", "I'm Interested", or Rush CTA on the site should read
     from this one value. Update it once here each semester. */
  interestForm: {
    url: "https://forms.gle/26YxxXH6cj6bz2Xf9",
    ctaText: "Claim Your Pass",
    note: "Opens in a new tab. Submissions are collected through Google Forms."
  },

  /* 5. HOMEPAGE ------------------------------------------------------------- */
  homepage: {
    hero: {
      heading: "Mu Epsilon Delta",
      subheading: "Epsilon Chapter · Urbana-Champaign",
      primaryCta: { text: "Get Your Pass", href: "rush" },
      secondaryCta: { text: "The Full Story", href: "about" },
      image: "assets/images/hero.jpg"
    },
    about: {
      heading: "About Our Chapter",
      body: "Mu Epsilon Delta at the University of Illinois Urbana-Champaign is a community of pre-health students who serve others, grow together, and build friendships that last well beyond college."
    },
    stats: {
      heading: "Chapter Impact",
      body: "These highlights represent the collective dedication and impact of the MED community.",
      items: [
        { value: 140, label: "Members" },
        { value: 3000, label: "Service Hours" },
        { value: 25, label: "Events per Semester" }
      ]
    },
    gallery: {
      heading: "Chapter Life",
      body: "The moments and shared experiences that bring MED to life.",
      images: [
        { src: "assets/images/gallery/chapter1.jpg", alt: "MED event", large: true },
        { src: "assets/images/gallery/chapter2.jpg", alt: "MED volunteering" },
        { src: "assets/images/gallery/chapter3.jpg", alt: "MED retreat" },
        { src: "assets/images/gallery/chapter4.jpg", alt: "MED social" },
        { src: "assets/images/gallery/chapter5.jpg", alt: "MED chapter" }
      ]
    },
    featured: {
      heading: "Featured Moments",
      body: "The moments our members love most.",
      images: [
        { src: "assets/images/gallery/carousel1.jpg", alt: "MED featured moment 1" },
        { src: "assets/images/gallery/carousel2.jpg", alt: "MED featured moment 2" },
        { src: "assets/images/gallery/carousel3.jpg", alt: "MED featured moment 3" },
        { src: "assets/images/gallery/carousel4.jpg", alt: "MED featured moment 4" },
        { src: "assets/images/gallery/carousel5.jpg", alt: "MED featured moment 5" },
        { src: "assets/images/gallery/carousel6.jpg", alt: "MED featured moment 6" }
      ]
    },
    instagram: {
      heading: "Live From MED"
    }
  },

  /* 6. ABOUT PAGE ------------------------------------------------------------- */
  about: {
    eyebrow: "The Origin Story",
    heading: "What Is Mu Epsilon Delta?",
    intro: "Mu Epsilon Delta (MED) is a nationally recognized, co-educational, pre-health professional fraternity that guides students on their pre-health tracks. Built on brotherhood, scholarship, and service, MED gives students at the University of Illinois Urbana-Champaign the community and tools to reach their pre-health goals — welcoming students of any track, major, or professional path.",
    /* The Manifesto beat's four editorial lines — each one paraphrases a
       specific sentence of `intro` above for a punchier, oversized
       presentation. Not new claims; keep in sync with intro if it changes. */
    manifesto: [
      "A NATIONALLY RECOGNIZED, CO-EDUCATIONAL PRE-HEALTH FRATERNITY.",
      "BUILT ON BROTHERHOOD. SCHOLARSHIP. SERVICE.",
      "THE COMMUNITY AND TOOLS TO REACH YOUR PRE-HEALTH GOALS.",
      "WELCOMING STUDENTS OF ANY TRACK, MAJOR, OR PROFESSIONAL PATH."
    ],
    offerings: [
      "Local volunteering",
      "Leadership",
      "Academic support",
      "Research & clinical guidance",
      "Alumni connections"
    ],
    stats: [
      { value: "2023", label: "Chapter founded" },
      { value: "100+", label: "Dedicated members" },
      { value: "18", label: "Majors represented" },
      { value: "10", label: "Pre-health tracks" }
    ],
    historyBody: "UIUC is home to the first Illinois chapter of MED. From pre-meds majoring in biology to pre-genetic-counseling students majoring in sociology, pre-health students on any path find a supportive network here.",
    programs: {
      heading: "How We Prepare Members",
      items: [
        {
          title: "Speaker Events",
          description: "Physician speaker events that connect members with professionals across healthcare."
        },
        {
          title: "Experience Panels",
          description: "MED member panels offering an honest, first-hand look at different healthcare careers."
        },
        {
          title: "Lab Tours & Workshops",
          description: "Lab tours and skill workshops that build hands-on experience relevant to healthcare."
        },
        {
          title: "DEI Workshops",
          description: "Ongoing workshops that build cultural awareness and inclusion in healthcare."
        }
      ]
    },
    community: {
      heading: "Community & Brotherhood",
      body: "Beyond professional development, MED is committed to giving back and building brotherhood. Monthly events — movie and game nights, cultural potlucks, and more — connect members across the chapter and within pledge classes. That brotherhood becomes a support system: members help each other through coursework, share study resources, and open doors to clinical and professional opportunities.",
      partnersLabel: "Service Partners",
      partners: ["IHelp", "Gift of Life", "Strides Shelter"],
      sponsorsLabel: "Sponsors",
      sponsors: ["Celsius", "Poppi", "Alani"]
    },
    closing: "Through professional growth, community service, inclusivity, and brotherhood, MED gives pre-health students of every background a place to grow, connect, and succeed. We hope to see you during rush!",
    closingCta: { text: "View Rush", href: "rush" },
    gallery: {
      heading: "Favorite MED Moments",
      caption: "Moments that last a lifetime.",
      images: [
        { src: "assets/images/gallery/about1.jpg", alt: "MED volunteering" },
        { src: "assets/images/gallery/about2.jpg", alt: "MED community" },
        { src: "assets/images/gallery/about3.jpg", alt: "MED members" },
        { src: "assets/images/gallery/about4.jpg", alt: "MED event" }
      ]
    }
  },

  /* 7. RECRUITMENT / RUSH -------------------------------------------------------
     Update `active` and `timeline` each semester. If recruitment is closed,
     set active to false and the page will show `closedMessage` instead. */
  recruitment: {
    active: true,
    eyebrow: "Get Your Pass",
    heading: "Rush Schedule",
    description: "Attend an info session and claim your pass below — we can't wait to meet you.",
    closedMessage: "Rush isn't currently open. Check back soon or follow @uiucmed for updates on the next recruitment cycle.",
    /* This is the real, current Fall Rush schedule — MEDpalooza — as posted
       by @uiucmed. Update this each semester when the new schedule drops. */
    timeline: [
      { day: "Mon", date: "Aug 31", title: "Quad Day", time: "12–4pm", location: "Table 550", dress: "", note: "Kickoff — come find us!" },
      { day: "Mon", date: "Aug 31", title: "Info Session 1", time: "6–7pm", location: "Zoom", dress: "Casual" },
      { day: "Tue", date: "Sep 1", title: "Info Session 2", time: "6–7pm", location: "Loomis 151", dress: "Casual" },
      { day: "Fri", date: "Sep 4", title: "Speed Dating", time: "6–9pm", location: "Union Room A", dress: "Business Casual" },
      { day: "Sun", date: "Sep 6", title: "Meet Your Track", time: "10am–12pm", location: "Union Room A", dress: "Business Casual" },
      { day: "Tue", date: "Sep 8", title: "DEI Case Study", time: "6–8pm", location: "Gregory Hall 217", dress: "Business Professional" },
      { day: "Sun", date: "Sep 13", title: "Game Day", time: "2–4pm", location: "South Quad", dress: "Athletic / Casual" },
      { day: "Mon", date: "Sep 14", title: "Escape Room", time: "6–8pm", location: "Sydney Lu 2200", dress: "Casual" },
      { day: "Wed", date: "Sep 16", title: "Final Interviews", time: "5–10pm", location: "Grainger — TBD", dress: "Business Professional" }
    ]
  },

  /* 8. LEADERSHIP — Executive Board -------------------------------------------
     Full profiles (photo + bio) are shown on the Members page. */
  leadershipSection: {
    eyebrow: "Headliners",
    heading: "Executive Board",
    body: "Our Executive Board is dedicated to guiding the chapter, creating opportunities for members, and shaping the future of MED."
  },
  leadership: [
    {
      name: "Micheal Piagari",
      role: "President",
      major: "Kinesiology",
      track: "Pre-Med",
      image: "assets/images/members/micheal.JPEG",
      bio: "I'm a Junior majoring in Kinesiology with minors in Chemistry and Astronomy on the pre-med track. I'm interested in human rehabilitation and advancing care for neuromuscular challenges across diverse populations. In my free time, I enjoy running and exploring new restaurants on campus."
    },
    {
      name: "Umaizah Salim",
      role: "Academic Affairs",
      major: "Molecular and Cellular Biology",
      track: "Pre-Med",
      image: "assets/images/members/umaziah.JPEG",
      bio: "I'm a bioengineering major with a minor in chemistry on the Pre-Med track. I'm passionate about medicine because I want to make healthcare more accessible, while also pursuing research that innovates and improves treatments. I hope to combine both passions to make a meaningful impact on patient care. In my free time I like to workout, try new cafes, and spend time with my family/friends! "
    },
    {
      name: "Sebastian Gonzales",
      role: "Communications",
      major: "Molecular and Cellular Biology",
      track: "Pre-Med",
      image: "assets/images/members/sebastian.JPEG",
      bio: "My name is Zarina Naqvi and I'm an MCB major with a chemistry minor. I am pre-med and I am really interested in emergency and internal medicine! I love reading and going on walks around campus with my friends."
    },
    {
      name: "Claire Moon",
      role: "Finance",
      major: "Molecular and Cellular Biology",
      track: "Pre-Dental",
      image: "assets/images/members/claire.JPEG",
      bio: "Hi! My name is Claire, and I'm an MCB major on the pre-dental track. I'm interested in building a community around dentistry and helping others learn more about the field. I'm also involved in research focused on neurotransmitter ion channels and cementum. In my free time, I love spending time with friends, trying out new restaurants and cafés, and staying active outdoors!"
    },
    {
      name: "Sophia Simboli",
      role: "Outreach",
      major: "Kinesiology",
      track: "Pre-Occupational Therapy",
      image: "assets/images/members/sophia.JPEG",
      bio: "I am a Kinesiology major with a minor in Psychology on the Pre-Occupational Therapy track. I am interested in making the healthcare environment welcoming and inclusive for those experiencing disabilities, especially children. In my free time I enjoy working out and cooking!"
    },
    {
      name: "Cameron Brandt ",
      role: "Member Development",
      major: "Molecular and Cellular Biology",
      track: "Pre-Med",
      image: "assets/images/members/cameron.JPEG",
      bio: "I'm a MCB major, pursuing a minor in public health on the Pre-med track. In the future I hope to aid those in rural areas with limited access to healthcare, and specialize in emergency medicine. When I'm not studying, I love to play video games, watch movies, bake, and hang out with friends."
    },
    {
      name: "William Knight",
      role: "Member Development",
      major: "Molecular and Cellular Biology",
      track: "Pre-Med",
      image: "assets/images/members/will.JPEG",
      bio: "I am a junior majoring in MCB with a minor in Spanish on the pre-med track. One day I hope to become a pediatrician and work with kids of all abilities. Finally, I'm a huge basketball and football fan and can name players for hours."
    },
    {
      name: "Ryan Hensley",
      role: "Internal",
      major: "Psychology",
      track: "Pre-Med",
      image: "assets/images/members/ryan.JPEG",
      bio: "I am a Psychology major with a minor in Chemistry on the pre-med track. I'm interested in expanding healthcare to underserved communities, and creating easier paths for access to treatment. In my free time I play golf, baseball, and drive in esports motor races."
    }
  ],

  /* 9. CHAIRS — grouped by committee ------------------------------------------- */
  chairs: {
    eyebrow: "Supporting Acts",
    heading: "Chair Positions",
    body: "Chairs help support the leadership and growth of MED.",
    committees: [
      {
        committee: "Academic Affairs",
        positions: [
          { title: "Research", names: ["Umaizah S", "Mallika S"] },
          { title: "Academic Support", names: ["Anisha U", "Naima T"] },
          { title: "Scholarship", names: ["Owen A"] }
        ]
      },
      {
        committee: "Communications",
        positions: [
          { title: "Website", names: ["Ohm P"] },
          { title: "Social Media", names: ["Ava D", "Filip A", "Sebastian G"] },
          { title: "Advertising", names: ["Julia O"] },
          { title: "Alumni", names: ["Eesha D"] }
        ]
      },
      {
        committee: "Finance",
        positions: [
          { title: "Merch", names: ["Alisha A"] },
          { title: "GoL", names: ["Kammi P"] },
          { title: "Phil", names: ["Lily J"] },
          { title: "Fundraising", names: ["Claire M"] }
        ]
      },
      {
        committee: "Outreach",
        positions: [
          { title: "Vol", names: ["Megan T", "Sophia S"] },
          { title: "PD", names: ["Baani P", "Anisha U"] }
        ]
      },
      {
        committee: "Member Development",
        positions: [
          { title: "Rush", names: ["Deena C", "Maryum P", "Ethan S", "Cameron B"] },
          { title: "Big/Little", names: ["Jakub N", "Sophia S"] },
          { title: "Recruitment/PE", names: ["Emma R", "Will K"] },
          { title: "Brotherhood", names: ["Beta – Chloe K", "Gamma – Emma N", "Delta – Swarnika S", "Epsilon – Paige Z", "Zeta – Ryann R"] }
        ]
      },
      {
        committee: "Internal",
        positions: [
          { title: "Social", names: ["Naima T", "Sarang K"] },
          { title: "DEI", names: ["Lily M", "Olivia"] },
          { title: "Mental Health", names: ["Niamh P", "Misa R"] },
          { title: "PR", names: ["Catherine Z"] },
          { title: "Athletic", names: ["Ryan H"] }
        ]
      }
    ]
  },

  /* 10. MEMBERS — full roster, grouped by pledge class --------------------------
     Add a name to the right class array to add a member. Add a new object
     to `pledgeClasses` to open a new class. */
  members: {
    eyebrow: "Full Lineup",
    heading: "Members of MED",
    body: "Our brotherhood is organized by class.",
    pledgeClasses: [
      {
        name: "Alpha Class",
        members: [
          "Bella Peshek", "Aiden Johnston", "Bianca Namuyomba", "Kyle Johnston", "Ashley Seo",
          "Declan Finerty", "Daria Dzakovic", "Jesus Vallejo", "Sohini Dash", "Michael Xin",
          "Heeran Yang", "Carson Roan", "Eunsol Moon", "Johnathan Temple", "Lena Kim"
        ]
      },
      {
        name: "Beta Class",
        members: [
          "Aahana Meka", "Abir Sun", "Amanda Lee", "Amber Chang", "Calin Wallace",
          "Cally Struck", "Charis Park", "Chloe Krueger", "Colin Shea", "Elyssa Wuerffel",
          "Estefania Linarez", "Kevin Shen", "Luis Pedro Paz de la Creda", "Nathan Chiu", "Owen Rusche",
          "Sam Yeung", "Simone Daly", "Zachary Abrams", "Alexa Zelner"
        ]
      },
      {
        name: "Gamma Class",
        members: [
          "Alisha Amin", "Aqsa Shaikh", "Brina Arvanetes", "Eesha Dhingra", "Colin Glick",
          "Emma Romberg", "Emma Niemczura", "Ethan Stern", "Hubert Wirtel", "Lily Jackson",
          "Kaylee Schifferi", "Julie Chavez", "Krupa Sudheendra", "Lillian Tan", "Nathan Sebastian",
          "Luke Wittenborn", "Priscilla Rodriguez", "Shaun Gillespie", "Soma Ikeda", "Zarina Naqvi"
        ]
      },
      {
        name: "Delta Class",
        members: [
          "Alex Arango", "Anisha Undevia", "Claire Moon", "Gabriela Guerrero", "Gabriela Mlynarczyk",
          "Ivy Qiu", "Matthew Maradkel", "Megan Thing", "Michael Piagari", "Misael Reyes",
          "Natalia Duarte", "Owen Anderson", "Sarang Kim", "Swarnika Sundaresan", "Thomas Hartman"
        ]
      },
      {
        name: "Epsilon Class",
        members: [
          "Maryam Polus", "Deena Callas", "Niamh Parsons", "Azaria Muhammad", "Catherine Zhu",
          "Naz Taskapilioglu", "Connor Pham", "Naima Torres", "Olivia Lopez", "Sebastian Gonzales",
          "Jakub Niedojadlo", "Josh Sinclair", "Sofia Sanchez", "Paige Zikmund", "Alyssa Thakadiyil",
          "Isabella Villalobos", "Nicole Tellez", "Samantha Becker", "Param Sridhar"
        ]
      },
      {
        name: "Zeta Class",
        members: [
          "Aiden Sebastian", "Alex Oh", "Alexander Pasquini", "Ava Driver", "Baani Parmer",
          "Cameron Brandt", "Dana Reed", "Filip Acenicz", "Julia Oabel", "Kammi Poon",
          "Lily Montalvo", "Mallika Singh", "Ohm Patel", "Fae Ademola", "Ryan Hensley",
          "Ryann Robinson", "Shipherah Antni", "Sophia Simboli", "Umaizah Salim", "Will Knight"
        ]
      },
      {
        name: "Eta Class",
        members: [
          "Aiyanna Nash", "Alex Lara", "Aryan Patil", "Ashley Wilson", "Ava Vasicek",
          "Ethan John", "Jack Ruzicka", "Jacques Montes", "Jemima Cerezo", "Jesus Campos",
          "Kacper Shomali", "Kate Walhy", "Klaudia Sieczka", "Nino Protti", "Noah Lambert",
          "Rohan Jain", "Shanti Tailor", "Simir Virk", "Sophia Nguyen", "Yousef Saadeh"
        ]
      }
    ]
  },

  /* 11. ALUMNI ------------------------------------------------------------------
     No alumni are on file yet — the Alumni page will show a "coming soon"
     state until entries are added here. To add an alumnus, add an object:
     { name, graduationYear, degree, currentPath, institution, image, linkedin }
     Only the fields you provide will be shown; the rest are optional. */
  alumniSection: {
    eyebrow: "Past Lineups",
    heading: "Where MED Graduates Go",
    body: "Meet the alumni who started their healthcare journeys as members of MED.",
    emptyState: {
      title: "The Archive Opens Soon",
      body: "We're building out our alumni directory. Check back soon to see where MED graduates have gone."
    }
  },
  alumni: [],

  /* 12. CONTACT + FOOTER ---------------------------------------------------------- */
  contact: {
    eyebrow: "Get In Touch",
    heading: "Contact Us",
    description: "We'd love to hear from you — reach out with any questions or interest in joining MED.",
    email: "muepsiliondeltauiuc@gmail.com"
  },

  footer: {
    orgName: "MED UIUC",
    tagline: "Service · Brotherhood · Scholarship",
    closing: "See you at the next one."
  }

};
