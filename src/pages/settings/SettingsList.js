import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Loader from "../../components/Layout/Loader"; // Composant pour le loader

const Parametres = () => {
  const [settings, setSettings] = useState({});
  const [initialSettings, setInitialSettings] = useState({});
  //   const [activeFields, setActiveFields] = useState({});
  const [error, setError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  //   const timersRef = useRef({});

  // 🔃 Charger les paramètres existants
  useEffect(() => {
    const fetchSettings = async () => {
      setLoad(true);
      try {
        const res = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/settings`
        );
        const data = await res.json();
        // Convertir en objet clé => valeur
        const formatted = {};
        data.forEach((item) => {
          formatted[item.key] = item;
        });

        setSettings(formatted);
        // console.log(data);

        setInitialSettings(formatted);
      } catch (err) {
        setError("Erreur lors du chargement des paramètres.");
      } finally {
        setLoad(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => {
      // Si c'est un fichier, on stocke dans .file et on garde .value pour l'affichage
      if (value instanceof File) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            file: value, // nouveau fichier sélectionné
          },
        };
      }
      // Sinon, texte classique
      return {
        ...prev,
        [field]: {
          ...prev[field],
          value: value,
          file: undefined, // on retire le fichier si on repasse en texte
        },
      };
    });
  };

  const hasChanges = () =>
    Object.keys(settings).some((key) => {
      const s = settings[key];
      const i = initialSettings[key];
      // Si fichier changé
      if (s.file) return true;
      // Si texte changé
      return s.value !== i.value;
    });

  const handleSubmit = async () => {
    if (!hasChanges()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setUpdateSuccess(null);

    const formData = new FormData();

    Object.entries(settings).forEach(([key, setting]) => {
      if (setting.file) {
        formData.append(`${key}_type`, "file");
        formData.append(key, setting.file);
      } else {
        formData.append(`${key}_type`, "text");
        formData.append(key, setting.value || "");
      }
    });

    try {
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/settings`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Erreur serveur");

      setUpdateSuccess("Mis a jour effectuée !");
      // On retire les .file après update
      const newSettings = {};
      Object.entries(settings).forEach(([key, s]) => {
        newSettings[key] = { ...s };
        delete newSettings[key].file;
      });
      setInitialSettings(newSettings);
      setSettings(newSettings);
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const groupedSettings = Object.values(settings).reduce((acc, setting) => {
    const cat = setting.categorie || "autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(setting);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="container mt-4">
        {load ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            <h1 className="mb-4">Paramètres globaux</h1>

            {error && (
              <ToastMessage message={error} onClose={() => setError(null)} />
            )}
            {success && (
              <ToastMessage
                message={addSuccess || updateSuccess}
                onClose={() => {
                  setSuccess(false);
                  setAddSuccess(null);
                  setUpdateSuccess(null);
                }}
                success={true}
              />
            )}

            <div className="row">
              {Object.entries(groupedSettings).map(([categorie, items]) => (
                <div key={categorie}>
                  <h5 className="mb-3 text-uppercase text-primary">
                    {categorie}
                  </h5>
                  <div className="row">
                    {items.map((setting) => (
                      <div className="col-md-6 mb-4" key={setting.key}>
                        <label className="form-label text-capitalize">
                          {setting.key.replace(/_/g, " ")}
                        </label>

                        {setting.type === "file" ? (
                          <div>
                            {setting.value?.startsWith("settings/") && (
                              <div className="border rounded p-2 bg-body mb-2 d-flex justify-content-center">
                                <img
                                  src={`${process.env.REACT_APP_API_BASE_URL_STORAGE}/${setting.value}`}
                                  alt={setting.key}
                                  style={{
                                    maxWidth: "100%",
                                    height: 250,
                                    objectFit: "contain",
                                  }}
                                />
                              </div>
                            )}
                            {setting.file && (
                              <div className="mb-2">
                                <span className="badge bg-info">
                                  {setting.file.name}
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) =>
                                handleChange(setting.key, e.target.files[0])
                              }
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={setting.value || ""}
                            onChange={(e) =>
                              handleChange(setting.key, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <hr />

            <div className="text-end mt-4">
              <button
                className="btn btn-primary"
                disabled={!hasChanges() || loading}
                onClick={handleSubmit}
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
                  "Enregistrer"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Parametres;
