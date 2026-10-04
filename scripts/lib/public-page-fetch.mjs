export async function readPublicPage(url, fetchPage = fetch) {
  let response;
  let html;
  try {
    response = await fetchPage(url, { cache: "no-store", signal: AbortSignal.timeout(30000) });
    if (response.ok) html = await response.text();
  } catch (error) {
    console.warn(`Public page connection interrupted; retrying verification: ${url} (${error.message})`);
    return null;
  }
  if (!response.ok) throw new Error(`Public route ${url} returned ${response.status}.`);
  return html;
}
