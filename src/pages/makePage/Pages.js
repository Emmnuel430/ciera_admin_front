import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout"; // Composant Layout qui contient la structure générale de la page
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter"; // Composant pour l'en-tête avec filtre
import Loader from "../../components/Layout/Loader"; // Composant pour le loader
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Composant de modal de confirmation pour la suppression d'page
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token

const Pages = () => {
  // États locaux pour gérer les pages, l'état de chargement, les erreurs et les modals
  const [pages, setPages] = useState([]); // Liste des pages
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState(""); // État pour les erreurs
  const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher le modal de confirmation
  const [selectedPages, setSelectedPages] = useState(null); // Page sélectionné pour suppression
  const [sortOption, setSortOption] = useState(""); // État pour l'option de tri
  const [sortedPages, setSortedPages] = useState([]); // Liste des pages triés
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les pages

  // Récupérer la liste des pages lors du premier rendu
  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true); // On commence par définir l'état de chargement à true
      setError(""); // Réinitialiser l'erreur

      try {
        // Requête pour récupérer la liste des pages
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/pages`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des pages.");
        }
        const data = await response.json(); // Convertir la réponse en JSON
        setPages(data); // Mettre à jour l'état pages avec les données récupérées
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Si erreur, la définir dans l'état
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchPages(); // Appel de la fonction pour récupérer les pages
  }, []); // Dépendances vides, donc ce code est exécuté au premier rendu seulement

  // Ouvrir le modal de confirmation de suppression avec l'page sélectionné
  const handleOpenModal = (page) => {
    setSelectedPages(page); // On définit l'page sélectionné
    setShowModal(true); // On affiche le modal
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false); // Cacher le modal
    setSelectedPages(null); // Réinitialiser l'page sélectionné
  };

  // Fonction pour supprimer l'page sélectionné
  const handleDelete = async () => {
    if (!selectedPages) return; // Si aucun page sélectionné, on ne fait rien

    try {
      // Requête DELETE pour supprimer l'page
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/pages/${selectedPages.id}`,
        {
          method: "DELETE", // Méthode de suppression
        }
      );

      const result = await response.json(); // Convertir la réponse en JSON

      // Si l'page a été supprimé
      if (result.status === "deleted") {
        alert("Page supprimé !"); // Afficher un message de succès
        setPages(pages.filter((page) => page.id !== selectedPages.id)); // Mettre à jour la liste des pages
      } else {
        alert("Échec de la suppression."); // Si l'échec
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression."); // En cas d'erreur
    } finally {
      handleCloseModal(); // Fermer le modal après la suppression
    }
  };

  const formatDateRelative = (date) => {
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

  const filteredPage = sortedPages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
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
              placeholder="Rechercher une page..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* Affichage de l'en-tête avec filtre et le bouton pour ajouter un page */}
            <HeaderWithFilter
              title="Pages"
              link="/admin-gest/pages/add"
              linkText="Ajouter"
              main={pages.length || null}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={pages}
              setSortedList={setSortedPages}
              // alphaField="title"
              dateField="created_at"
            />
            {/* Affichage de la liste des pages dans un tableau */}
            <div className="row">
              {filteredPage.length > 0 ? (
                filteredPage
                  // .sort(
                  //   (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
                  // )
                  .map((page) => (
                    <div className="col-md-6 col-lg-4 mb-4" key={page.id}>
                      <Card className="h-100 shadow border">
                        <Card.Body className="d-flex flex-column justify-content-between">
                          {/* Titre et Ordre */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <Card.Title className="fw-bold text-primary mb-1">
                                {page.title}
                              </Card.Title>
                              <Card.Subtitle className="text-muted small">
                                {page.subtitle || "Aucun sous-titre"}
                              </Card.Subtitle>
                            </div>
                            <span className="badge bg-secondary rounded-pill">
                              P {page.order + 1}
                            </span>
                          </div>

                          {/* Infos sections */}
                          <div className="mb-3">
                            <div className="d-flex flex-column small gap-1">
                              <div>
                                <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
                                <strong>Sections :</strong>{" "}
                                {page.sections?.length || 0}
                              </div>
                              <div>
                                <i className="bi bi-files me-2 text-success"></i>
                                <strong>Sous-sections :</strong>{" "}
                                {page.sections?.reduce(
                                  (acc, sec) =>
                                    acc + (sec.subsections?.length || 0),
                                  0
                                ) || 0}
                              </div>
                            </div>
                          </div>

                          {/* Slug & dates */}
                          <div className="mt-auto pt-2 border-top">
                            <div className="small text-secondary mt-2">
                              <strong>Slug :</strong> {page.slug}
                            </div>
                            <div className="text-muted small">
                              Création : {formatDateRelative(page.created_at)}
                              <br />
                              Dernière m-à-j :{" "}
                              {page.created_at === page.updated_at
                                ? "--"
                                : formatDateRelative(page.updated_at)}
                            </div>
                          </div>
                        </Card.Body>

                        <Card.Footer className="bg-body border-top d-flex justify-content-between align-items-center">
                          <Link
                            to={`/admin-gest/pages/edit/${page.id}`}
                            className="btn btn-sm btn-warning"
                          >
                            Modifier
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenModal(page)}
                          >
                            Supprimer
                          </Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  ))
              ) : (
                <div className="text-center mt-4">
                  <p>Aucune page trouvée.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmation pour la suppression d'un page */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        btnColor="danger"
        body={
          <p>
            Voulez-vous vraiment supprimer la page{" "}
            <strong>{selectedPages?.title || "Inconnu"}</strong> ?
          </p>
        }
      />
    </Layout>
  );
};

export default Pages;
