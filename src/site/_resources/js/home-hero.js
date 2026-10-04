(function () {
  "use strict";

  function initializeHomeHero() {
    var carousel = document.getElementById("heroslider");
    var toggle = document.querySelector("[data-home-hero-toggle]");
    if (!carousel || !toggle) return;

    var isPaused = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var icon = toggle.querySelector(".glyphicon");
    var label = toggle.querySelector(".sr-only");
    var fallbackTimer = null;
    var hasNativeCarousel = Boolean(window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.carousel === "function");

    function hydrateSlideImage(slide) {
      if (!slide) return;
      Array.prototype.forEach.call(slide.querySelectorAll("source[data-srcset]"), function (source) {
        var media = source.getAttribute("media");
        if (!media || !window.matchMedia || window.matchMedia(media).matches) {
          source.srcset = source.getAttribute("data-srcset");
          source.removeAttribute("data-srcset");
        }
      });
      Array.prototype.forEach.call(slide.querySelectorAll("img[data-src]"), function (image) {
        image.src = image.getAttribute("data-src");
        image.removeAttribute("data-src");
      });
    }

    Array.prototype.forEach.call(carousel.querySelectorAll("img[data-fallback-src]"), function (image) {
      image.addEventListener("error", function useFallback() {
        var fallback = image.getAttribute("data-fallback-src");
        if (!fallback) return;
        image.src = fallback;
        image.removeAttribute("data-fallback-src");
      });
    });

    function updateToggle() {
      toggle.setAttribute("aria-pressed", String(isPaused));
      toggle.setAttribute("aria-label", isPaused ? "Carousel is paused; click to play" : "Carousel is playing; click to pause");
      if (icon) {
        icon.classList.toggle("glyphicon-pause", !isPaused);
        icon.classList.toggle("glyphicon-play", isPaused);
      }
      if (label) label.textContent = isPaused ? "Play carousel" : "Pause carousel";
    }

    function updateSlides() {
      Array.prototype.forEach.call(carousel.querySelectorAll(".item"), function (slide) {
        var isActive = slide.classList.contains("active");
        if (isActive) hydrateSlideImage(slide);
        slide.setAttribute("aria-hidden", String(!isActive));
        Array.prototype.forEach.call(slide.querySelectorAll("a, button, input, select, textarea, [tabindex]"), function (control) {
          control.setAttribute("tabindex", isActive ? "0" : "-1");
        });
      });
    }

    function showFallbackSlide(offset) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".item"));
      var indicators = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-indicators li"));
      var activeIndex = slides.findIndex(function (slide) {
        return slide.classList.contains("active");
      });
      var nextIndex = (activeIndex + offset + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("active", index === nextIndex);
      });
      indicators.forEach(function (indicator, index) {
        indicator.classList.toggle("active", index === nextIndex);
      });
      updateSlides();
    }

    function startFallbackCycle() {
      if (isPaused || fallbackTimer) return;
      var interval = Number(carousel.getAttribute("data-interval")) || 7000;
      fallbackTimer = window.setInterval(function () {
        showFallbackSlide(1);
      }, interval);
    }

    function stopFallbackCycle() {
      if (!fallbackTimer) return;
      window.clearInterval(fallbackTimer);
      fallbackTimer = null;
    }

    var previous = carousel.querySelector("[data-home-hero-direction='prev']");
    var next = carousel.querySelector("[data-home-hero-direction='next']");

    function setPaused(paused) {
      isPaused = paused;
      carousel.classList.toggle("paused", paused);
      if (hasNativeCarousel) window.jQuery(carousel).carousel(paused ? "pause" : "cycle");
      else if (paused) stopFallbackCycle();
      else startFallbackCycle();
      updateToggle();
    }

    // Keep the focused slide in place until the visitor chooses to resume.
    carousel.addEventListener("focusin", function (event) {
      if (event.target !== toggle) setPaused(true);
    });

    // The native Decorator click handler also targets this content control.
    // Handle it in capture so a single click changes the playback state once.
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setPaused(!isPaused);
    }, true);

    if (hasNativeCarousel) {
      window.jQuery(carousel).on("slide.bs.carousel", function (event) {
        hydrateSlideImage(event.relatedTarget);
      });
      window.jQuery(carousel).on("slid.bs.carousel", updateSlides);
      updateSlides();
      setPaused(isPaused);
      return;
    }

    if (previous) previous.addEventListener("click", function (event) {
      event.preventDefault();
      stopFallbackCycle();
      showFallbackSlide(-1);
      startFallbackCycle();
    });
    if (next) next.addEventListener("click", function (event) {
      event.preventDefault();
      stopFallbackCycle();
      showFallbackSlide(1);
      startFallbackCycle();
    });
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      isPaused = true;
    }
    updateSlides();
    updateToggle();
    startFallbackCycle();
  }

  // The Decorator carousel scripts are external dependencies loaded by the page
  // shell. Wait for them before deciding whether the local fallback is needed.
  if (document.readyState === "complete") initializeHomeHero();
  else window.addEventListener("load", initializeHomeHero);
})();
