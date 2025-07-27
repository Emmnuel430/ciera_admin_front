// Importation des dépendances React et des composants nécessaires de React Router
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Protected from "./components/Protected"; // Composant pour protéger les routes
// Importation des pages et composants utilisés dans les routes
import AccessDenied from "./components/AccessDenied";
import Login from "./pages/Login";
import Home from "./pages/Home";
// ----
import Register from "./pages/users/Register";
import UserList from "./pages/users/UserList";
import UserUpdate from "./pages/users/UserUpdate";

// ----
import Pages from "./pages/makePage/Pages";
import AddPage from "./pages/makePage/AddPage";
import EditPage from "./pages/makePage/EditPage";
import Settings from "./pages/settings/SettingsList";

// ----
import ScrollToTop from "./components/ScrollToTop";
import ProductsList from "./pages/ecom/ProductsList";
import AddProduct from "./pages/ecom/AddProduct";
import ProductUpdate from "./pages/ecom/ProductUpdate";
import RdvList from "./pages/rdv/RdvList";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth */}
        <Route path="/admin-gest" element={<Login />} />

        {/* ------------------------ */}
        <Route path="/admin-gest/home" element={<Protected Cmp={Home} />} />

        {/* Utilisateurs (Super Admin uniquement) */}
        <Route
          path="/admin-gest/register"
          element={<Protected Cmp={Register} adminOnly />}
        />
        <Route
          path="/admin-gest/utilisateurs"
          element={<Protected Cmp={UserList} adminOnly />}
        />
        <Route
          path="/admin-gest/update/user/:id"
          element={<Protected Cmp={UserUpdate} adminOnly />}
        />

        {/* Produits (Super Admin uniquement) */}
        <Route
          path="/admin-gest/produit/add"
          element={<Protected Cmp={AddProduct} devOnly />}
        />
        <Route
          path="/admin-gest/produits"
          element={<Protected Cmp={ProductsList} devOnly />}
        />
        <Route
          path="/admin-gest/produits/edit/:id"
          element={<Protected Cmp={ProductUpdate} devOnly />}
        />

        {/* ------------------------ */}

        {/* Liste des pages */}
        <Route path="/admin-gest/pages" element={<Pages />} />

        {/* Ajout d'une nouvelle page */}
        <Route
          path="/admin-gest/pages/add"
          element={<Protected Cmp={AddPage} devOnly />}
        />

        {/* Modification d'une page existante */}
        <Route path="/admin-gest/pages/edit/:id" element={<EditPage />} />

        {/* ------------------------ */}

        <Route
          path="/admin-gest/rdvs"
          element={<Protected Cmp={RdvList} adminOnly />}
        />
        {/* Setings */}
        <Route
          path="/admin-gest/settings"
          element={<Protected Cmp={Settings} devOnly />}
        />

        {/* Si l'URL n'est pas définie, renvoyer l'utilisateur vers la page de connexion */}
        <Route path="*" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
};

// Exportation du composant AppRoutes pour l'utiliser dans d'autres parties de l'application
export default AppRoutes;
