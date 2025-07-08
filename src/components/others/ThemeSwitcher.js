import { useEffect, useState } from "react";

function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");
  const [manualOverride, setManualOverride] = useState(false);

  // Fonction pour appliquer un thème donné
  const applyTheme = (newTheme, manual = false) => {
    document.body.setAttribute("data-bs-theme", newTheme);
    setTheme(newTheme);
    if (manual) {
      localStorage.setItem("themeOverride", newTheme);
      setManualOverride(true);
    }
  };

  // Déterminer si l'heure actuelle est dans la plage nuit (18h30 - 6h30)
  const isNightTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return hour >= 18 || hour < 6 || (hour === 6 && minute <= 30);
  };

  // Au montage du composant
  useEffect(() => {
    const savedTheme = localStorage.getItem("themeOverride");

    if (savedTheme) {
      // Si l'utilisateur a déjà forcé un thème
      applyTheme(savedTheme);
      setManualOverride(true);
    } else {
      // Sinon, on choisit automatiquement selon l'heure
      const autoTheme = isNightTime() ? "dark" : "light";
      applyTheme(autoTheme);
    }
  }, []);

  // Basculer manuellement le thème
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    applyTheme(newTheme, true);
  };

  // Réinitialiser et remettre l’auto
  const resetTheme = () => {
    localStorage.removeItem("themeOverride");
    setManualOverride(false);
    const autoTheme = isNightTime() ? "dark" : "light";
    applyTheme(autoTheme);
  };

  return (
    <div className="nav-item dropdown">
      <button className="nav-link dropdown-toggle">
        <i className="fa fa-adjust me-lg-2"></i>
        <span className="d-none d-lg-inline-flex items text-body">Thème</span>
      </button>
      <div className="dropdown-menu dropdown-menu-end bg-body border-0 rounded-bottom m-0 p-2">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="themeSwitch"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <label className="form-check-label" htmlFor="themeSwitch">
            Mode nuit
          </label>
        </div>
        {manualOverride && (
          <>
            <small
              className="text-muted d-block mb-2"
              style={{ fontSize: "0.75rem" }}
            >
              Thème défini manuellement
            </small>
            <button
              className="btn btn-sm btn-outline-secondary mx-auto"
              onClick={resetTheme}
            >
              Réinitialiser
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
