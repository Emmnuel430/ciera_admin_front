import { useEffect, useState } from "react";

const useSelectTheme = () => {
  const getBootstrapTheme = () => {
    return document.body.getAttribute("data-bs-theme") === "dark";
  };

  const [isDarkMode, setIsDarkMode] = useState(getBootstrapTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(getBootstrapTheme());
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const customTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      neutral0: isDarkMode ? "#212529" : "#ffffff", // fond du select
      neutral80: isDarkMode ? "#f8f9fa" : "#212529", // texte
      primary25: isDarkMode ? "#343a40" : "#e9ecef", // survol
      primary: "#0d6efd", // couleur Bootstrap
    },
  });

  return { isDarkMode, customTheme };
};

export default useSelectTheme;
