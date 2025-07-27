import React, { useState } from "react";
import { CalendarView } from "./FullCalendar";
import { Modal, Button } from "react-bootstrap";

const prestations = [
  { key: "pneus", label: "Pneus" },
  { key: "amortisseurs", label: "Amortisseurs" },
  { key: "vidange", label: "Vidange" },
  { key: "distribution", label: "Distribution" },
  { key: "revision", label: "Révision" },
  { key: "climatisation", label: "Climatisation" },
  { key: "freinage", label: "Freinage" },
  { key: "echappement", label: "Échappement" },
  { key: "autres", label: "Autres" },
];

export const PlanningView = ({ events, onDeleteRequest }) => {
  const [selectedRdv, setSelectedRdv] = useState(null);

  // Groupement par date
  const grouped = events.reduce((acc, event) => {
    const date = new Date(event.date_prise_rdv);
    const label = date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const key = date.toISOString().split("T")[0];
    if (!acc[key]) acc[key] = { label, events: [] };
    acc[key].events.push(event);
    return acc;
  }, {});

  // Trie les dates du plus récent au plus ancien
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Prestations demandées pour le RDV sélectionné
  const prestationsDemandées = selectedRdv
    ? prestations.filter((item) => selectedRdv[item.key] === 1)
    : [];

  return (
    <div className="p-4">
      {sortedDates.map((dateKey) => {
        const { label, events: eventsOfDay } = grouped[dateKey];
        return (
          <div key={dateKey} className="mb-4">
            <h5 className="text-primary text-capitalize">{label}</h5>
            <ul className="list-group">
              {eventsOfDay.map((event) => (
                <li
                  key={event.id}
                  className="list-group-item d-flex justify-content-between align-items-start flex-column"
                >
                  <div>
                    <strong>
                      {event.client_nom} {event.client_prenom} (
                      {event.client_tel})
                    </strong>
                  </div>
                  <div className="text-muted">
                    ({event.immat}) {event.marque} {event.modele}
                  </div>
                  <div className="mt-1">
                    Heure :{" "}
                    {new Date(event.date_prise_rdv).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  <div className="mt-2 align-self-end d-flex gap-2">
                    <button
                      className="btn btn-sm btn-info"
                      title="Voir détails"
                      onClick={() => setSelectedRdv(event)}
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Supprimer"
                      onClick={() => onDeleteRequest && onDeleteRequest(event)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Modal détails RDV */}
      {selectedRdv && (
        <Modal show onHide={() => setSelectedRdv(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Détails du rendez-vous</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Nom :</strong> {selectedRdv.client_nom}
            </p>
            <p>
              <strong>Prénom :</strong> {selectedRdv.client_prenom}
            </p>
            <p>
              <strong>Téléphone :</strong> {selectedRdv.client_tel}
            </p>
            <p>
              <strong>Email :</strong> {selectedRdv.client_email}
            </p>
            <p>
              <strong>Immatriculation :</strong> {selectedRdv.immat}
            </p>
            <p>
              <strong>Marque :</strong> {selectedRdv.marque}
            </p>
            <p>
              <strong>Modèle :</strong> {selectedRdv.modele}
            </p>
            <p>
              <strong>Date mise en circulation :</strong>{" "}
              {selectedRdv.premiere_mise_en_circulation}
            </p>
            <p>
              <strong>Kilométrage :</strong> {selectedRdv.kilometrage} km
            </p>
            <p>
              <strong>Date du RDV :</strong>{" "}
              {new Date(selectedRdv.date_prise_rdv).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {prestationsDemandées.length > 0 && (
              <>
                <p>
                  <strong>Prestations demandées :</strong>
                </p>
                <ul>
                  {prestationsDemandées.map((item) => (
                    <li key={item.key}>{item.label}</li>
                  ))}
                </ul>
              </>
            )}

            {selectedRdv.vidange === 1 && selectedRdv.vidange_km && (
              <p>
                <strong>Dernière vidange il y a :</strong>{" "}
                {selectedRdv.vidange_km} km
              </p>
            )}
            {selectedRdv.revision === 1 && selectedRdv.revision_km && (
              <p>
                <strong>Dernière révision il y a :</strong>{" "}
                {selectedRdv.revision_km} km
              </p>
            )}
            {selectedRdv.autres === 1 && selectedRdv.autres_details && (
              <p>
                <strong>Détails autres :</strong> {selectedRdv.autres_details}
              </p>
            )}
            {selectedRdv.commentaires && (
              <p>
                <strong>Commentaires :</strong> {selectedRdv.commentaires}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={() => {
                setSelectedRdv(null);
                onDeleteRequest(selectedRdv);
              }}
            >
              Supprimer
            </Button>
            <Button variant="secondary" onClick={() => setSelectedRdv(null)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default function RdvContainer({ filteredPage, handleOpenModal }) {
  const [view, setView] = useState("calendar"); // 'calendar' ou 'planning'

  return (
    <>
      <div className="mb-3">
        <button
          className={`btn me-2 ${
            view === "calendar" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setView("calendar")}
        >
          Vue Calendrier
        </button>
        <button
          className={`btn ${
            view === "planning" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setView("planning")}
        >
          Vue Planning
        </button>
      </div>

      {view === "calendar" ? (
        <CalendarView rdvs={filteredPage} onDeleteRequest={handleOpenModal} />
      ) : (
        <PlanningView events={filteredPage} onDeleteRequest={handleOpenModal} />
      )}
    </>
  );
}
