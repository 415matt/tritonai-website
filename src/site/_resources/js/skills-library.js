(function () {
  "use strict";

  function initializeSkillsLibrary() {
    var root = document.querySelector("[data-skills-catalog]");
    if (!root) return;

    var search = root.querySelector("[data-skills-search]");
    var collection = root.querySelector("[data-skills-collection]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-skill-card]"));
    var status = root.querySelector("[data-skills-status]");

    function update() {
      var query = search.value.trim().toLowerCase();
      var selectedCollection = collection ? collection.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || card.getAttribute("data-skill-search").indexOf(query) !== -1;
        var matchesCollection = !selectedCollection || card.getAttribute("data-skill-collection") === selectedCollection;
        card.hidden = !(matchesQuery && matchesCollection);
        if (!card.hidden) visible += 1;
      });

      status.textContent = visible + (visible === 1 ? " skill shown" : " skills shown");
    }

    search.addEventListener("input", update);
    if (collection) collection.addEventListener("change", update);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeSkillsLibrary);
  else initializeSkillsLibrary();
})();
