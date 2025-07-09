export async function fetchWithToken(url, options = {}) {
  const token = sessionStorage.getItem("token");

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
  };

  const finalOptions = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, finalOptions);

  // Si le token est invalide ou expiré
  if (response.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user-info");
    window.location.href = "/";
    throw new Error("Non autorisé");
  }

  // Cas d'erreur 422 : Erreur de validation Laravel
  if (response.status === 422) {
    const errorData = await response.json();
    console.error("Erreur de validation :", errorData);
    throw new Error("Erreur de validation");
  }

  return response;
}
