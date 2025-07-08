import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-body px-3">
      <div className="container bg-body p-4 p-md-5 rounded-4 shadow border border-warning">
        <div className="row flex-column-reverse flex-md-row align-items-center">
          {/* Texte */}
          <div className="col-md-6 text-center text-md-start mt-4 mt-md-0">
            <h1 className="h2 fw-bold text-warning mb-3">Accès refusé</h1>
            <p className="text-muted mb-4">
              Vous n’avez pas les droits pour accéder à cette page. Veuillez
              contacter un administrateur si besoin.
            </p>
            <button
              onClick={() => navigate("/mot")}
              className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
            >
              Retour à l’accueil
            </button>
          </div>

          {/* Image */}
          <div className="col-md-6 text-center">
            <img
              src="/access-denied.png"
              alt="Access Denied"
              className="img-fluid mb-3 mb-md-0"
              style={{ maxWidth: "300px", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
