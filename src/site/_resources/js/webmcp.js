(function () {
  "use strict";

  var MAX_PAGE_TEXT_LENGTH = 20000;
  var MAX_LINKS = 100;

  function normalizedText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function pageMain() {
    return document.querySelector("main#main-content, main, [role='main']") || document.body;
  }

  function pageText() {
    var source = pageMain();
    if (!source) return { text: "", truncated: false };
    var clone = source.cloneNode(true);
    Array.prototype.forEach.call(
      clone.querySelectorAll("script, style, noscript, template, [hidden], [aria-hidden='true']"),
      function (element) {
        element.remove();
      },
    );
    var text = normalizedText(clone.textContent);
    return {
      text: text.slice(0, MAX_PAGE_TEXT_LENGTH),
      truncated: text.length > MAX_PAGE_TEXT_LENGTH,
    };
  }

  function pageDescription() {
    var element = document.querySelector("meta[name='description' i]");
    return normalizedText(element && element.getAttribute("content"));
  }

  function pageUrl() {
    var canonical = document.querySelector("link[rel='canonical']");
    return (canonical && canonical.href) || window.location.href;
  }

  function pageHeadings() {
    var source = pageMain();
    if (!source) return [];
    return Array.prototype.map.call(source.querySelectorAll("h1, h2, h3"), function (heading) {
      return {
        level: Number(heading.tagName.slice(1)),
        text: normalizedText(heading.textContent),
      };
    }).filter(function (heading) {
      return heading.text;
    });
  }

  function currentPage() {
    var content = pageText();
    return {
      title: normalizedText(document.title),
      description: pageDescription(),
      url: pageUrl(),
      headings: pageHeadings(),
      text: content.text,
      truncated: content.truncated,
    };
  }

  function pageLinks(args) {
    var options = args || {};
    var scope = options.scope === "all" ? "all" : "internal";
    var requestedLimit = Number(options.limit);
    var limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), MAX_LINKS) : 50;
    var source = pageMain() || document;
    var links = [];
    var seen = new Set();

    Array.prototype.forEach.call(source.querySelectorAll("a[href]"), function (anchor) {
      if (links.length >= limit) return;
      var url;
      try {
        url = new URL(anchor.getAttribute("href"), window.location.href);
      } catch (error) {
        return;
      }
      if (!/^https?:$/.test(url.protocol)) return;
      var external = url.origin !== window.location.origin;
      if (scope === "internal" && external) return;
      var label = normalizedText(anchor.textContent || anchor.getAttribute("aria-label"));
      if (!label || seen.has(url.href)) return;
      seen.add(url.href);
      links.push({ label: label, url: url.href, external: external });
    });

    return {
      page: pageUrl(),
      scope: scope,
      links: links,
      truncated: links.length === limit,
    };
  }

  function register(tool) {
    Promise.resolve(document.modelContext.registerTool(tool)).catch(function (error) {
      if (window.console && typeof window.console.debug === "function") {
        window.console.debug("TritonAI WebMCP tool registration was unavailable.", error);
      }
    });
  }

  if (!document.modelContext || typeof document.modelContext.registerTool !== "function") return;

  register({
    name: "get-tritonai-page",
    title: "Get TritonAI page",
    description: "Return the public title, description, headings, and readable text from the current TritonAI webpage.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: function () {
      return currentPage();
    },
  });

  register({
    name: "list-tritonai-page-links",
    title: "List TritonAI page links",
    description: "List labeled links from the current TritonAI webpage. Results are limited to same-origin links unless all links are requested.",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["internal", "all"],
          default: "internal",
          description: "Return only TritonAI links or all links on the page.",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: MAX_LINKS,
          default: 50,
          description: "Maximum number of links to return.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: pageLinks,
  });
})();
