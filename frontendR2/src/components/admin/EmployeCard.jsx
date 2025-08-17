import React, { useState, useEffect } from "react";
import "./EmployeCard.css";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { FiTrash2, FiEdit, FiBarChart2 } from "react-icons/fi";
import EmployeUpdate from "./EmployeUpdate";
import defaultProject from "../../assets/images/project-default.jpg";
import axios from "axios";

const EmployeCard = ({
  employe,
  onClick,
  onDelete,
  onUpdate,
  onShowDashboard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const fetchRole = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRole(res.data.data.role);
    } catch (error) {
      console.log("erreur lors de la récuppération du role", error);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick(employe);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDashboardClick = (e) => {
    e.stopPropagation();
    if (onShowDashboard) {
      onShowDashboard(employe);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await onUpdate(id, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  return (
    <>
      <div
        className="employe-card"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <button
            className="dashboard-button"
            onClick={handleDashboardClick}
            title="Voir le dashboard"
          >
            <FiBarChart2 />
          </button>
        )}

        {role == "admin" && (
          <div className="employe-actions">
            <button style={{ border: "none" }} onClick={handleEditClick}>
              <FiEdit className="edit-icon" title="Modifier" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(), onDelete(employe._id);
              }}
              style={{ border: "none" }}
            >
              <FiTrash2 className="delete-icon" title="Supprimer" />
            </button>
          </div>
        )}

        <div className="employe-avatar">
          {employe.profilePhoto ? (
            <img
              src={employe.profilePhoto}
              alt={`profile de ${employe.name}`}
            />
          ) : (
            <img src={defaultAvatar} alt="Avatar par défaut" />
          )}
        </div>
        <h3 className="employe-name">{employe.name}</h3>
        <p className="employe-position">{employe.position}</p>

        {employe.projects && employe.projects.length > 0 && (
          <div className="employe-projects">
            <div className="project-logos">
              {employe.projects.map((project) =>
                project.logo ? (
                  <img
                    key={project._id}
                    src={project.logo}
                    alt={`Logo ${project.name}`}
                    className="project-logo"
                    title={project.name}
                  />
                ) : (
                  <img
                    src={defaultProject}
                    alt="Logo par défaut"
                    className="project-logo"
                    title="Logo par défaut"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <EmployeUpdate
          employe={employe}
          onUpdate={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default EmployeCard;
