export async function fetchWithCredentials(url, options = {}) {
  const opts = {
    ...options,
    credentials: "include", // pour envoyer les cookies
    headers: {
      Accept: "application/json",
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  const response = await fetch(url, opts);

  if (response.status === 401) {
    sessionStorage.removeItem("user-info");
    window.location.href = "/";
    throw new Error("Non autorisé");
  }

  return response;
}
