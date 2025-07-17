import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import ImageUploadWithPreview from "./ImageUploadWithPreview";
// import Select from "react-select";

const typeOptions = [
  { value: "piece", label: "Pièce détachée" },
  { value: "vehicule", label: "Véhicule" },
];

const AddProduct = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form principal
  const [product, setProduct] = useState({
    type_id: "",
    libelle: "",
    prix: "",
    prix_promo: "",
    images: [],
    description: "",
    actif: true,
    piece: {},
    vehicule: {},
    codes_promo: [],
  });

  // Récupérer les types de produits depuis l’API
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/produits/type`
        );
        const data = await res.json();
        if (res.ok) {
          setTypes(
            data.types.map((t) => ({
              value: t.slug,
              libelle: t.libelle,
              id: t.id,
            }))
          );
        }
      } catch {
        setTypes(typeOptions); // fallback
      }
    };
    fetchTypes();
  }, []);

  // Gestion du select type
  const handleTypeChange = (option) => {
    setSelectedType(option);
    setProduct((prev) => ({
      ...prev,
      type_id: option?.id || "",
      piece: {},
      vehicule: {},
    }));
  };

  // Gestion des champs principaux
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gestion images (multi)
  //   const handleImagesChange = (e) => {
  //     setProduct((prev) => ({
  //       ...prev,
  //       images: Array.from(e.target.files),
  //     }));
  //   };

  // Champs dynamiques selon type
  const handleDetailChange = (section, name, value) => {
    setProduct((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  // Codes promo
  const addCodePromo = () => {
    setProduct((prev) => ({
      ...prev,
      codes_promo: [
        ...prev.codes_promo,
        { code: "", reduction: "", valeur_remise: "", date_expiration: "" },
      ],
    }));
  };

  const removeCodePromo = (idx) => {
    setProduct((prev) => ({
      ...prev,
      codes_promo: prev.codes_promo.filter((_, i) => i !== idx),
    }));
  };

  const handleCodePromoChange = (idx, name, value) => {
    setProduct((prev) => {
      const codes = [...prev.codes_promo];
      codes[idx][name] = value;
      return { ...prev, codes_promo: codes };
    });
  };

  // Soumission
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("type_id", product.type_id);
      formData.append("libelle", product.libelle);
      formData.append("prix", product.prix);
      if (product.prix_promo) formData.append("prix_promo", product.prix_promo);
      formData.append("description", product.description || "");
      formData.append("actif", product.actif ? 1 : 0);

      // Images
      product.images.forEach((img, i) => {
        formData.append(`images[${i}]`, img);
      });

      // Détails selon type
      if (selectedType?.value === "piece") {
        Object.entries(product.piece).forEach(([k, v]) => {
          if (v !== "") formData.append(`piece[${k}]`, v);
        });
      }
      if (selectedType?.value === "vehicule") {
        Object.entries(product.vehicule).forEach(([k, v]) => {
          if (v !== "") formData.append(`vehicule[${k}]`, v);
        });
      }

      // Codes promo
      product.codes_promo.forEach((cp, i) => {
        formData.append(`codes_promo[${i}][code]`, cp.code);
        if (cp.reduction)
          formData.append(`codes_promo[${i}][reduction]`, cp.reduction);
        if (cp.valeur_remise)
          formData.append(`codes_promo[${i}][valeur_remise]`, cp.valeur_remise);
        if (cp.date_expiration)
          formData.append(
            `codes_promo[${i}][date_expiration]`,
            cp.date_expiration
          );
      });

      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/produits`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Produit ajouté !");
        window.location.href = "/admin-gest/produits";
      } else {
        setError(data.message || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Champs dynamiques
  const renderPieceFields = () => (
    <>
      <div className="mb-3">
        <label>Marque</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex : Michellin"
          value={product.piece.marque || ""}
          onChange={(e) =>
            handleDetailChange("piece", "marque", e.target.value)
          }
        />
      </div>

      <div className="mb-3">
        <label>Modèle</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex : XTT"
          value={product.piece.modele || ""}
          onChange={(e) =>
            handleDetailChange("piece", "modele", e.target.value)
          }
        />
      </div>

      <div className="mb-3">
        <label>Catégorie</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ex : Moteur, Freinage, Suspension..."
          value={product.piece.categorie || ""}
          onChange={(e) =>
            handleDetailChange("piece", "categorie", e.target.value)
          }
        />
      </div>

      <div className="mb-3">
        <label>Poids (en KG)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Ex : 2.5 kg"
          value={product.piece.poids || ""}
          onChange={(e) => handleDetailChange("piece", "poids", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Quantité</label>
        <input
          type="number"
          className="form-control"
          placeholder="Ex : 10"
          value={product.piece.quantite || ""}
          onChange={(e) =>
            handleDetailChange("piece", "quantite", e.target.value)
          }
        />
      </div>
    </>
  );

  const renderVehiculeFields = () => (
    <>
      <div className="mb-3">
        <label>État</label>
        <input
          type="text"
          className="form-control"
          value={product.vehicule.etat || ""}
          onChange={(e) =>
            handleDetailChange("vehicule", "etat", e.target.value)
          }
        />
      </div>
      <div className="mb-3">
        <label>Catégorie</label>
        <input
          type="text"
          className="form-control"
          value={product.vehicule.categorie || ""}
          onChange={(e) =>
            handleDetailChange("vehicule", "categorie", e.target.value)
          }
        />
      </div>
      <div className="mb-3">
        <label>Date immatriculation</label>
        <input
          type="date"
          className="form-control"
          value={product.vehicule.date_immatriculation || ""}
          onChange={(e) =>
            handleDetailChange(
              "vehicule",
              "date_immatriculation",
              e.target.value
            )
          }
        />
      </div>
      <div className="mb-3">
        <label>Transmission</label>
        <input
          type="text"
          className="form-control"
          value={product.vehicule.transmission || ""}
          onChange={(e) =>
            handleDetailChange("vehicule", "transmission", e.target.value)
          }
        />
      </div>
      <div className="mb-3">
        <label>Carburant</label>
        <input
          type="text"
          className="form-control"
          value={product.vehicule.carburant || ""}
          onChange={(e) =>
            handleDetailChange("vehicule", "carburant", e.target.value)
          }
        />
      </div>
      <div className="mb-3">
        <label>Kilométrage</label>
        <input
          type="number"
          className="form-control"
          value={product.vehicule.kilometrage || ""}
          onChange={(e) =>
            handleDetailChange("vehicule", "kilometrage", e.target.value)
          }
        />
      </div>
      {/* Ajoute d'autres champs si besoin */}
    </>
  );

  return (
    <Layout>
      <Back>admin-gest/produits</Back>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h2 className="mb-4">Ajouter un produit</h2>
            {error && (
              <ToastMessage message={error} onClose={() => setError(null)} />
            )}

            {/* Section Informations générales */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                Informations générales
              </div>
              <div className="card-body">
                <div className="row g-4 align-items-start">
                  <div className="col-md-7">
                    {/* Sélection du type */}
                    <div className="mb-3">
                      <label className="form-label">Type de produit *</label>
                      <select
                        className="form-select"
                        value={product.type_id}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selected = types.find(
                            (t) => t.id === parseInt(selectedId)
                          );
                          handleTypeChange(selected || null);
                        }}
                      >
                        <option value="">Choisir un type</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Libellé *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="libelle"
                        placeholder="Ex : Filtre à air Toyota"
                        value={product.libelle}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Prix (FCFA) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="prix"
                          placeholder="Ex : 15000"
                          value={product.prix}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Prix promo</label>
                        <input
                          type="number"
                          className="form-control"
                          name="prix_promo"
                          placeholder="Ex : 12000 (laisser vide si pas de réduction)"
                          value={product.prix_promo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows={4}
                        placeholder="Donnez des détails sur le produit à vendre"
                        value={product.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="actif"
                        name="actif"
                        checked={product.actif}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="actif">
                        Activer le produit
                      </label>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Images du produit</label>
                    <small className="form-text text-muted d-block mb-2">
                      Cliquez sur le carré “+” pour ajouter une image.
                    </small>
                    <ImageUploadWithPreview
                      images={product.images}
                      setImages={(updater) =>
                        setProduct((prev) => ({
                          ...prev,
                          images:
                            typeof updater === "function"
                              ? updater(prev.images)
                              : updater,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Détails dynamiques */}
            {selectedType && (
              <>
                {selectedType.value === "piece" && (
                  <div className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      Détails pièce
                    </div>
                    <div className="card-body">{renderPieceFields()}</div>
                  </div>
                )}
                {selectedType.value === "vehicule" && (
                  <div className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      Détails véhicule
                    </div>
                    <div className="card-body">{renderVehiculeFields()}</div>
                  </div>
                )}
              </>
            )}

            {/* Section Codes promo */}
            {selectedType && (
              <div className="card mb-4">
                <div className="card-header bg-info text-white">
                  Codes promo
                </div>
                <div className="card-body">
                  {product.codes_promo.map((cp, idx) => (
                    <div key={idx} className="border rounded p-2 mb-3">
                      <div className="row g-2">
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Code"
                            value={cp.code}
                            onChange={(e) =>
                              handleCodePromoChange(idx, "code", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="%"
                            value={cp.reduction}
                            onChange={(e) =>
                              handleCodePromoChange(
                                idx,
                                "reduction",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Remise (FCFA)"
                            value={cp.valeur_remise}
                            onChange={(e) =>
                              handleCodePromoChange(
                                idx,
                                "valeur_remise",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="date"
                            className="form-control"
                            value={cp.date_expiration}
                            onChange={(e) =>
                              handleCodePromoChange(
                                idx,
                                "date_expiration",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-1 d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeCodePromo(idx)}
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addCodePromo}
                  >
                    <i className="fa fa-plus" /> Ajouter un code promo
                  </button>
                </div>
              </div>
            )}

            {/* Bouton d'action centré */}
            <div className="d-grid mb-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                onClick={() => setShowModal(true)}
                disabled={
                  loading ||
                  !selectedType ||
                  !product.libelle ||
                  !product.prix ||
                  !product.type_id
                }
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Chargement...
                  </>
                ) : (
                  "Créer le produit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmPopup
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        title="Confirmer l'ajout du produit"
        btnColor="primary"
        body={<p>Voulez-vous vraiment enregistrer ce produit ?</p>}
      />
    </Layout>
  );
};

export default AddProduct;
