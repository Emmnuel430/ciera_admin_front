"use client";
import { useEffect } from "react";

const useNavbarInteractions = () => {
  useEffect(() => {
    // Vérifier si `window` est défini pour s'assurer que le code s'exécute côté client
    if (typeof window === "undefined") return;

    /*~~~~~~~~~~~~~~~ TOGGLE BUTTON ~~~~~~~~~~~~~~~*/
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const hamburger = document.getElementById("hamburger");

    const toggleMenu = () => {
      navMenu?.classList.toggle("left-[0]");
      hamburger?.classList.toggle("ri-close-large-line");
    };

    hamburger?.addEventListener("click", toggleMenu);
    navLinks.forEach((link) => link.addEventListener("click", toggleMenu));

    /*~~~~~~~~~~~~~~~ CHANGE BACKGROUND HEADER ~~~~~~~~~~~~~~~*/
    const scrollHeader = () => {
      const header = document.getElementById("navbar");
      if (!header) return;
      const isNotHome = window.location.pathname !== "/";

      if (window.scrollY >= 50 || isNotHome) {
        header.classList.add("bg-blue-950");
      } else {
        header.classList.remove("bg-blue-950");
      }
    };
    window.addEventListener("scroll", scrollHeader);
    scrollHeader();

    /*~~~~~~~~~~~~~~~ SHOW SCROLL UP ~~~~~~~~~~~~~~~*/
    const scrollUpBtn = document.getElementById("scroll-up");
    const scrollUp = () => {
      if (!scrollUpBtn) return;

      if (window.scrollY >= 250) {
        scrollUpBtn.classList.remove("invisible", "opacity-0", "translate-y-4");
        scrollUpBtn.classList.add("visible", "opacity-100", "translate-y-0");
      } else {
        scrollUpBtn.classList.add("invisible", "opacity-0", "translate-y-4");
        scrollUpBtn.classList.remove("visible", "opacity-100", "translate-y-0");
      }
    };

    // Ajouter l'event listener pour l'affichage dynamique
    window.addEventListener("scroll", scrollUp);
    // Retourner en haut de la page en douceur
    const handleBackToTopClick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Ajouter les écouteurs pour la gestion du défilement et du clic
    scrollUpBtn?.addEventListener("click", handleBackToTopClick);

    /*~~~~~~~~~~~~~~~ CLEANUP ~~~~~~~~~~~~~~~*/
    return () => {
      hamburger?.removeEventListener("click", toggleMenu);
      navLinks.forEach((link) => link.removeEventListener("click", toggleMenu));
      window.removeEventListener("scroll", scrollHeader);
      window.removeEventListener("scroll", scrollUp);
    };
  }, []);

  return null;
};

export default useNavbarInteractions;
