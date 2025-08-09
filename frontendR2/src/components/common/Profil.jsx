import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";
import defaultPhoto from "../../assets/images/profil-default.jpeg";
import axios from "axios";
import { getSocket } from "../../utils/socket";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profil = () => {
  const [profil, setProfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfil(res.data.data);
        setIsLoading(false);
        //toast.success("Profil chargé avec succès");
      } catch (err) {
        console.log("erreur ", err);
        toast.error("Erreur lors du chargement du profil");
        navigate("/login");
      }
    };

    fetchProfile();

    // Initialiser la connexion Socket.IO
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    const socket = getSocket(token, userId);

    // Écouter les mises à jour de profil
    socket.on('employee_updated', (updatedProfile) => {
      setProfil(updatedProfile);
      toast.info("Votre profil a été mis à jour");
    });

    return () => {
      socket.off('employee_updated');
    };
  }, [navigate]);

  if (isLoading || !profil) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="profil-container">
      <div className="background"></div>

      <div className="profil-card" style={{ zIndex: "1" }}>
        <div className="profil-top">
          <img
            className="profil-photo"
            src={profil.profilePhoto ? profil.profilePhoto : defaultPhoto}
            alt="Profil"
          />
          <h1 className="profil-name">{profil.name}</h1>
          <p className="profil-position">{profil.position}</p>
        </div>

        <div className="profil-details">
          <p>
            <strong>Nom :</strong> {profil.name}
          </p>
          <p>
            <strong>Rôle :</strong> {profil.role}
          </p>
          <p>
            <strong>Position :</strong> {profil.position}
          </p>
          <p>
            <strong>Email :</strong> {profil.email}
          </p>
          <p>
            <strong>CIN :</strong> {profil.cin}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profil;