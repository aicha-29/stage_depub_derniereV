import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../../assets/images/profil-default.jpeg";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../common/NotificationBell";
import { useMessaging } from '../../context/MessagingContext'; // Importez le contexte de messagerie
//import "./NotificationBell.css"; // Importez le CSS

import '../common/navbar.css';



const NavbarManager = () => {
  const { unreadCount } = useMessaging(); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [profil, setProfil] = useState({});
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProfil(res.data.data))
      .catch((err) => console.log("ERROR : ", err));
  }, []);

  const profileImageSrc =
    profil.profilePhoto && profil.profilePhoto !== "default-avatar.png"
      ? profil.profilePhoto
      : defaultPhoto;

  const handelLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

    const handleProfileClick = () => {
    navigate("/manager/profil");
  };

  return (
    <>
      {/* Bouton menu pour petits écrans */}
      <button className="toggle-button d-lg-none" onClick={toggleMenu}>
        {menuOpen ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <i className="fas fa-bars"></i>
        )}
      </button>

      {/* Barre de navigation principale */}
      <div
        className={`navbare ${menuOpen ? "menu-opene" : ""}`}
        style={{ zIndex: "100" }}
      >
        <div className="logo">
          <img src={logo} alt="logo" className="logo-entreprisee" />
        </div>
        <div className="menu">
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-home"></i>
          </NavLink>
          <NavLink
            to="/manager/projets"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-folder"></i>
          </NavLink>
          <NavLink
            to="/manager/employes"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-users"></i>
          </NavLink>
          <NavLink
            to="/manager/taches"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-list-check"></i>
          </NavLink>
          <NavLink
            to="/manager/favorites"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-star"></i>
          </NavLink>
          <NavLink
              to="/manager/messaging"
              className={({ isActive }) => (isActive ? "activee" : "not-activee")}
            >
              <div className="message-icon-container">
                <i className="fa-solid fa-envelope"></i>
                {unreadCount > 0 && (
                  <span className="message-badge">{unreadCount}</span>
                )}
              </div>
            </NavLink>
          <NavLink
          to="#"
          className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          onClick={(e) => e.preventDefault()}
        >
          <NotificationBell />
        </NavLink>
        </div>
       

        <div className="profile-sectione">
        <div className="profil-connecte text-white rounded-circle d-flex justify-content-center align-items-center"
         onClick={handleProfileClick}
        style={{ cursor: 'pointer' }}>
          <img src={profileImageSrc} alt="Profile" />
        </div>

        <div className="deconnexion text-body-secondarye">
          <button type="button" onClick={handelLogOut}>
            Déconnexion
            <i
              className="fa-solid fa-arrow-right-from-bracket"
              style={{ fontSize: "1.7rem", marginLeft: "0.8rem" }}
            ></i>
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default NavbarManager;
