import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useIdleLogout = (timeoutMinutes = 15) => {
  const navigate = useNavigate();
  const timeoutRef = useRef();

  const logout = useCallback(async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include", // important : envoie le cookie de session
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Erreur lors de la déconnexion automatique :", err);
    }

    // Nettoyage local
    sessionStorage.clear();

    navigate("/");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(logout, timeoutMinutes * 60 * 1000);
  }, [logout, timeoutMinutes]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // Initialise le timer

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeoutRef.current);
      // window.location.href = "/";
    };
  }, [resetTimer]);
};

export default useIdleLogout;
