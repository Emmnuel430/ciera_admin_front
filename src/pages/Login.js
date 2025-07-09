import React, { useState, useEffect } from "react";
import "../assets/css/Login.css";
import loginImage from "../assets/img/login.png";
import logo from "../assets/img/logo.png";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const Login = () => {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // État pour gérer les messages d'erreur
  const [loading, setLoading] = useState(false); // État pour indiquer le chargement
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("user-info")) {
      navigate("/admin-gest/home"); // Redirige si l'utilisateur est déjà connecté
    }
  }, [navigate]);

  async function login(e) {
    e.preventDefault(); // Empêche le rafraîchissement de la page
    // Validation des entrées utilisateur
    if (!pseudo || !password) {
      setError("Le pseudo et le mot de passe sont réquis");
      return;
    }

    setError(""); // Réinitialise les erreurs si les validations passent
    setLoading(true); // Active l'état de chargement

    // Appel à l'API pour tenter la connexion
    try {
      let item = { pseudo, password };
      // 1) Récupérer le cookie CSRF (obligatoire pour Sanctum)
      // await fetch(`${process.env.REACT_APP_API_URL}/sanctum/csrf-cookie`, {
      //   credentials: "include",
      // });

      let result = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Important pour envoyer cookie avec la requête
        body: JSON.stringify(item),
      });

      result = await result.json();

      // Gère une réponse d'erreur de l'API
      if (result.error) {
        setError(result.error); // Affiche un message d'erreur provenant de l'API
        setLoading(false); // Désactive l'état de chargement
        return;
      }

      // Stocke les informations utilisateur si la connexion réussit
      sessionStorage.setItem("user-info", JSON.stringify(result.user));
      sessionStorage.setItem("token", result.token);

      setLoading(false); // Désactive l'état de chargement
      navigate("/admin-gest/home");
    } catch (e) {
      setError("Une erreur inatendue s'est produite. Réessayez");
      setLoading(false); // Désactive l'état de chargement
    }
  }
  return (
    <div>
      <section>
        <div className="container">
          <div className="user signinBx">
            <div className="imgBx bg-body">
              <img src={loginImage} alt="Login Illustration" />
            </div>
            <div className="formBx bg-body">
              {error && <p>{error}</p>}
              <img src={logo} alt="Logo" />
              <form onSubmit={login}>
                <h2 className="h2 text-primary">Connexion</h2>
                <label htmlFor="Pseudo">Pseudo</label>
                <input
                  type="text"
                  placeholder="Pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                />
                <br />
                <br />
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Mot de Passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="d-flex align-items-center mt-3">
                  <input
                    type="submit"
                    className="btn btn-primary m-0"
                    value={loading ? "Connexion ..." : "Connexion"}
                    disabled={loading}
                  />
                  &nbsp;&nbsp;
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="my-auto"
                      />
                    </>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
