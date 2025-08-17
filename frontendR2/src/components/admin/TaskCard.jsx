import {
  FaTag,
  FaBatteryThreeQuarters,
  FaMapMarkerAlt,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { MdAccessTime } from "react-icons/md";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./TaskCard.css";
import defaultProjectLogo from "../../assets/images/project-default.jpg";
import defaultProfil from "../../assets/images/profil-default.jpeg";

const TaskCard = ({ tasks, handelDelete, onEditTask }) => {
  const [localTasks, setLocalTasks] = useState([]);
  const [role, setRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [loadingTaskIds, setLoadingTaskIds] = useState([]);
<<<<<<< HEAD
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = res.data.data;
        setRole(data.role);
        setCurrentUserId(data._id);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle :", error);
      }
    };
    fetchRole();
  }, []);

  const toggleFavorite = async (taskId) => {
    // Désactive le bouton pour cette tâche
    setLoadingTaskIds((prev) => [...prev, taskId]);

    const toastId = toast.loading("Traitement en cours...", {
      className: "toast-costum",
    });
    try {
      const response = await axios.post(
        `http://localhost:5001/api/employee/tasks/${taskId}/toggle-favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedTasks = localTasks.map((task) =>
        task._id === taskId ? { ...task, isFavorite: !task.isFavorite } : task
      );
      setLocalTasks(updatedTasks);

      toast.update(toastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2500,

        className: "toast-costum",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Une erreur est survenue.";
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        className: "toast-costum",
      });
    } finally {
      // Réactive le bouton
      setLoadingTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const handelDeleteClick = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer la tâche ?")) {
      handelDelete(id);
    }
  };

  return (
    <div className="task-cards-container">
      {localTasks.map((task) => {
        const isFavoriting = loadingTaskIds.includes(task._id);
        return (
          <div
            key={task._id}
            className={`task-card ${task.status?.status} priority-${task.project?.priority}`}
          >
            <div className="task-card-header">
              <div className="project-info">
                <img
<<<<<<< HEAD
                src={
                 task.project.logo
                ? `http://localhost:5001/public/${task.project.logo}`
                : defaultProjectLogo
                }
=======
                  src={task.project.logo || defaultProjectLogo}
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
                  alt="logo"
                  className="project-logo"
                />
                <div>
                  <h3 className="project-name">{task.project?.name}</h3>
                  <span className="company-name">{task.project?.company}</span>
                </div>
              </div>
              <button
                type="button"
                style={{
                  cursor: isFavoriting ? "not-allowed" : "pointer",
                  border: "none",
                  backgroundColor: "transparent",
<<<<<<< HEAD
                   display: task.assignedTo?._id === userId? "block" : "none", 
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
                }}
                disabled={isFavoriting}
                onClick={() => {
                  if (
                    task.assignedTo &&
                    task.assignedTo._id === currentUserId
                  ) {
                    toggleFavorite(task._id);
                  } else {
                    toast.error(
                      "Seul l'employé assigné peut favoriser cette tâche.",
                      { className: "toast-costum" }
                    );
                  }
                }}
              >
                {task.isFavorite ? (
                  <FaStar
                    size={18}
                    style={{ marginRight: "3rem", color: "gold" }}
                  />
                ) : (
                  <FaRegStar
                    size={18}
                    style={{ marginRight: "3rem", color: "gray" }}
                  />
                )}
              </button>
              <div className="task-header-right">
                <div className={`task-priority ${task.project?.priority}`}>
                  {task.project?.priority?.toUpperCase()}
                </div>
                {task.intervention === "on_site" && (
                  <>
                    <FaMapMarkerAlt className="intervention-icon" size={16} />
                    <span className="intervention-on-site">sur site</span>
                  </>
                )}
                {task.intervention === "remote" && (
                  <>
                    <span className="intervention-remote">🏠</span>
                    <span className="intervention-remote">à distance</span>
                  </>
                )}
              </div>
            </div>

            <div className="task-card-body">
              <div className="task-title-wrapper">
                <h4 className="task-title">{task.title}</h4>
                <div className="tasks-actions">
                  <FiEdit
                    className="edit-icon-task"
                    title="Modifier"
                    onClick={() => onEditTask(task)}
                  />
                  <FiTrash2
                    className="delete-icon-task"
                    title="Supprimer"
                    onClick={() => handelDeleteClick(task._id)}
                  />
                </div>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <div className="meta-item">
                  Crée à : <span>{formatDate(task.createdAt)}</span>
                </div>
                <div className="meta-item">
                  Mis à jour le : <span>{formatDate(task.updatedAt)}</span>
                </div>
                <div className="meta-item">
                  <FaTag className="meta-icon" />
                  <span>{task.type}</span>
                </div>
                <div className="meta-item">
                  <FaBatteryThreeQuarters className="meta-icon" />
                  <span>{task.progress}%</span>
                </div>
                {task.type === "long" && (
                  <div className="meta-item">
                    <MdAccessTime className="meta-icon" />
                    <span>DeadLine : {formatDate(task.deadline)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="task-card-footer">
              {task.assignedTo && (
                <div className="assigned-user">
                  <img
<<<<<<< HEAD
                    src={task.assignedTo.profilePhoto?
                      `http://localhost:5001/public/${task.assignedTo.profilePhoto}`:defaultProfil
                    }
=======
                    src={task.assignedTo.profilePhoto || defaultProfil}
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
                    alt={task.assignedTo.name}
                    className="user-avatar"
                  />
                  <div>
                    <span className="user-name">{task.assignedTo.name}</span>
                    <span className="user-position">
                      {task.assignedTo.position}
                    </span>
                  </div>
                </div>
              )}
              <div className={`task-status ${task.status}`}>
                {task.status?.toUpperCase()}
              </div>
            </div>

            <div
              className="task-progress-bar"
              style={{ width: `${task.project?.progression || 0}%` }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskCard;
