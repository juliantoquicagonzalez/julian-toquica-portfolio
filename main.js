(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------------------------------------------------------
     Nav: scroll state + mobile menu
     --------------------------------------------------------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $(".nav-burger");
    var menu = $(".mobile-menu");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          menu.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------------------------------------------------------
     Mouse-reactive gradient (hero signature effect)
     --------------------------------------------------------- */
  function initMouseGradient() {
    var root = document.documentElement;
    root.style.setProperty("--mx", "30%");
    root.style.setProperty("--my", "20%");
    if (!fineHover) return;
    var raf = null, px = 30, py = 20;
    window.addEventListener("mousemove", function (e) {
      px = (e.clientX / window.innerWidth) * 100;
      py = (e.clientY / window.innerHeight) * 100;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        root.style.setProperty("--mx", px.toFixed(2) + "%");
        root.style.setProperty("--my", py.toFixed(2) + "%");
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Logo strip — drifts right as the section transits the
     viewport while scrolling. Plain scroll + rAF, no library.
     --------------------------------------------------------- */
  function initLogoDrift() {
    var section = $(".logo-strip");
    var track = $("[data-logo-track]");
    if (!section || !track || reduced) return;
    /* Desktop's -140..+180 range assumes a wide viewport; on a narrow one that
       positive end can drift past the (finite, once-doubled) strip's own
       content and expose blank space. Start at 0 (a clean, centered first
       chip, not already 140px into the strip) and only ever drift further
       LEFT from there — the strip has plenty of duplicated content in that
       direction, so it can never run out no matter how narrow the screen is. */
    var isNarrow = window.innerWidth < 720;
    var START = isNarrow ? 0 : -140;
    var RANGE = isNarrow ? -90 : 320;
    var raf = null;

    function update() {
      var r = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var progress = 1 - (r.top / vh);
      progress = Math.max(0, Math.min(1, progress));
      track.style.transform = "translateX(" + (START + progress * RANGE) + "px)";
      raf = null;
    }
    window.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------------------------------------------------
     Auto-tag grid/row items with .reveal + a staggered delay,
     so fade-in coverage doesn't depend on hand-annotating every
     card in every page. Runs before initReveals() observes them.
     --------------------------------------------------------- */
  function initAutoReveal() {
    var GROUP_SELECTOR = ".grid-work, .related-grid, .kit-sheet, .tools-grid";
    $$(GROUP_SELECTOR).forEach(function (group) {
      $$(":scope > *", group).forEach(function (el, i) {
        el.classList.add("reveal");
        el.style.transitionDelay = Math.min(i * 60, 420) + "ms";
      });
    });

    var ROW_SELECTOR = ".pair-row, .credit-row, .tool-chip, .detail-row > .ph";
    $$(ROW_SELECTOR).forEach(function (el, i) {
      if (el.classList.contains("reveal")) return;
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i * 50, 300) + "ms";
    });
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------------------------------------------------------
     Lazy videos. Two modes:
     - Narrow/touch screens: mobile browsers block or silently drop
       scroll-triggered autoplay unpredictably, so instead we load
       just enough to show the first frame and put a tap-to-play
       button over it — play() then fires from a real user gesture,
       which no autoplay policy ever blocks.
     - Wider screens: the original scroll-driven autoplay/pause,
       muted and ambient, no button needed.
     --------------------------------------------------------- */
  function initLazyVideos() {
    var videos = $$("video[data-src]");
    if (!videos.length) return;
    var tapToPlay = window.innerWidth < 720;

    function load(video) {
      if (!video.dataset.src) return;
      // Belt-and-suspenders: some mobile browsers are stricter about honoring
      // the muted/playsinline *attributes* once src is assigned via JS, so
      // set the IDL properties too right before the source is attached.
      video.muted = true;
      video.playsInline = true;
      video.src = video.dataset.src;
      video.removeAttribute("data-src");
    }

    if (tapToPlay) {
      function addPlayButton(video) {
        var wrap = video.closest(".ph");
        if (!wrap) return;
        video.preload = "metadata"; // enough to paint the first frame as a poster
        wrap.classList.add("ph--tap-video");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "video-play-btn";
        btn.setAttribute("aria-label", "Play video");
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        wrap.appendChild(btn);
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          load(video);
          video.play().catch(function () {});
        });
        video.addEventListener("play", function () { wrap.classList.add("is-playing"); });
        video.addEventListener("pause", function () { wrap.classList.remove("is-playing"); });
      }
      videos.forEach(addPlayButton);
      if (!("IntersectionObserver" in window)) { videos.forEach(load); return; }
      var ioPoster = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            load(entry.target);
            ioPoster.unobserve(entry.target);
          }
        });
      }, { rootMargin: "600px 0px" });
      videos.forEach(function (v) { ioPoster.observe(v); });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach(function (v) { load(v); v.play().catch(function () {}); });
      return;
    }
    var ioLoad = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          load(entry.target);
          ioLoad.unobserve(entry.target);
        }
      });
    }, { rootMargin: "600px 0px" });
    var ioPlay = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // ioLoad (600px-early) usually fires first, but on short mobile
          // viewports both observers can cross their thresholds in the same
          // tick with no guaranteed order — load() here is a no-op if the
          // src is already set, so this just closes that race safely.
          load(entry.target);
          entry.target.play().catch(function () {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.01 });
    videos.forEach(function (v) { ioLoad.observe(v); ioPlay.observe(v); });
  }

  /* ---------------------------------------------------------
     Subtle card tilt
     --------------------------------------------------------- */
  function initTilt() {
    if (!fineHover) return;
    $$("[data-tilt]").forEach(function (card) {
      var raf = null;
      card.addEventListener("mouseover", function (e) {
        if (card.contains(e.relatedTarget)) return;
        card.dataset.tilting = "1";
      });
      card.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(700px) rotateX(" + (py * -5) + "deg) rotateY(" + (px * 5) + "deg) translateY(-4px)";
          raf = null;
        });
      });
      card.addEventListener("mouseout", function (e) {
        if (card.contains(e.relatedTarget)) return;
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------
     Work grid filter
     --------------------------------------------------------- */
  function initFilter() {
    var bar = $("[data-filter-bar]");
    if (!bar) return;
    var buttons = $$(".filter-btn", bar);
    var cards = $$("[data-card]");

    function apply(cat) {
      cards.forEach(function (card) {
        var match = cat === "all" || card.getAttribute("data-card") === cat;
        card.classList.toggle("is-hidden", !match);
      });
      buttons.forEach(function (b) {
        var active = b.getAttribute("data-filter") === cat;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        apply(cat);
        if (history.replaceState) {
          history.replaceState(null, "", cat === "all" ? location.pathname : "#" + cat);
        }
      });
    });

    var initial = (location.hash || "").replace("#", "");
    var validCats = (data.categories || []).map(function (c) { return c.id; });
    apply(validCats.indexOf(initial) > -1 ? initial : "all");

    /* Arriving from another page with #work or a category hash (the old
       work.html links now point here) — land on the work section, not the top. */
    if (initial === "work" || validCats.indexOf(initial) > -1) {
      var workSection = document.getElementById("work");
      if (workSection) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            window.scrollTo({
              top: workSection.getBoundingClientRect().top + window.scrollY - 88,
              behavior: "auto"
            });
          });
        });
      }
    }
  }

  /* ---------------------------------------------------------
     Clay <-> Final compare slider
     --------------------------------------------------------- */
  function initCompare() {
    $$(".compare").forEach(function (wrap) {
      if (wrap.dataset.compareBound) return;
      wrap.dataset.compareBound = "1";
      var after = $(".compare-after", wrap);
      var handle = $(".compare-handle", wrap);
      if (!after || !handle) return;
      var dragging = false;

      function setPos(clientX) {
        var r = wrap.getBoundingClientRect();
        var pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
        after.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
        handle.setAttribute("aria-valuenow", Math.round(pct));
      }

      handle.setAttribute("role", "slider");
      handle.setAttribute("tabindex", "0");
      handle.setAttribute("aria-label", "Compare clay and final render");
      handle.setAttribute("aria-valuemin", "0");
      handle.setAttribute("aria-valuemax", "100");
      handle.setAttribute("aria-valuenow", "50");

      wrap.addEventListener("pointerdown", function (e) {
        dragging = true;
        setPos(e.clientX);
        wrap.setPointerCapture(e.pointerId);
      });
      wrap.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        setPos(e.clientX);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
        wrap.addEventListener(ev, function () { dragging = false; });
      });
      handle.addEventListener("keydown", function (e) {
        var r = wrap.getBoundingClientRect();
        var current = parseFloat(handle.style.left) || 50;
        if (e.key === "ArrowLeft") setPos(r.left + (r.width * Math.max(0, current - 5) / 100));
        if (e.key === "ArrowRight") setPos(r.left + (r.width * Math.min(100, current + 5) / 100));
      });
    });
  }

  /* ---------------------------------------------------------
     Lightbox — click any content image to enlarge it.
     Excludes thumbnails that already link elsewhere (cards),
     the compare slider (drag conflict) and hero visuals.
     --------------------------------------------------------- */
  var LIGHTBOX_EXCLUDE = ".card, .related-card, .compare, .project-hero-full, .hero-home-full, .logo-strip, .ph--controls";

  function initLightbox() {
    var candidates = $$(".ph").filter(function (ph) {
      return !ph.closest(LIGHTBOX_EXCLUDE);
    });
    if (!candidates.length) return;

    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Enlarged image");
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="lightbox-inner"></div>';
    document.body.appendChild(overlay);

    var inner = $(".lightbox-inner", overlay);
    var closeBtn = $(".lightbox-close", overlay);
    var lastFocused = null;
    var currentIndex = -1;

    function open(source) {
      currentIndex = candidates.indexOf(source);
      inner.innerHTML = "";
      var clone = source.cloneNode(true);
      clone.classList.remove("reveal", "is-visible", "ph--zoomable");
      clone.removeAttribute("style");
      clone.removeAttribute("tabindex");
      clone.removeAttribute("role");
      inner.appendChild(clone);
      var clonedVideo = clone.tagName === "VIDEO" ? clone : clone.querySelector("video");
      if (clonedVideo) {
        if (clonedVideo.dataset.src) {
          clonedVideo.src = clonedVideo.dataset.src;
          clonedVideo.removeAttribute("data-src");
        }
        clonedVideo.play().catch(function () {});
      }
      if (!overlay.classList.contains("is-open")) lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function step(delta) {
      if (currentIndex === -1 || candidates.length < 2) return;
      var next = (currentIndex + delta + candidates.length) % candidates.length;
      open(candidates[next]);
    }

    candidates.forEach(function (ph) {
      ph.classList.add("ph--zoomable");
      ph.setAttribute("tabindex", "0");
      ph.setAttribute("role", "button");
      var label = ph.querySelector(".ph-label");
      ph.setAttribute("aria-label", "Enlarge image" + (label ? ": " + label.textContent : ""));
      ph.addEventListener("click", function () { open(ph); });
      ph.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(ph); }
      });
    });

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
  }

  /* ---------------------------------------------------------
     Smooth anchor scroll (native, nav-offset aware)
     --------------------------------------------------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 88;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------------------------------------------------------
     Page transitions — fade the current page out before handing
     off to a same-origin navigation, so the CSS page-enter
     animation on the next document always has a matching exit.
     --------------------------------------------------------- */
  function initPageTransitions() {
    if (reduced) return;
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin || url.href === window.location.href) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () { window.location.href = url.href; }, 300);
    });
  }

  /* ---------------------------------------------------------
     Contact form (front-end only — no backend wired yet)
     --------------------------------------------------------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var status = $(".form-status", form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = $("#name", form).value;
      var email = $("#email", form).value;
      var message = $("#message", form).value;
      var subject = encodeURIComponent("Portfolio contact — " + name);
      var body = encodeURIComponent(message + "\n\n" + email);
      window.location.href = "mailto:" + (data.contact && data.contact.email ? data.contact.email : "") + "?subject=" + subject + "&body=" + body;
      if (status) {
        status.textContent = "Opening your email client…";
        status.classList.add("is-visible");
      }
    });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  function mountYear() {
    var el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMouseGradient, "initMouseGradient");
    safe(initAutoReveal, "initAutoReveal");
    safe(initReveals, "initReveals");
    safe(initLazyVideos, "initLazyVideos");
    safe(initLogoDrift, "initLogoDrift");
    safe(initTilt, "initTilt");
    safe(initFilter, "initFilter");
    safe(initCompare, "initCompare");
    safe(initLightbox, "initLightbox");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initPageTransitions, "initPageTransitions");
    safe(initContactForm, "initContactForm");
    safe(mountYear, "mountYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
