export function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function formatContext(tokens) {
  if (!Number.isFinite(tokens) || tokens <= 0) return "See model details";
  if (tokens >= 1000000) {
    const millions = tokens / 1000000;
    return `${millions < 1.1 ? 1 : Number.parseFloat(millions.toFixed(1))}M tokens`;
  }
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}K tokens` : `${tokens} tokens`;
}

function familyFor(model) {
  if (model.family) return model.family;
  const families = [[/^gpt-/, "GPT"], [/^claude-/, "Claude"], [/^gemini-/, "Gemini"],
    [/^api-glm-/, "GLM"], [/^api-gemma-/, "Gemma"], [/^(kimi-|moonshotai\.kimi-)/, "Kimi"]];
  return families.find(([pattern]) => pattern.test(model.id))?.[1] || model.displayName;
}

export function groupModels(models) {
  const groups = new Map();
  for (const model of models) {
    const family = familyFor(model);
    const key = JSON.stringify([model.hosting, model.type, family]);
    if (!groups.has(key)) groups.set(key, { family, hosting: model.hosting, type: model.type, models: [] });
    groups.get(key).models.push(model);
  }
  return [...groups.values()];
}

function groupLabel(group) {
  if (group.models.length === 1) return group.models[0].displayName;
  const versions = group.models.map((model) => model.displayName.match(/\b\d+(?:\.\d+)?\b/)?.[0]);
  if (versions[0] && versions.every((version) => version === versions[0])) return `${group.family} ${versions[0]}`;
  const major = versions[0]?.split(".")[0];
  if (major && versions.every((version) => version?.split(".")[0] === major)) return `${group.family} ${major} series`;
  return group.family;
}

function groupContext(group) {
  const limits = group.models.map((model) => model.maxInputTokens);
  if (limits.every((limit) => !Number.isFinite(limit) || limit <= 0)) return "See details";
  if (limits.some((limit) => !Number.isFinite(limit) || limit <= 0)) return "Varies by route";
  const low = Math.min(...limits), high = Math.max(...limits);
  const short = (limit) => formatContext(limit).replace(" tokens", "");
  return low === high ? short(low) : `${short(low)}–${short(high)}`;
}

function logoFor(group, endpoint) {
  const logo = group.models.find((model) => model.logo?.src)?.logo;
  if (!logo || !/^\/images\/model-logos\/[\w.-]+$/.test(logo.src)) return "";
  const src = new URL(logo.src, endpoint).href;
  return `<img class="model-catalog-logo" src="${escapeHtml(src)}" alt="${escapeHtml(logo.alt || "")}" width="32" height="32" loading="lazy" decoding="async">`;
}

function renderGroup(group, endpoint) {
  const label = groupLabel(group);
  const version = label.replace(`${group.family} `, "");
  const variants = group.models.length > 1 ? group.models.map((model) => {
    let value = model.displayName.replace(`${group.family} `, "");
    if (!version.includes("series")) value = value.replace(version, "").trim();
    return value || "Standard";
  }).join(" · ") : "";
  const task = group.type === "Chat and reasoning" ? "" : group.type;
  const subtitle = [variants, task].filter(Boolean).join(" · ");
  const ids = group.models.map((model) => `<li data-model-id="${escapeHtml(model.id)}"><code class="model-catalog-request-id">${escapeHtml(model.id)}</code><span>${escapeHtml(formatContext(model.maxInputTokens))}</span></li>`).join("");
  return `<tr><td><details class="model-catalog-family" data-model-family="${escapeHtml(JSON.stringify([group.hosting, group.type, group.family]))}"><summary>${logoFor(group, endpoint)}<span class="model-catalog-name"><strong>${escapeHtml(label)}</strong>${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ""}</span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for ${escapeHtml(label)}">${ids}</ul></details></td><td class="model-catalog-context">${escapeHtml(groupContext(group))}</td></tr>`;
}

export function renderModelCatalog(models, endpoint) {
  const groups = groupModels(models);
  return ["UC-hosted", "Approved enterprise cloud"].map((hosting) => {
    const selected = groups.filter((group) => group.hosting === hosting);
    if (!selected.length) return "";
    const label = hosting === "UC-hosted" ? "UCSD-Hosted" : hosting;
    return `<section class="model-catalog-hosting" aria-label="${label}"><h3>${label}</h3><table class="table model-catalog-table"><caption class="sr-only">${label} model families. Expand a family for request IDs and individual route limits.</caption><thead><tr><th scope="col">Model family</th><th scope="col">Context (tokens)</th></tr></thead><tbody>${selected.map((group) => renderGroup(group, endpoint)).join("")}</tbody></table></section>`;
  }).join("");
}
