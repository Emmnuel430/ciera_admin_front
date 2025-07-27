import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { Modal, Button } from "react-bootstrap";

export const CalendarView = ({ rdvs, onDeleteRequest }) => {
  const [selectedRdv, setSelectedRdv] = useState(null);
  const events = rdvs.map((rdv) => ({
    id: rdv.id.toString(), // toujours string pour FullCalendar
    title: `${rdv.client_nom} ${rdv.client_prenom} - ${rdv.immat}`,
    start: rdv.date_prise_rdv,
    allDay: false,
  }));

  const handleEventClick = (info) => {
    const clickedRdv = rdvs.find((r) => r.id.toString() === info.event.id);
    if (clickedRdv) {
      setSelectedRdv(clickedRdv);
    }
  };

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

  const prestationsDemandées = selectedRdv
    ? prestations.filter((item) => selectedRdv[item.key] === 1)
    : [];

  const isDark = document.body.getAttribute("data-bs-theme") === "dark";

  return (
    <div className="p-4">
      <FullCalendar
        themeSystem="standard"
        className={isDark ? "fc-dark" : "fc-light"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={frLocale}
        initialView="dayGridMonth"
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
      />

      {selectedRdv && (
        <Modal show onHide={() => setSelectedRdv(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Détails du rendez-vous</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-center">
              <strong>Centre :</strong> {selectedRdv.centre}
            </p>
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
                <strong>Derniere vidange il y a :</strong>{" "}
                {selectedRdv.vidange_km} km
              </p>
            )}
            {selectedRdv.revision === 1 && selectedRdv.revision_km && (
              <p>
                <strong>Derniere révision il y a :</strong>{" "}
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
