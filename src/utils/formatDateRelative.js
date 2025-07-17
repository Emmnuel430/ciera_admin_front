import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDateRelative = (date) => {
  const formatted = formatDistanceToNow(new Date(date), {
    addSuffix: false, // Pas de suffixe (ex. "il y a")
    locale: fr, // Locale française
  });

  if (/moins d.?une minute/i.test(formatted)) {
    return "À l'instant"; // Cas particulier pour "moins d'une minute"
  }

  // Remplacements pour abréger les unités de temps
  const abbreviations = [
    { regex: /environ /i, replacement: "≈" },
    { regex: / heures?/i, replacement: "h" },
    { regex: / minutes?/i, replacement: "min" },
    { regex: / secondes?/i, replacement: "s" },
    { regex: / jours?/i, replacement: "j" },
    { regex: / semaines?/i, replacement: "sem" },
    { regex: / mois?/i, replacement: "mois" },
    { regex: / ans?/i, replacement: "an" },
  ];

  let shortened = formatted;
  abbreviations.forEach(({ regex, replacement }) => {
    shortened = shortened.replace(regex, replacement); // Applique les remplacements
  });

  return shortened; // Retourne la version abrégée
};
