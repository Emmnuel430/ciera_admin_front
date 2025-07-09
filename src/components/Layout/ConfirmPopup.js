import React, { useState } from "react";

const ConfirmPopup = ({
  show,
  onClose,
  onConfirm,
  title,
  body,
  btnColor = "danger",
  confirmText = "Confirmer",
  cancelText = "Annuler",
}) => {
  const [loading, setLoading] = useState(false); // État de chargement

  const handleConfirm = async () => {
    setLoading(true); // Active le spinner
    try {
      await onConfirm(); // Exécute la fonction de confirmation passée en paramètre
    } catch (error) {
      console.error("Error during confirmation:", error);
    } finally {
      setLoading(false); // Désactive le spinner après l'action
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden={!show}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header justify-content-between">
            <h5 className="modal-title" id="exampleModalLongTitle">
              {title}
            </h5>
            <button className="close btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">{body}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading} // Désactive le bouton "Annuler" pendant le chargement
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={"btn btn-" + btnColor || "danger"}
              onClick={handleConfirm}
              disabled={loading} // Désactive le bouton "Confirmer" pendant le chargement
            >
              {loading ? (
                <span>
                  <i className="fas fa-spinner fa-spin"></i> Chargement...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
