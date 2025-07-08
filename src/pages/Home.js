import React from "react";

import Layout from "../components/Layout/Layout";
// Récupérer l'ID de l'utilisateur connecté à partir du sessionStorage
const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

const Home = () => {
  return (
    <div>
      <Layout>
        <div className="container mt-4 px-4">
          <h1 className="mb-3">Dashboard</h1>
          <h2 className="mb-4">
            Bienvenue, <strong>{userInfo ? userInfo.name : "Invité"}</strong> !
          </h2>

          <div className="card">
            <div className="card-body">
              <p className="card-text">
                Bienvenue sur <strong>Gest</strong>, votre tableau de bord de
                gestion de contenu. Cette application vous permet de créer et
                modifier les pages de votre site facilement, sans avoir à écrire
                une seule ligne de code.
              </p>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">
                  <strong>Utilisateurs :</strong> créez et gérez les comptes
                  administrateurs ou rédacteurs.
                </li>
                <li className="list-group-item">
                  <strong>Pages :</strong> organisez votre site avec des pages
                  structurées en <em>sections</em> et <em>sous-sections</em>.
                  Vous pouvez y ajouter du texte, des images, des boutons, ou
                  même des blocs personnalisés (formulaire, carte...).
                </li>
                <li className="list-group-item">
                  <strong>Visuels & Composants :</strong> personnalisez vos
                  pages avec des variantes de sections (bannières, carrousels,
                  grilles, etc.) directement depuis l'interface.
                </li>
              </ul>
              <p className="card-text">
                Utilisez le menu de gauche pour accéder aux différentes
                fonctionnalités. <strong>Gest</strong> a été pensé pour rester{" "}
                <em>simple, modulaire et intuitif</em>, même sans éditeur
                enrichi.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
