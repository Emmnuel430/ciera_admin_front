import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout"; // Composant Layout qui contient la structure générale de la page
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter"; // Composant pour l'en-tête avec filtre
import Loader from "../../components/Layout/Loader"; // Composant pour le loader
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Composant de modal de confirmation pour la suppression d'utilisateur
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token

const UserList = () => {
  // États locaux pour gérer les utilisateurs, l'état de chargement, les erreurs et les modals
  const [users, setUsers] = useState([]); // Liste des utilisateurs
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState(""); // État pour les erreurs
  const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher le modal de confirmation
  const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné pour suppression
  const [filter, setFilter] = useState(""); // État pour le filtre
  const [sortOption, setSortOption] = useState(""); // État pour l'option de tri
  const [sortedUsers, setSortedUsers] = useState([]); // Liste des utilisateurs triés
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les users

  // Récupérer l'ID de l'utilisateur connecté à partir du sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null; // ID de l'utilisateur connecté

  // Récupérer la liste des utilisateurs lors du premier rendu
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // On commence par définir l'état de chargement à true
      setError(""); // Réinitialiser l'erreur

      try {
        // Requête pour récupérer la liste des utilisateurs
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/liste_user`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs.");
        }
        const data = await response.json(); // Convertir la réponse en JSON
        setUsers(data.users); // Mettre à jour l'état users avec les données récupérées
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Si erreur, la définir dans l'état
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchUsers(); // Appel de la fonction pour récupérer les utilisateurs
  }, []); // Dépendances vides, donc ce code est exécuté au premier rendu seulement

  // Ouvrir le modal de confirmation de suppression avec l'utilisateur sélectionné
  const handleOpenModal = (user) => {
    setSelectedUser(user); // On définit l'utilisateur sélectionné
    setShowModal(true); // On affiche le modal
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false); // Cacher le modal
    setSelectedUser(null); // Réinitialiser l'utilisateur sélectionné
  };

  // Fonction pour supprimer l'utilisateur sélectionné
  const handleDelete = async () => {
    if (!selectedUser) return; // Si aucun utilisateur sélectionné, on ne fait rien

    try {
      // Requête DELETE pour supprimer l'utilisateur
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/delete_user/${selectedUser.id}?user_id=${userId}`,
        {
          method: "DELETE", // Méthode de suppression
        }
      );

      const result = await response.json(); // Convertir la réponse en JSON

      // Si l'utilisateur a été supprimé
      if (result.status === "deleted") {
        alert("Utilisateur supprimé !"); // Afficher un message de succès
        setUsers(users.filter((user) => user.id !== selectedUser.id)); // Mettre à jour la liste des utilisateurs
      } else {
        alert("Échec de la suppression."); // Si l'échec
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression."); // En cas d'erreur
    } finally {
      handleCloseModal(); // Fermer le modal après la suppression
    }
  };

  const filteredUsers = sortedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatRole(role) {
    if (!role) return "";
    return role
      .split("_") // coupe par "_"
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // met en majuscule la première lettre
      .join(" "); // re-colle avec des espaces
  }

  const roleColors = {
    super_admin: "bg-success",
    staff: "bg-primary",
  };

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
              placeholder="Rechercher un utilisateur..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* Affichage de l'en-tête avec filtre et le bouton pour ajouter un utilisateur */}
            <HeaderWithFilter
              active
              title="Utilisateurs"
              link="/admin-gest/register"
              linkText="Ajouter"
              main={users.length || null}
              filter={filter}
              setFilter={setFilter}
              filterOptions={[
                { value: "", label: "Tous les rôles" },
                { value: "super_admin", label: "Super Admin" },
                { value: "caisse", label: "Caisse" },
                { value: "gardien", label: "Gardien" },
                { value: "secretaire", label: "Secrétaire" },
                { value: "chef_atelier", label: "Chef Atelier" },
              ]}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={users}
              setSortedList={setSortedUsers}
              alphaField="last_name"
              dateField="created_at"
            />
            {/* Affichage de la liste des utilisateurs dans un tableau */}
            <Table hover responsive className="centered-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nom</th>
                  <th>Pseudo</th>
                  <th>Rôle</th>
                  <th>Opérations</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  // Si des utilisateurs existent, on les affiche dans des lignes de tableau
                  filteredUsers
                    .filter((user) => !filter || user.role === filter)
                    .map((user, index) => (
                      <tr key={index + 1}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.pseudo}</td>
                        {/* Affichage du rôle avec une couleur différente pour admin et staff */}
                        <td className="text-center text-uppercase">
                          <span
                            className={`badge ${
                              roleColors[user.role] || "bg-dark"
                            } text-white`}
                          >
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="table-operations d-flex justify-content-center">
                          {/* Lien pour modifier l'utilisateur */}
                          <Link
                            to={`/admin-gest/update/user/${user.id}`}
                            className="btn btn-warning btn-sm me-2"
                          >
                            Modifier
                          </Link>
                          {/* Bouton pour supprimer l'utilisateur (si ce n'est pas l'utilisateur connecté) */}
                          {user.id !== userInfo.id && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleOpenModal(user)} // Ouvre le modal pour la suppression
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                ) : (
                  // Si aucun utilisateur n'est trouvé
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>

      {/* Modal de confirmation pour la suppression d'un utilisateur */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        body={
          <p>
            Voulez-vous vraiment supprimer l'utilisateur{" "}
            <strong>{selectedUser?.name || "Inconnu"}</strong> ?
          </p>
        }
      />
    </Layout>
  );
};

export default UserList;
