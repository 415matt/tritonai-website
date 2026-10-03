(function () {
  "use strict";

  function nativeDecoratorDrawer(drawer) {
    var parent = drawer.parentElement;
    return parent && parent.classList.contains("drawer-wrapper") && parent.classList.contains("main-section-content");
  }

  function panelFor(header) {
    var panel = header.nextElementSibling;
    return panel && /^(?:ARTICLE|DIV)$/.test(panel.tagName) ? panel : null;
  }

  function setExpanded(header, trigger, panel, expanded) {
    header.classList.toggle("expand", expanded);
    trigger.setAttribute("aria-expanded", String(expanded));
    panel.hidden = !expanded;
  }

  function initializeDrawer(drawer, drawerIndex) {
    if (drawer.dataset.tritonaiDrawerInitialized === "true" || nativeDecoratorDrawer(drawer)) return;
    drawer.dataset.tritonaiDrawerInitialized = "true";

    Array.prototype.forEach.call(drawer.querySelectorAll(":scope > h2"), function (header, itemIndex) {
      var trigger = header.querySelector(":scope > a");
      var panel = panelFor(header);
      if (!trigger || !panel) return;

      var panelId = panel.id || "tritonai-drawer-" + drawerIndex + "-" + itemIndex;
      panel.id = panelId;
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-controls", panelId);
      setExpanded(header, trigger, panel, false);

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        setExpanded(header, trigger, panel, panel.hidden);
      });
    });
  }

  function initializeDrawers() {
    Array.prototype.forEach.call(document.querySelectorAll(".drawer"), initializeDrawer);
  }

  function setAllExpanded(drawer, expanded) {
    Array.prototype.forEach.call(drawer.querySelectorAll(":scope > h2"), function (header) {
      var trigger = header.querySelector(":scope > a");
      var panel = panelFor(header);
      if (!trigger || !panel) return;
      setExpanded(header, trigger, panel, expanded);
    });
  }

  function initializeDrawerControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-drawer-expand-all]"), function (control) {
      if (control.dataset.tritonaiDrawerControlInitialized === "true") return;
      control.dataset.tritonaiDrawerControlInitialized = "true";
      var drawerWrapper = control.nextElementSibling;
      var drawer = drawerWrapper ? drawerWrapper.querySelector(".drawer") : null;
      if (!drawer) return;
      control.addEventListener("click", function (event) {
        event.preventDefault();
        setAllExpanded(drawer, true);
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-drawer-collapse-all]"), function (control) {
      if (control.dataset.tritonaiDrawerControlInitialized === "true") return;
      control.dataset.tritonaiDrawerControlInitialized = "true";
      var drawerWrapper = control.nextElementSibling;
      var drawer = drawerWrapper ? drawerWrapper.querySelector(".drawer") : null;
      if (!drawer) return;
      control.addEventListener("click", function (event) {
        event.preventDefault();
        setAllExpanded(drawer, false);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeDrawers);
  else initializeDrawers();
  document.addEventListener("tritonai:decorator-ready", initializeDrawers);
  document.addEventListener("DOMContentLoaded", initializeDrawerControls);
  document.addEventListener("tritonai:decorator-ready", initializeDrawerControls);
})();
