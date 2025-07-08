import React from "react";
import { Link } from "react-router-dom";

const HeaderWithFilter = ({
  title,
  title2,
  link,
  linkText,
  linkText2,
  filter,
  setFilter,
  filterOptions = [],
  main,
  onLinkClick,
  sortOption, // Option de tri sélectionnée
  setSortOption, // Fonction pour modifier le tri
  dataList, // Liste à trier (générique)
  setSortedList, // Fonction pour mettre à jour la liste triée
  alphaField,
  dateField,
}) => {
  React.useEffect(() => {
    const sortDataList = () => {
      if (!Array.isArray(dataList)) return; // ✅ vérification clé
      if (!dataList) return; // Si la liste est vide, on ne fait rien

      let sorted = [...dataList];

      if (!sortOption) {
        // Si aucun tri n'est sélectionné, on affiche toute la liste originale
        setSortedList(dataList);
        return;
      }

      if (sortOption === "alpha" && alphaField) {
        sorted.sort((a, b) =>
          (a[alphaField] || "").localeCompare(b[alphaField] || "")
        );
      } else if (
        ["date_auj", "date_semaine", "date_mois", "date_annee"].includes(
          sortOption
        )
      ) {
        const today = new Date();
        sorted = sorted.filter((item) => {
          const itemDate = new Date(item[dateField]);
          if (isNaN(itemDate)) return false;

          switch (sortOption) {
            case "date_auj":
              return itemDate.toDateString() === today.toDateString();
            case "date_semaine":
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(today.getDate() - 7);
              return itemDate >= oneWeekAgo && itemDate <= today;
            case "date_mois":
              return (
                itemDate.getMonth() === today.getMonth() &&
                itemDate.getFullYear() === today.getFullYear()
              );
            case "date_annee":
              return itemDate.getFullYear() === today.getFullYear();
            default:
              return true;
          }
        });
      }

      setSortedList(sorted);
    };

    sortDataList();
  }, [sortOption, dataList, alphaField, dateField, setSortedList]);

  return (
    <div>
      {/* Titre et liens */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {(title || title2) && (
          <div>
            {title ? (
              <h1>Liste des {title}</h1>
            ) : title2 ? (
              <h1>{title2}</h1>
            ) : null}
          </div>
        )}
        <div>
          {linkText && (
            <Link to={link} className="btn btn-primary me-2">
              <span className="d-none d-sm-inline">{linkText}</span>
              <span className="d-inline d-sm-none">+</span>
            </Link>
          )}
          {onLinkClick && (
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                if (onLinkClick) onLinkClick();
              }}
            >
              <span className="d-none d-sm-inline">{linkText2}</span>
              <span className="d-inline d-sm-none">+</span>
            </button>
          )}
        </div>
      </div>

      {/* Total et filtre */}
      {(main || filterOptions.length > 0) && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            {main && (
              <h5>
                Total {title} :
                <span className="d-inline-block w-100 text-center">
                  <strong>{main}</strong>
                </span>
              </h5>
            )}
          </div>
          <div>
            {filterOptions.length > 0 && (
              <select
                className="form-select"
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Tri */}
      {setSortOption && Array.isArray(dataList) && dataList.length > 0 && (
        <div className="d-flex justify-content-end align-items-center mb-4">
          <div>
            <label htmlFor="sort" className="me-2">
              Trier par :
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="form-select form-select-sm d-inline-block w-auto"
            >
              <option value="">Aucun</option>
              {alphaField && <option value="alpha">Ordre alphabétique</option>}
              <option value="date_auj">Créé aujourd'hui</option>
              <option value="date_semaine">Créé cette semaine</option>
              <option value="date_mois">Créé ce mois-ci</option>
              <option value="date_annee">Créé cette année</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderWithFilter;
