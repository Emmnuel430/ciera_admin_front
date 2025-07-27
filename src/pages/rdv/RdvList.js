import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout"; // Composant Layout qui contient la structure générale de la Rdv
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter"; // Composant pour l'en-tête avec filtre
import Loader from "../../components/Layout/Loader"; // Composant pour le loader
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Composant de modal de confirmation pour la suppression d'Rdv
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token
import RdvContainer from "./RdvContainer";

const RdvList = () => {
  // États locaux pour gérer les rdvs, l'état de chargement, les erreurs et les modals
  const [rdvs, setRdvs] = useState([]); // Liste des rdvs
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState(""); // État pour les erreurs
  const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher le modal de confirmation
  const [selectedRdvs, setSelectedRdvs] = useState(null); // Rdv sélectionné pour suppression
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les rdvs
  const [, setTimeState] = useState(Date.now());

  // Récupérer la liste des rdvs lors du premier rendu
  useEffect(() => {
    const fetchRdvs = async () => {
      setLoading(true); // On commence par définir l'état de chargement à true
      setError(""); // Réinitialiser l'erreur

      try {
        // Requête pour récupérer la liste des rdvs
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/rdvs`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des rdvs.");
        }
        const data = await response.json(); // Convertir la réponse en JSON
        setRdvs(data); // Mettre à jour l'état rdvs avec les données récupérées
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Si erreur, la définir dans l'état
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchRdvs(); // Appel de la fonction pour récupérer les rdvs
    const interval = setInterval(() => {
      setTimeState(Date.now()); // Met à jour l'état pour forcer un re-rendu
    }, 59000);

    return () => clearInterval(interval);
  }, []);

  // Ouvrir le modal de confirmation de suppression avec l'Rdv sélectionné
  const handleOpenModal = (Rdv) => {
    setSelectedRdvs(Rdv); // On définit l'Rdv sélectionné
    setShowModal(true); // On affiche le modal
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false); // Cacher le modal
    setSelectedRdvs(null); // Réinitialiser l'Rdv sélectionné
  };

  // Fonction pour supprimer l'Rdv sélectionné
  const handleDelete = async () => {
    if (!selectedRdvs) return; // Si aucun Rdv sélectionné, on ne fait rien

    try {
      // Requête DELETE pour supprimer l'Rdv
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/rdvs/${selectedRdvs.id}`,
        {
          method: "DELETE", // Méthode de suppression
        }
      );

      const result = await response.json(); // Convertir la réponse en JSON

      // Si l'Rdv a été supprimé
      if (result.status === "deleted") {
        alert("Rdv supprimé !"); // Afficher un message de succès
        setRdvs(rdvs.filter((Rdv) => Rdv.id !== selectedRdvs.id)); // Mettre à jour la liste des rdvs
      } else {
        alert("Échec de la suppression."); // Si l'échec
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression."); // En cas d'erreur
    } finally {
      handleCloseModal(); // Fermer le modal après la suppression
    }
  };

  //   const formatDateRelative = (date) => {
  //     const formatted = formatDistanceToNow(new Date(date), {
  //       addSuffix: false, // Pas de suffixe (ex. "il y a")
  //       locale: fr, // Locale française
  //     });

  //     if (/moins d.?une minute/i.test(formatted)) {
  //       return "À l'instant"; // Cas particulier pour "moins d'une minute"
  //     }

  //     // Remplacements pour abréger les unités de temps
  //     const abbreviations = [
  //       { regex: /environ /i, replacement: "≈" },
  //       { regex: / heures?/i, replacement: "h" },
  //       { regex: / minutes?/i, replacement: "min" },
  //       { regex: / secondes?/i, replacement: "s" },
  //       { regex: / jours?/i, replacement: "j" },
  //       { regex: / semaines?/i, replacement: "sem" },
  //       { regex: / mois?/i, replacement: "mois" },
  //       { regex: / ans?/i, replacement: "an" },
  //     ];

  //     let shortened = formatted;
  //     abbreviations.forEach(({ regex, replacement }) => {
  //       shortened = shortened.replace(regex, replacement); // Applique les remplacements
  //     });

  //     return shortened; // Retourne la version abrégée
  //   };

  const filteredPage = rdvs.filter((Rdv) =>
    Rdv.immat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs s'il y en a */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Affichage du loader si on est en train de charger les données */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            {/* Barre de recherche */}
            <SearchBar
              placeholder="Rechercher une Rdv..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* Affichage de l'en-tête avec filtre et le bouton pour ajouter un Rdv */}
            <HeaderWithFilter
              title="Rdvs"
              main={rdvs.length || null}
              //   sortOption={sortOption}
              //   setSortOption={setSortOption}
              //   dataList={rdvs}
              //   setSortedList={setSortedRdvs}
              //   // alphaField="title"
              //   dateField="created_at"
            />
            {/* Affichage de la liste des rdvs dans un tableau */}
            <div className="row">
              {filteredPage.length === 0 ? (
                <div className="text-center mt-4">
                  <p>Aucune Rdv trouvée.</p>
                </div>
              ) : (
                <>
                  <RdvContainer
                    filteredPage={filteredPage}
                    handleOpenModal={handleOpenModal}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmation pour la suppression d'un Rdv */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        btnColor="danger"
        body={
          <p>
            Voulez-vous vraiment supprimer le Rdv avec{" "}
            <strong>
              {selectedRdvs
                ? `${selectedRdvs.client_nom} ${selectedRdvs.client_prenom}`
                : "Inconnu"}
            </strong>{" "}
            ?
          </p>
        }
      />
    </Layout>
  );
};

export default RdvList;
