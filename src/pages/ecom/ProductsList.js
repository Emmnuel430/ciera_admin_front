import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import Loader from "../../components/Layout/Loader";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import SearchBar from "../../components/Layout/SearchBar";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { formatDateRelative } from "../../utils/formatDateRelative";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [sortedProducts, setSortedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Récupérer la liste des produits (light)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/produits`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des produits.");
        const data = await response.json();
        // data.produits attendu
        setProducts(data.produits || []);
      } catch (err) {
        setError("Impossible de charger les produits : " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Grouper par type
  useEffect(() => {
    const groupByType = {};
    (sortedProducts.length ? sortedProducts : products).forEach((prod) => {
      const type = prod.type?.libelle || "Autre";
      if (!groupByType[type]) groupByType[type] = [];
      groupByType[type].push(prod);
    });
    setGrouped(groupByType);
  }, [products, sortedProducts]);

  // Modal suppression
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/produits/${selectedProduct.id}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (result.status === "deleted") {
        alert("Produit supprimé !");
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
      } else {
        alert("Échec de la suppression.");
      }
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      handleCloseModal();
    }
  };

  // Recherche
  const filteredProducts = (prods) =>
    prods.filter(
      (prod) =>
        prod.libelle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.ref?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Layout>
      <div className="container mt-2">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }}
          >
            <Loader />
          </div>
        ) : (
          <>
            <SearchBar
              placeholder="Rechercher un produit..."
              onSearch={setSearchQuery}
              delay={300}
            />
            <HeaderWithFilter
              title="Produits"
              link="/admin-gest/produit/add"
              linkText="Ajouter"
              main={products.length || null}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={products}
              setSortedList={setSortedProducts}
              alphaField="libelle"
              dateField="created_at"
            />
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center mt-4">
                <p>Aucun produit trouvé.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([type, prods]) => (
                <div key={type} className="mb-4">
                  <h5 className="mb-3 text-primary text-capitalize">{type}</h5>
                  <div className="row">
                    {filteredProducts(prods).length === 0 ? (
                      <div className="text-muted mb-3">
                        Aucun produit pour ce type.
                      </div>
                    ) : (
                      filteredProducts(prods).map((prod) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={prod.id}>
                          <Card
                            className={`product-card shadow-sm border rounded-4 ${
                              !prod.actif ? "opacity-50" : ""
                            }`}
                          >
                            <Card.Body className="d-flex flex-column h-100">
                              {/* Titre + statut actif */}
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <Card.Title className="h5 fw-bold text-primary mb-1">
                                    {prod.libelle}
                                  </Card.Title>
                                  <div className="text-muted small">
                                    Réf : {prod.ref}
                                  </div>
                                </div>
                                <span
                                  className={`badge px-3 py-2 rounded-pill fs-6 ${
                                    prod.actif ? "bg-success" : "bg-danger"
                                  }`}
                                >
                                  {prod.actif ? "Actif" : "Inactif"}
                                </span>
                              </div>

                              {/* Prix */}
                              <div className="mb-3">
                                <div className="fw-semibold">Prix :</div>
                                <div className="fs-6">
                                  <span
                                    className={
                                      prod.prix_promo
                                        ? "text-muted text-decoration-line-through"
                                        : "text-dark fw-bold"
                                    }
                                  >
                                    {parseFloat(prod.prix).toLocaleString()}{" "}
                                    FCFA
                                  </span>
                                  {prod.prix_promo && (
                                    <span className="ms-2 text-success fw-bold">
                                      {parseFloat(
                                        prod.prix_promo
                                      ).toLocaleString()}{" "}
                                      FCFA
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Si pièce */}
                              {prod.piece && (
                                <div className="mb-3">
                                  <div className="fw-semibold">Quantité :</div>
                                  <div className="text-body">
                                    {prod.piece?.quantite} pièces disponibles
                                  </div>
                                </div>
                              )}

                              {/* Code promo */}
                              {prod.codes_promo?.length > 0 && (
                                <div className="mb-3">
                                  <span className="badge bg-info text-dark">
                                    {prod.codes_promo.length} code
                                    {prod.codes_promo.length > 1
                                      ? "s"
                                      : ""}{" "}
                                    promo
                                  </span>
                                </div>
                              )}

                              {/* Date */}
                              <div className="mt-auto pt-3 border-top text-muted small">
                                Créé il y a :{" "}
                                <strong>
                                  {formatDateRelative(prod.created_at) || "--"}
                                </strong>
                              </div>
                            </Card.Body>

                            {/* Footer boutons */}
                            <Card.Footer className="bg-body border-top d-flex justify-content-between align-items-center  rounded-4">
                              <Link
                                to={`/admin-gest/produits/edit/${prod.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Modifier
                              </Link>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleOpenModal(prod)}
                              >
                                Supprimer
                              </Button>
                            </Card.Footer>
                          </Card>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        btnColor="danger"
        body={
          <p>
            Voulez-vous vraiment supprimer le produit{" "}
            <strong>{selectedProduct?.libelle || "Inconnu"}</strong> ?
          </p>
        }
      />
    </Layout>
  );
};

export default ProductsList;
