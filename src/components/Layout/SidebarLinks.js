import React from "react";
import { Link, useLocation } from "react-router-dom";

const SidebarLinks = ({ user }) => {
  const location = useLocation();
  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const hasRole = (allowedRoles) => allowedRoles.includes(user?.role);

  return (
    <div className="navbar-nav w-100">
      {hasRole(["super_admin"]) && (
        <>
          <Link
            to="/admin-gest/home"
            className={`nav-item nav-link ${
              isActive("/admin-gest/home")
                ? "active bg-body-secondary fw-bold"
                : ""
            }`}
          >
            <div>
              <i className="fa fa-home me-2"></i>
              <span className="text-body">Dashboard</span>
            </div>
          </Link>

          <Link
            to="/admin-gest/utilisateurs"
            className={`nav-link d-flex align-items-center ${
              isActive("/admin-gest/utilisateurs")
                ? "active bg-body-secondary fw-bold"
                : ""
            }`}
          >
            <i className="fa fa-users me-2"></i>
            <span className="text-body">Utilisateurs</span>
          </Link>
        </>
      )}
      <>
        <hr />
        <h6 className="text-uppercase text-muted ps-3 mt-3">Contenu du site</h6>

        <Link
          to="/admin-gest/pages"
          className={`nav-link d-flex align-items-center ${
            isActive("/admin-gest/pages")
              ? "active bg-body-secondary fw-bold"
              : ""
          }`}
        >
          <i className="fa fa-file me-2"></i>
          <span className="text-body">Pages</span>
        </Link>

        <Link
          to="/admin-gest/settings"
          className={`nav-link d-flex align-items-center ${
            isActive("/admin-gest/settings")
              ? "active bg-body-secondary fw-bold"
              : ""
          }`}
        >
          <i className="fa fa-cog me-2"></i>
          <span className="text-body">
            Infos <br /> Générales
          </span>
        </Link>
      </>
    </div>
  );
};

export default SidebarLinks;
