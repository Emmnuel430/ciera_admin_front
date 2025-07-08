// src/components/ScrollToTop.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" }); // ou "auto" si tu ne veux pas d'effet
  }, [pathname]);

  return null;
};

export default ScrollToTop;
