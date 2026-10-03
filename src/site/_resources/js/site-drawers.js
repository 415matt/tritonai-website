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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeDrawers);
  else initializeDrawers();
  document.addEventListener("tritonai:decorator-ready", initializeDrawers);
})();
