import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Importation du modal de confirmation
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token
import Select from "react-select";
import useSelectTheme from "./useSelectTheme";

const AddPage = () => {
  const { customTheme } = useSelectTheme();
  const [error, setError] = useState(""); // Message d'erreur en cas de problème
  const [page, setPage] = useState({
    title: "",
    subtitle: "",
    template: "default",
    order: 0,
    is_active: true,
    // main_image: null,
    sections: [],
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    setShowModal(false);
  };

  // Gestion changement page (inputs simples)
  const handlePageChange = (e) => {
    const { name, type, checked, value } = e.target;
    setPage((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Sections
  const addSection = () => {
    setPage((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "",
          subtitle: "",
          type: "hero",
          variant: "",
          content: "",
          button_text: "",
          button_link: "",
          image: null,
          image_mobile: null,
          order: prev.sections.length + 1,
          is_active: true,
          // settings: {},
          subsections: [],
          custom_blocks: [],
        },
      ],
    }));
  };

  const removeSection = (index) => {
    const newSections = [...page.sections];
    newSections.splice(index, 1);
    setPage({ ...page, sections: newSections });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...page.sections];
    newSections[index][field] = value;
    setPage({ ...page, sections: newSections });
  };

  // Sous-sections
  const addSubsection = (sectionIndex) => {
    const newSections = [...page.sections];
    newSections[sectionIndex].subsections.push({
      title: "",
      subtitle: "",
      content: "",
      date: "",
      prix: "",
      image: null,
      button_text: "",
      button_link: "",
      order: newSections[sectionIndex].subsections.length + 1,
      // extras: {},
    });
    setPage({ ...page, sections: newSections });
  };

  const removeSubsection = (sectionIndex, subIndex) => {
    const newSections = [...page.sections];
    newSections[sectionIndex].subsections.splice(subIndex, 1);
    setPage({ ...page, sections: newSections });
  };

  const handleSubsectionChange = (sectionIndex, subIndex, name, value) => {
    const newSections = [...page.sections];
    newSections[sectionIndex].subsections[subIndex][name] = value;
    setPage({ ...page, sections: newSections });
  };

  /* // Blocs personnalisés
  const addCustomBlock = (sectionIndex) => {
    const newSections = [...page.sections];
    newSections[sectionIndex].custom_blocks.push({
      block_type: "",
      config: {},
    });
    setPage({ ...page, sections: newSections });
  };

  const removeCustomBlock = (sectionIndex, blockIndex) => {
    const newSections = [...page.sections];
    newSections[sectionIndex].custom_blocks.splice(blockIndex, 1);
    setPage({ ...page, sections: newSections });
  };

  const handleCustomBlockChange = (sectionIndex, blockIndex, e) => {
    const { name, value } = e.target;
    const newSections = [...page.sections];
    newSections[sectionIndex].custom_blocks[blockIndex][name] = value;
    setPage({ ...page, sections: newSections });
  }; */

  const sectionTypeVariants = {
    hero: [
      "default",
      "split",
      "split-inverse",
      "minimal",
      "carousel",
      "localisation",
      "info",
      "info-inverse",
    ],
    grid: ["columns", "icons", "cards", "split", "split-dark", "sections"],
    carousel: ["simple", "with-captions"],
    faq: ["accordion", "list"],
    calltoaction: ["centered", "split", "app", "newsletter", "contact"],
  };

  const faIcons = [
    // Icônes utiles (génériques ou mécaniques simples)
    { label: "Ampoule", value: "fas fa-lightbulb" },
    { label: "App Store", value: "fab fa-apple" },
    { label: "Batterie", value: "fas fa-car-battery" },
    { label: "Calendrier", value: "fas fa-calendar" },
    { label: "Camion", value: "fas fa-truck" },
    { label: "Camionnette", value: "fas fa-truck-pickup" },
    { label: "Cercle d’aide", value: "fas fa-circle-question" },
    { label: "Cercle ok", value: "fas fa-check-circle" },
    { label: "Clé", value: "fas fa-wrench" },
    { label: "Cœur", value: "fas fa-heart" },
    { label: "Engrenage", value: "fas fa-gear" },
    { label: "Étoile", value: "fas fa-star" },
    { label: "Google Play", value: "fab fa-google-play" },
    { label: "Horloge", value: "fas fa-clock" },
    { label: "Huile", value: "fas fa-oil-can" },
    { label: "Maison", value: "fas fa-home" },
    { label: "Panier", value: "fas fa-shopping-cart" },
    { label: "Pompe à essence", value: "fas fa-gas-pump" },
    { label: "Signal d’alerte", value: "fas fa-triangle-exclamation" },
    { label: "Téléphone", value: "fas fa-phone" },
    { label: "Utilisateur", value: "fas fa-user" },
    { label: "Voiture", value: "fas fa-car" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // Champs page
      formData.append("title", page.title);
      formData.append("subtitle", page.subtitle || "");
      formData.append("template", page.template || "default");
      // formData.append("order", page.order || 0);
      formData.append("is_active", page.is_active ? 1 : 0);

      // if (page.main_image instanceof File) {
      //   formData.append("main_image", page.main_image);
      // }

      // Sections
      page.sections.forEach((section, sIndex) => {
        // Champs obligatoires et optionnels section
        formData.append(`sections[${sIndex}][title]`, section.title || "");
        formData.append(
          `sections[${sIndex}][subtitle]`,
          section.subtitle || ""
        );
        formData.append(`sections[${sIndex}][type]`, section.type || "hero");
        formData.append(`sections[${sIndex}][variant]`, section.variant || "");
        formData.append(`sections[${sIndex}][content]`, section.content || "");
        formData.append(
          `sections[${sIndex}][button_text]`,
          section.button_text || ""
        );
        formData.append(
          `sections[${sIndex}][button_link]`,
          section.button_link || ""
        );
        formData.append(`sections[${sIndex}][order]`, section.order || 0);
        formData.append(
          `sections[${sIndex}][is_active]`,
          section.is_active ?? true
        );

        if (section.image instanceof File) {
          formData.append(`sections[${sIndex}][image]`, section.image);
        }

        if (section.image_mobile instanceof File) {
          formData.append(
            `sections[${sIndex}][image_mobile]`,
            section.image_mobile
          );
        }

        // Settings (JSON) stringify s’il y a
        // if (section.settings) {
        //   formData.append(
        //     `sections[${sIndex}][settings]`,
        //     JSON.stringify(section.settings)
        //   );
        // }

        // Sous-sections
        section.subsections?.forEach((sub, subIndex) => {
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][title]`,
            sub.title || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][subtitle]`,
            sub.subtitle || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][content]`,
            sub.content || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][date]`,
            sub.date || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][prix]`,
            sub.prix ?? ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][button_text]`,
            sub.button_text || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][button_link]`,
            sub.button_link || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][icon]`,
            sub.icon || ""
          );
          formData.append(
            `sections[${sIndex}][subsections][${subIndex}][order]`,
            sub.order || 0
          );

          // Extras JSON stringify si présent
          // if (sub.extras) {
          //   formData.append(
          //     `sections[${sIndex}][subsections][${subIndex}][extras]`,
          //     JSON.stringify(sub.extras)
          //   );
          // }

          if (sub.image instanceof File) {
            formData.append(
              `sections[${sIndex}][subsections][${subIndex}][image]`,
              sub.image
            );
          }
        });

        // Blocs personnalisés (optionnel)
        section.custom_blocks?.forEach((block, bIndex) => {
          formData.append(
            `sections[${sIndex}][custom_blocks][${bIndex}][block_type]`,
            block.block_type || ""
          );
          formData.append(
            `sections[${sIndex}][custom_blocks][${bIndex}][config]`,
            JSON.stringify(block.config || {})
          );
        });
      });

      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/pages`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Page créée avec succès !");
        navigate("/admin-gest/pages");
      } else {
        setError(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError("Erreur serveur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>admin-gest/pages</Back>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h2 className="mb-4">Créer une page</h2>

            {error && (
              <ToastMessage message={error} onClose={() => setError(null)} />
            )}

            <>
              {/* Titre */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={page.title}
                  onChange={handlePageChange}
                  required
                />
              </div>

              {/* Sous-titre */}
              <div className="mb-3">
                <label htmlFor="subtitle" className="form-label">
                  Sous-titre
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  className="form-control"
                  value={page.subtitle}
                  onChange={handlePageChange}
                />
              </div>

              {/* Template */}
              <div className="mb-3">
                <label htmlFor="template" className="form-label">
                  Template
                </label>
                <select
                  id="template"
                  name="template"
                  className="form-select"
                  value={page.template}
                  onChange={handlePageChange}
                >
                  <option value="default">Default</option>
                  <option value="avec_sidebar">Avec sidebar</option>
                  {/* <option value="pleine_largeur">Pleine largeur</option>
                   */}
                </select>
              </div>

              {/* Ordre */}
              {/* <div className="mb-3">
                <label htmlFor="order" className="form-label">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  className="form-control"
                  value={page.order}
                  min={1}
                  onChange={handlePageChange}
                />
              </div> */}

              {/* Actif */}
              <div className="form-check form-switch mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_active"
                  name="is_active"
                  checked={page.is_active}
                  onChange={handlePageChange}
                />
                <label className="form-check-label" htmlFor="is_active">
                  Activer la page
                </label>
              </div>

              {/* Image principale
              <div className="mb-4">
                <label htmlFor="main_image" className="form-label">
                  Image principale
                </label>
                <input
                  type="file"
                  id="main_image"
                  name="main_image"
                  className="form-control"
                  onChange={handlePageChange}
                />
              </div>
 */}
              {/* Sections */}
              <h4 className="mb-3">Sections</h4>

              {page.sections.map((section, sIndex) => (
                <div key={sIndex} className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="card-title m-0">Section {sIndex + 1}</h5>

                      <div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeSection(sIndex)}
                          title="Supprimer section"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Titre de section *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Nos valeurs, Galerie, Contact..."
                        value={section.title}
                        onChange={(e) =>
                          handleSectionChange(sIndex, "title", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Sous-titre</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Complément d'information de la section"
                        value={section.subtitle}
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "subtitle",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={section.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          handleSectionChange(sIndex, "type", newType);
                          if (
                            !sectionTypeVariants[newType].includes(
                              section.variant
                            )
                          ) {
                            handleSectionChange(
                              sIndex,
                              "variant",
                              sectionTypeVariants[newType][0]
                            );
                          }
                        }}
                      >
                        {Object.keys(sectionTypeVariants).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Variant</label>
                      <select
                        className="form-select"
                        value={
                          section.variant ||
                          sectionTypeVariants[section.type]?.[0]
                        }
                        onChange={(e) =>
                          handleSectionChange(sIndex, "variant", e.target.value)
                        }
                      >
                        {(sectionTypeVariants[section.type] || []).map(
                          (variant) => (
                            <option key={variant} value={variant}>
                              {variant}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contenu</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={section.content}
                        onChange={(e) =>
                          handleSectionChange(sIndex, "content", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Texte bouton</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Texte bouton"
                        value={section.button_text}
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "button_text",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Lien bouton</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Lien bouton"
                        value={section.button_link}
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "button_link",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Image desktop</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "image",
                            e.target.files[0]
                          )
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Image sécondaire</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "image_mobile",
                            e.target.files[0]
                          )
                        }
                      />
                    </div>

                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`sectionActive${sIndex}`}
                        checked={section.is_active}
                        onChange={(e) =>
                          handleSectionChange(
                            sIndex,
                            "is_active",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`sectionActive${sIndex}`}
                      >
                        Activer la section
                      </label>
                    </div>

                    {/* Sous-sections */}
                    <h6>Sous-sections</h6>

                    {section.subsections.map((sub, subIndex) => (
                      <div key={subIndex} className="border rounded p-3 mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="card-title m-0">
                            Sous-section {sIndex + 1}-{subIndex + 1}
                          </h5>

                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeSubsection(sIndex, subIndex)}
                              title="Supprimer sous-section"
                            >
                              <i className="fa fa-trash" />
                            </button>
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Titre *</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ex: Activité 1, Article 2, Service 3..."
                            value={sub.title}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "title",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Sous-titre</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Sous-titre"
                            value={sub.subtitle}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "subtitle",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Contenu</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={sub.content}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "content",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={sub.date || ""}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Prix (FCFA)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Ex: 5000"
                            value={sub.prix || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const prix =
                                value === "" ? null : parseFloat(value);
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "prix",
                                prix
                              );
                            }}
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Image</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "image",
                                e.target.files[0]
                              )
                            }
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">
                            Icône (Font Awesome)
                          </label>
                          <Select
                            options={faIcons}
                            placeholder="Rechercher une icone"
                            value={faIcons.find(
                              (opt) =>
                                opt.value ===
                                page.sections[sIndex].subsections[subIndex].icon
                            )}
                            onChange={(selected) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "icon",
                                selected ? selected.value : ""
                              )
                            }
                            isClearable
                            theme={customTheme}
                            formatOptionLabel={({ label, value }) => (
                              <div className="flex items-center gap-2">
                                <i className={`${value} me-2`} />
                                {label}
                              </div>
                            )}
                          />
                        </div>

                        {/* {page.sections[sIndex].subsections[subIndex].icon && (
                          <div className="mt-2 text-2xl text-primary-600">
                            Aperçu :{" "}
                            <i
                              className={`fa ${page.sections[sIndex].subsections[subIndex].icon}`}
                            />
                          </div>
                        )} */}

                        <div className="mb-2">
                          <label className="form-label">Texte bouton</label>
                          <input
                            type="text"
                            className="form-control"
                            value={sub.button_text}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "button_text",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="mb-2">
                          <label className="form-label">Lien bouton</label>
                          <input
                            type="text"
                            className="form-control"
                            value={sub.button_link}
                            onChange={(e) =>
                              handleSubsectionChange(
                                sIndex,
                                subIndex,
                                "button_link",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary m-2"
                    onClick={() => addSubsection(sIndex)}
                    title="Ajouter sous-section"
                  >
                    <i className="fa fa-plus" /> Ajouter sous section
                  </button>
                </div>
              ))}

              <div className="d-grid mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addSection}
                >
                  + Ajouter section
                </button>
              </div>

              {error && <p className="text-danger mb-3">{error}</p>}

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                  disabled={loading || !page.title || !page.template}
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
                    "Créer la page"
                  )}
                </button>
              </div>
            </>
          </div>
        </div>
      </div>

      {/* onSubmit={handleSubmit} */}

      {/* Modal de confirmation si besoin */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCancel}
        onConfirm={handleSubmit}
        title="Confirmer la création de la page"
        btnColor="primary"
        body={<p>Voulez-vous vraiment enregistrer cette page ?</p>}
      />
    </Layout>
  );
};

export default AddPage;
