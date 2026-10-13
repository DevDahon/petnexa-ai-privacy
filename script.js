/**
 * PetNexa AI — Master Script
 * Multi-page navigation, accessible mobile drawer, dynamic config,
 * interactive mobile showcase tabs, and hash backward-compatibility.
 */

const SITE_CONFIG = {
  effectiveDate: "June 20, 2026",
  lastUpdated: "October 13, 2026",
  contactEmail: "leaves018@gmail.com",
  developerName: "Dahon",
  appVersion: "1.0.6 (Build 6)",
};

/**
 * Populate dynamic site metadata placeholders
 */
function applyPolicyConfig() {
  document.querySelectorAll("[data-effective-date]").forEach((el) => {
    el.textContent = SITE_CONFIG.effectiveDate;
  });

  document.querySelectorAll("[data-last-updated]").forEach((el) => {
    el.textContent = SITE_CONFIG.lastUpdated;
  });

  document.querySelectorAll("[data-developer-name]").forEach((el) => {
    el.textContent = SITE_CONFIG.developerName;
  });

  document.querySelectorAll("[data-contact-email]").forEach((el) => {
    el.textContent = SITE_CONFIG.contactEmail;
  });

  document.querySelectorAll("[data-app-version]").forEach((el) => {
    el.textContent = SITE_CONFIG.appVersion;
  });

  document.querySelectorAll("[data-contact-link]").forEach((el) => {
    el.setAttribute("href", `mailto:${SITE_CONFIG.contactEmail}`);
  });
}

/**
 * Accessible Mobile Navigation Drawer
 */
function setupMobileNav() {
  const header = document.querySelector(".site-header");
  const toggleBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!header || !toggleBtn || !navMenu) return;

  function closeMenu() {
    header.classList.remove("is-menu-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openMenu() {
    header.classList.add("is-menu-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = header.classList.contains("is-menu-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking any nav link
  navMenu.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-menu-open")) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Close when clicking outside header
  document.addEventListener("click", (e) => {
    if (header.classList.contains("is-menu-open") && !header.contains(e.target)) {
      closeMenu();
    }
  });
}

/**
 * Interactive Mobile Tabs for 3-Phone Showcase
 * Allows mobile visitors to toggle the featured screen on the primary mockup
 */
function setupShowcaseTabs() {
  const tabs = document.querySelectorAll(".showcase-tab-btn");
  const centerPhoneImg = document.querySelector("#center-phone-img");
  const centerPhoneTitle = document.querySelector("#center-phone-title");
  const centerPhoneDesc = document.querySelector("#center-phone-desc");

  if (!tabs.length || !centerPhoneImg) return;

  const screenData = {
    dashboard: {
      src: "./screenshots/02-dashboard.png",
      alt: "PetNexa AI Care Dashboard showing daily routine reminders, stats, and quick actions.",
      title: "Care Dashboard",
      desc: "Daily overview with active pet status, due care items, and single-tap actions.",
    },
    records: {
      src: "./screenshots/04-records.png",
      alt: "PetNexa AI Health Records Vault with vaccination cards and AI OCR document scanning.",
      title: "Clinical Records Vault",
      desc: "Vaccination logs, clinic details, and offline medical history cards.",
    },
    ai: {
      src: "./screenshots/05-ai-assistant.png",
      alt: "PetNexa AI Symptom Assistant showing credit balance, robot guide, and triage intake.",
      title: "AI Symptom Guidance",
      desc: "3-step structured symptom evaluation with credit balance tracking.",
    },
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.getAttribute("data-showcase-tab");
      const target = screenData[key];
      if (!target) return;

      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      // Smooth switch
      centerPhoneImg.style.opacity = "0.4";
      setTimeout(() => {
        centerPhoneImg.src = target.src;
        centerPhoneImg.alt = target.alt;
        if (centerPhoneTitle) centerPhoneTitle.textContent = target.title;
        if (centerPhoneDesc) centerPhoneDesc.textContent = target.desc;
        centerPhoneImg.style.opacity = "1";
      }, 150);
    });
  });
}

/**
 * Table of Contents Scroll-Spy for Privacy Policy Page
 */
function setupPolicyToc() {
  const tocLinks = document.querySelectorAll(".policy-toc-link");
  if (!tocLinks.length) return;

  const sections = [];
  tocLinks.forEach((link) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    const target = document.querySelector(id);
    if (target) sections.push({ link, target });
  });

  if (!sections.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + 140;

    let current = sections[0];
    for (const section of sections) {
      if (section.target.offsetTop <= scrollPos) {
        current = section;
      } else {
        break;
      }
    }

    sections.forEach(({ link }) => {
      link.classList.toggle("is-active", link === current.link);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/**
 * Backward compatibility redirect for old anchor URLs
 * If an external link arrives at index.html#account-deletion, redirect to account-deletion.html
 */
function handleHashRedirects() {
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();

  const isHome = path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("privacy/");

  if (isHome) {
    if (hash === "#account-deletion") {
      window.location.replace("./account-deletion.html");
    } else if (hash === "#privacy-policy" || hash === "#introduction" || hash === "#play-data-safety") {
      window.location.replace(`./privacy-policy.html${hash}`);
    }
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  applyPolicyConfig();
  setupMobileNav();
  setupShowcaseTabs();
  setupPolicyToc();
  handleHashRedirects();
});
