import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Protected = ({ Cmp, adminOnly = false, devOnly = false }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const excludedPaths = ["/", "/logout"];
    if (excludedPaths.includes(window.location.pathname)) return;

    const userInfo = sessionStorage.getItem("user-info");
    const token = sessionStorage.getItem("token");
    const user = userInfo ? JSON.parse(userInfo) : null;

    if (!user || !token) {
      sessionStorage.clear();
      navigate("/");
      return;
    }

    const checkUserInDB = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();
        const currentUser = data.user;

        if (
          !currentUser ||
          currentUser.id !== user.id ||
          currentUser.pseudo !== user.pseudo
        ) {
          throw new Error("Invalid user data");
        }

        if (
          adminOnly &&
          currentUser.role !== "super_admin" &&
          currentUser.role !== "dev"
        ) {
          navigate("/access-denied");
          return;
        }
        if (devOnly && currentUser.role !== "dev") {
          navigate("/admin-gest/home");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        sessionStorage.clear();
        navigate("/");
      }
    };

    checkUserInDB();
  }, [adminOnly, devOnly, navigate]);

  return <>{isAuthorized ? <Cmp /> : null}</>;
};

export default Protected;
