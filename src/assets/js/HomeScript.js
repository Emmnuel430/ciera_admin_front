import { useEffect } from "react";

const HomeScript = () => {
  useEffect(() => {
    // 1. Gestion de la barre latérale
    const handleSidebarToggle = () => {
      const sidebar = document.querySelector(".sidebar"); // Sélection de la barre latérale
      const content = document.querySelector(".content"); // Sélection de la zone de contenu principale
      const sidebarToggleIcon = document.querySelector(".sidebar-toggle i"); // Sélection de l'icône du bouton

      // Basculer les classes pour ouvrir/fermer la barre latérale
      sidebar?.classList.toggle("open");
      content?.classList.toggle("shifted");

      // Basculer les classes pour changer l'icône
      if (sidebarToggleIcon) {
        if (sidebarToggleIcon.classList.contains("fa-bars")) {
          sidebarToggleIcon.classList.remove("fa-bars");
          sidebarToggleIcon.classList.add("fa-times");
        } else {
          sidebarToggleIcon.classList.remove("fa-times");
          sidebarToggleIcon.classList.add("fa-bars");
        }
      }
    };

    // Bouton pour ouvrir/fermer la barre latérale
    const sidebarToggleBtn = document.querySelector(".sidebar-toggle");
    sidebarToggleBtn?.addEventListener("click", handleSidebarToggle);

    // ----------------------------------------------
    // 2. Gestion du bouton "Retour en haut"
    const backToTopBtn = document.querySelector(".back-to-top");

    // Affiche ou masque le bouton en fonction du défilement
    const handleScroll = () => {
      if (window.scrollY > 100) {
        // Si on défile vers le bas
        backToTopBtn?.classList.add("show");
        backToTopBtn?.classList.remove("hide");
      } else {
        // Si on est en haut de la page
        backToTopBtn?.classList.add("hide");
        backToTopBtn?.classList.remove("show");
      }
    };

    // Retourner en haut de la page en douceur
    const handleBackToTopClick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Ajouter les écouteurs pour la gestion du défilement et du clic
    window.addEventListener("scroll", handleScroll);
    backToTopBtn?.addEventListener("click", handleBackToTopClick);

    // ----------------------------------------------
    // 3. Gestion des menus déroulants (dropdowns)
    // Affiche ou masque le menu déroulant actuel
    const handleDropdownToggle = (event) => {
      const dropdown = event.currentTarget.closest(".dropdown"); // Trouve le menu parent correspondant
      const isOpen = dropdown.classList.contains("show"); // Vérifie s'il est déjà ouvert

      // Fermer tous les autres menus ouverts
      document.querySelectorAll(".dropdown.show").forEach((openDropdown) => {
        openDropdown.classList.remove("show");
      });

      // Basculer l'état du menu actuel
      if (!isOpen) {
        dropdown.classList.add("show");
      }
    };

    // Ferme tous les menus déroulants lorsqu'un clic se produit à l'extérieur
    const closeDropdownsOnClickOutside = (event) => {
      const isClickInside = event.target.closest(".dropdown"); // Vérifie si le clic est dans un menu
      if (!isClickInside) {
        // Si le clic est à l'extérieur
        document.querySelectorAll(".dropdown.show").forEach((dropdown) => {
          dropdown.classList.remove("show");
        });
      }
    };

    // Ajouter les événements aux boutons de toggles des menus déroulants
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", handleDropdownToggle); // Ajoute un clic pour basculer l'état du menu
    });

    // Fermer les menus en cliquant à l'extérieur
    document.addEventListener("click", closeDropdownsOnClickOutside);

    // 4. Nettoyage des événements lors du démontage du composant
    return () => {
      sidebarToggleBtn?.removeEventListener("click", handleSidebarToggle); // Supprime l'écouteur du bouton latéral
      window.removeEventListener("scroll", handleScroll); // Supprime l'écouteur de défilement
      backToTopBtn?.removeEventListener("click", handleBackToTopClick); // Supprime l'écouteur du bouton retour

      // Supprime les écouteurs des menus déroulants
      dropdownToggles.forEach((toggle) => {
        toggle.removeEventListener("click", handleDropdownToggle);
      });

      // Supprime l'écouteur de clic global
      document.removeEventListener("click", closeDropdownsOnClickOutside);
    };
  }, []); // Dépendance vide signifie que cet effet s'exécute uniquement une fois, lors du montage

  return null; // Ce composant n'affiche rien, il ne sert qu'à gérer les scripts côté client
};

export default HomeScript;
