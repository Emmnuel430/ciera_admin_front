import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import ImageUploadWithPreview from "./ImageUploadWithPreview";
import { useParams } from "react-router-dom";
import Loader from "../../components/Layout/Loader";

const ProductUpdate = () => {
  const { id } = useParams();
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  // Pour gérer les images supprimées côté backend
  const [deletedImages, setDeletedImages] = useState([]);

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

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setLoading(true);
      try {
        // Charger types et produit en parallèle
        const [typesRes, productRes] = await Promise.all([
          fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/produits/type`),
          fetchWithToken(
            `${process.env.REACT_APP_API_BASE_URL}/produits/${id}`
          ),
        ]);
        const typesData = await typesRes.json();
        const productData = await productRes.json();

        if (!typesRes.ok) throw new Error("Erreur chargement types");
        if (!productRes.ok || !productData.produit)
          throw new Error("Produit introuvable");

        const typesArr = typesData.types.map((t) => ({
          value: t.slug,
          libelle: t.libelle,
          id: t.id,
        }));

        if (isMounted) {
          setTypes(typesArr);

          const p = productData.produit;
          // console.log(p.piece);

          setProduct({
            type_id: p.type_id,
            libelle: p.libelle,
            prix: parseInt(p.prix, 10),
            prix_promo: parseInt(p.prix_promo, 10) || "",
            images: Array.isArray(p.images) ? p.images : [],
            description: p.description || "",
            actif: !!p.actif,
            piece: p.piece || {},
            vehicule: p.vehicule || {},
            codes_promo: p.codes_promo || [],
          });
          setSelectedType(
            typesArr.find((t) => t.id === p.type_id) || {
              value: p.type?.slug,
              id: p.type_id,
            }
          );
        }
      } catch (e) {
        setError(e.message || "Erreur lors du chargement");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAll();
    return () => {
      isMounted = false;
    };
  }, [id]);

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
  const formatNumberWithSpaces = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const unformatNumber = (value) => {
    return value.replace(/\s/g, "");
  };

  // Gestion des champs principaux
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue;

    if (type === "checkbox") {
      newValue = checked;
    } else if (["prix", "prix_promo"].includes(name)) {
      const rawValue = unformatNumber(value);
      if (!/^\d*$/.test(rawValue)) return; // Empêche les caractères non numériques
      newValue = rawValue;
    } else {
      newValue = value;
    }

    setProduct((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

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

  // Gestion images (ImageUploadWithPreview)
  const handleImagesChange = (updater) => {
    setProduct((prev) => {
      let newImages =
        typeof updater === "function" ? updater(prev.images) : updater;

      // Si une image string (déjà uploadée) a disparu, on la met dans deletedImages
      if (Array.isArray(prev.images)) {
        const removed = prev.images.filter(
          (img) =>
            typeof img === "string" &&
            !newImages.includes(img) &&
            !deletedImages.includes(img)
        );
        if (removed.length) setDeletedImages((d) => [...d, ...removed]);
      }
      return { ...prev, images: newImages };
    });
  };

  // Soumission
  const handleSubmit = async () => {
    setLoad(true);
    setError("");
    try {
      // console.log("Submitting form data:", product);
      const formData = new FormData();
      // formData.append("type_id", product.type_id);
      formData.append("libelle", product.libelle);
      formData.append("prix", product.prix);
      if (product.prix_promo) formData.append("prix_promo", product.prix_promo);
      formData.append("description", product.description || "");
      formData.append("actif", product.actif ? 1 : 0);

      // Fichiers (nouvelles images uniquement)
      product.images.forEach((img) => {
        if (typeof img !== "string") {
          formData.append(`images[]`, img);
        }
      });

      // Images existantes (à garder)
      const existingImages = product.images.filter(
        (img) => typeof img === "string"
      );
      existingImages.forEach((img) => {
        formData.append(`existing_images[]`, img);
      });

      // Images à supprimer
      deletedImages.forEach((img) => {
        formData.append(`deleted_images[]`, img);
      });

      // Détails selon type
      if (selectedType?.value === "piece") {
        Object.entries(product.piece).forEach(([k, v]) => {
          if (v !== "" || v !== null || v !== undefined) {
            formData.append(`piece[${k}]`, v);
          }
        });
      }
      if (selectedType?.value === "vehicule") {
        Object.entries(product.vehicule).forEach(([k, v]) => {
          if (v !== "" || v === null) formData.append(`vehicule[${k}]`, v);
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

      // console.log([...formData]);
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/produits/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Produit mis à jour !");
        navigate("/admin-gest/produits");
      } else {
        setError(data.message + " : " + data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur serveur : " + err.message);
    } finally {
      setLoad(false);
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
          value={formatNumberWithSpaces(product.piece.poids || "")}
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
          min={0}
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
    </>
  );

  return (
    <Layout>
      <Back>admin-gest/produits</Back>
      <div className="container mt-5">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
            <Loader />
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <h2 className="mb-4">Modifier un produit</h2>
              {error && (
                <ToastMessage message={error} onClose={() => setError(null)} />
              )}

              {/* Section Informations générales */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">Informations générales</div>
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
                            const selectedId = parseInt(e.target.value);
                            const selected = types.find((t) => t.id === selectedId);
                            handleTypeChange(selected || null);
                          }}
                          disabled
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
                            type="text"
                            className="form-control"
                            name="prix"
                            placeholder="Ex : 15000"
                            value={formatNumberWithSpaces(product.prix || "")}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Prix promo</label>
                          <input
                            type="text"
                            className="form-control"
                            name="prix_promo"
                            placeholder="Ex : 12000 (laisser vide si pas de réduction)"
                            value={formatNumberWithSpaces(product.prix_promo || "")}
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
                        Cliquez sur le carré “+” pour ajouter une image. Vous pouvez supprimer une image existante.
                      </small>
                      <ImageUploadWithPreview
                        images={product.images}
                        setImages={handleImagesChange}
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
                      <div className="card-header bg-secondary text-white">Détails pièce</div>
                      <div className="card-body">{renderPieceFields()}</div>
                    </div>
                  )}
                  {selectedType.value === "vehicule" && (
                    <div className="card mb-4">
                      <div className="card-header bg-secondary text-white">Détails véhicule</div>
                      <div className="card-body">{renderVehiculeFields()}</div>
                    </div>
                  )}
                </>
              )}

              {/* Section Codes promo */}
              {selectedType && (
                <div className="card mb-4">
                  <div className="card-header bg-info text-white">Codes promo</div>
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
                              onChange={(e) => handleCodePromoChange(idx, "code", e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-2">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="%"
                              value={cp.reduction}
                              onChange={(e) => handleCodePromoChange(idx, "reduction", e.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Remise (FCFA)"
                              value={cp.valeur_remise}
                              onChange={(e) => handleCodePromoChange(idx, "valeur_remise", e.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="date"
                              className="form-control"
                              value={cp.date_expiration}
                              onChange={(e) => handleCodePromoChange(idx, "date_expiration", e.target.value)}
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
                  className="btn btn-success btn-lg"
                  onClick={() => setShowModal(true)}
                  disabled={
                    load ||
                    !selectedType ||
                    !product.libelle ||
                    !product.prix ||
                    !product.type_id
                  }
                >
                  {load ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Chargement...
                    </>
                  ) : (
                    "Mettre à jour le produit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmPopup
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        title="Confirmer la modification du produit"
        btnColor="success"
        body={<p>Voulez-vous vraiment enregistrer les modifications ?</p>}
      />
    </Layout>
  );
};

export default ProductUpdate;
