"use client";
import { useEffect } from "react";

const useScrollReveal = () => {
  useEffect(() => {
    // Vérifier si nous sommes côté client avant d'exécuter le code
    if (typeof window === "undefined") return;

    import("scrollreveal").then((ScrollReveal) => {
      const sr = ScrollReveal.default({
        origin: "top",
        distance: "60px",
        duration: 1500,
        delay: 300,
        reset: false, // Mettre à false si on ne veut pas rejouer l’animation
      });

      sr.reveal(
        ".home__data, .gallery__text, .about__top, .popular__top, .partner__top, .review__top, .review__swiper, .footer__icon, .footer__content, .copy__right, .service__top"
      );
      sr.reveal(".home__image", { delay: 500, scale: 0.5 });
      sr.reveal(".service__card, .popular__card", { interval: 100 });
      sr.reveal(".about__leaf, .review__leaf", {
        delay: 1000,
        origin: "right",
      });
      sr.reveal(".footer__floral", {
        delay: 1000,
        origin: "left",
      });
      sr.reveal(".about__item__1-content, .about__item__2-img", {
        origin: "right",
      });
      sr.reveal(".about__item__2-content, .about__item__1-img", {
        origin: "left",
      });
    });
  }, []); // Exécution une seule fois après le montage du composant
};

export default useScrollReveal;
