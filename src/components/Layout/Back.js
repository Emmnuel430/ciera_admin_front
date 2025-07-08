import React from "react";
import { useNavigate } from "react-router-dom";

const Back = ({ children }) => {
  // Hook pour gérer la navigation entre les pages.
  const navigate = useNavigate();
  function back() {
    navigate(`/${children}`);
  }
  return (
    <div>
      <button onClick={back} className="btn btn-primary">
        {" "}
        <span className="d-none d-sm-inline">⬅ Retour</span>
        <span className="d-inline d-sm-none">⬅</span>
      </button>
    </div>
  );
};

export default Back;
