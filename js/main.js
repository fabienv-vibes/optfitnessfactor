(function () {
  "use strict";

  var NAVBAR_OFFSET = 72;
  var SCROLL_THRESHOLD = 48;

  function setMenuOpen(navToggle, navLinks, open) {
    if (navLinks) navLinks.classList.toggle("active", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(open));
  }

  function closeMobileNav(navToggle, navLinks) {
    setMenuOpen(navToggle, navLinks, false);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    var navbar = document.getElementById("navbar");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !navLinks.classList.contains("active");
        setMenuOpen(navToggle, navLinks, open);
      });

      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          closeMobileNav(navToggle, navLinks);
        });
      });

      document.addEventListener("click", function (e) {
        if (!navLinks.classList.contains("active")) return;
        var inside =
          navLinks.contains(e.target) || navToggle.contains(e.target);
        if (!inside) closeMobileNav(navToggle, navLinks);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMobileNav(navToggle, navLinks);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = anchor.getAttribute("href");
        if (!href || href === "#") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          closeMobileNav(navToggle, navLinks);
          return;
        }
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          NAVBAR_OFFSET;
        window.scrollTo({ top: top, behavior: "smooth" });
        closeMobileNav(navToggle, navLinks);
      });
    });

    var sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    var linkBySectionId = new Map();
    sectionLinks.forEach(function (link) {
      var h = link.getAttribute("href");
      if (h && h.length > 1 && h.charAt(0) === "#") {
        linkBySectionId.set(h.slice(1), link);
      }
    });

    var sections = [];
    linkBySectionId.forEach(function (_, id) {
      var sec = document.getElementById(id);
      if (sec) sections.push(sec);
    });

    if (sections.length && sectionLinks.length) {
      var visibleSections = new Map();
      var navSpyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              visibleSections.set(entry.target, entry.intersectionRatio);
            } else {
              visibleSections.delete(entry.target);
            }
          });
          if (!visibleSections.size) return;
          var best = null;
          var bestRatio = -1;
          visibleSections.forEach(function (ratio, el) {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = el;
            }
          });
          if (!best) return;
          var activeLink = linkBySectionId.get(best.id);
          if (!activeLink) return;
          sectionLinks.forEach(function (l) {
            l.classList.remove("active");
          });
          activeLink.classList.add("active");
        },
        {
          rootMargin: "-" + NAVBAR_OFFSET + "px 0px -45% 0px",
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );
      sections.forEach(function (sec) {
        navSpyObserver.observe(sec);
      });
    }

    if (navbar) {
      var onScroll = function () {
        navbar.classList.toggle("scrolled", window.scrollY > SCROLL_THRESHOLD);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  });
})();
