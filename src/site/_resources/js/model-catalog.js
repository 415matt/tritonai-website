import { renderModelCatalog } from "./model-catalog-view.js";

(function () {
  "use strict";

  function initialize() {
    var section = document.querySelector("main#main-content [data-model-catalog-endpoint]");
    if (!section) return;
    var endpoint = section.dataset.modelCatalogEndpoint;
    var list = section.querySelector("[data-model-catalog-list]");
    var status = section.querySelector("[data-model-catalog-status]");
    if (!list || !status) return;
    var key = "tritonai-model-catalog-v2:" + endpoint;
    var saved = null;
    var expiresAt = 0;
    var retryAt = 0;
    var loading = false;
    var renderedModels = "";

    function valid(payload) {
      return payload && Number.isFinite(Date.parse(payload.fetchedAt))
        && typeof payload.stale === "boolean"
        && Array.isArray(payload.models) && payload.models.length > 0
        && payload.models.every(function (model) {
          return model && typeof model.id === "string" && model.id
            && typeof model.displayName === "string" && typeof model.type === "string"
            && ["UC-hosted", "Approved enterprise cloud"].includes(model.hosting)
            && (model.maxInputTokens === null || Number.isFinite(model.maxInputTokens));
        });
    }

    function render(payload) {
      var signature = JSON.stringify(payload.models);
      if (signature !== renderedModels) {
        var openFamilies = Array.from(list.querySelectorAll("details[open]"), function (detail) { return detail.dataset.modelFamily; });
        var focusedFamily = document.activeElement?.closest("details")?.dataset.modelFamily;
        list.innerHTML = renderModelCatalog(payload.models, endpoint);
        list.querySelectorAll("details").forEach(function (detail) {
          if (openFamilies.includes(detail.dataset.modelFamily)) detail.open = true;
          if (focusedFamily && detail.dataset.modelFamily === focusedFamily) detail.querySelector("summary").focus();
        });
        renderedModels = signature;
      }
      var date = new Date(payload.fetchedAt).toLocaleString("en-US");
      status.textContent = "Model list updated " + date + ". "
        + (payload.stale ? "Showing the last available list while updates are unavailable." : "Checks for updates every five minutes.");
    }

    try {
      var cache = JSON.parse(localStorage.getItem(key));
      if (cache && valid(cache.payload) && Number.isFinite(cache.expiresAt)) {
        saved = cache.payload;
        expiresAt = cache.expiresAt;
        render(saved);
      }
    } catch {
      // Storage can be unavailable; HTTP caching still works.
    }

    async function refresh() {
      if (loading || document.hidden || Date.now() < Math.max(expiresAt, retryAt)) return;
      loading = true;
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 10000);
      try {
        var response = await fetch(endpoint, { credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error("Model catalog unavailable");
        var payload = await response.json();
        if (!valid(payload)) throw new Error("Invalid model catalog");
        saved = payload;
        expiresAt = payload.stale ? Date.now() + 30000
          : Math.min(Date.now() + 300000, Date.parse(payload.fetchedAt) + 300000);
        retryAt = Date.now() + 30000;
        render(payload);
        try { localStorage.setItem(key, JSON.stringify({ expiresAt: expiresAt, payload: payload })); } catch { /* Optional cache. */ }
      } catch {
        retryAt = Date.now() + 30000;
        status.textContent = saved
          ? "Showing the saved model list from " + new Date(saved.fetchedAt).toLocaleString("en-US") + ". Live updates are temporarily unavailable."
          : "Showing the saved model list. Live updates are temporarily unavailable; see model details for the full catalog.";
      } finally {
        clearTimeout(timeout);
        loading = false;
      }
    }

    refresh();
    setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
