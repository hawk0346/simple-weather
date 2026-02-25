const FETCH_TIMEOUT_MS = 5000;

export async function fetchWithGuard(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
