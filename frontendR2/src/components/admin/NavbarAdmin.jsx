import React, { useEffect, useState } from "react";
import logo from "../../assets/images/logo.png";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import defaultPhoto from "../../assets/images/profil-default.jpeg";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import NotificationBell from '../common/NotificationBell';
import '../common/navbar.css'
import { useMessaging } from '../../context/MessagingContext';

const NavbarAdmin = () => {
  const { unreadCount, conversations } = useMessaging();
=======
import NotificationBell from '../common/NotificationBell'; // Assurez-vous que le chemin est correct
import '../common/navbar.css'

const NavbarAdmin = () => {
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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

<<<<<<< HEAD
  useEffect(() => {
    console.log("Current unreadCount:", unreadCount);
    console.log("Conversations:", conversations);
  }, [unreadCount, conversations])

=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  const profileImageSrc =
    profil.profilePhoto && profil.profilePhoto !== "default-avatar.png"
      ? profil.profilePhoto
      : defaultPhoto;

  const handelLogOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

<<<<<<< HEAD
  const handleProfileClick = () => {
    navigate("/admin/profil");
  };

=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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
        <div className="logoe">
          <img src={logo} alt="logoe" className="logo-entreprisee" />
        </div>
        <div className="menue">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-home"></i>
          </NavLink>
          <NavLink
            to="/admin/projets"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-folder"></i>
          </NavLink>
          <NavLink
            to="/admin/taches"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-list-check"></i>
          </NavLink>
          <NavLink
            to="/admin/employes"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-users"></i>
          </NavLink>
<<<<<<< HEAD
          <NavLink
            to="/admin/messaging"
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
          <div 
            className="profil-connecte text-white rounded-circle d-flex justify-content-center align-items-center"
            onClick={handleProfileClick}
            style={{ cursor: 'pointer' }}
          >
=======
        
          <NavLink
            to="/admin/profil"
            className={({ isActive }) => (isActive ? "activee" : "not-activee")}
          >
            <i className="fa-solid fa-address-card"></i>
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
          <div className="profil-connecte text-white rounded-circle d-flex justify-content-center align-items-center">
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
            <img src={profileImageSrc} alt="Profile" />
          </div>

          <div className="deconnexion text-body-secondarye">
            <button type="button" onClick={handelLogOut}>
              Déconnexion{" "}
              <i
                className="fa-solid fa-arrow-right-from-bracket"
                style={{ fontSize: "1.7rem", marginLeft: "0.8rem" }}
              ></i>
            </button>
          </div>
        </div>
<<<<<<< HEAD
      </div>
=======
        </div>
      
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    </>
  );
};

export default NavbarAdmin;