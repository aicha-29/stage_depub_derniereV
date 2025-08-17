
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "../../components/admin/ProjectCard.jsx";
import FormulaireProjetUpdate from "../../components/admin/FormulaireProjetUpdate.jsx";
import { FiSearch, FiPlus } from "react-icons/fi";
import "../../index.css";
import "../../components/admin/EmployeCard.css";
import { getSocket } from "../../utils/socket";
import { toast } from "react-toastify";
import FormulaireProjet from "../../components/admin/FormulaireProjet.jsx";

const ProjetsAdmin = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    company: "",
    city: "",
    status: "active",
    startDate: "",
    employees: [],
    assignedEmployees: [],
    logo: null,
    priority: "medium",
  });

  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProjects = async () => {
    try {
      let endpoint = "http://localhost:5001/api/admin/projects/cards";
      // Si l'utilisateur est un manager, utilisez l'endpoint des employés
      if (role === "manager") {
        endpoint = "http://localhost:5001/api/employee/projects/";
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(res.data);
      setFilteredProjects(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur récupération projets :", err);
      setIsLoading(false);
    }
  };

  // Gestion des événements Socket.IO
  const handleProjectCreated = (newProject) => {
    // Vérifier si l'utilisateur est admin ou manager assigné au projet
    if (
      role === "admin" ||
      (role === "manager" &&
        newProject.assignedEmployees.some((emp) => emp._id === user._id))
    ) {
      setProjects((prev) => [...prev, newProject]);
      toast.success(`Nouveau projet "${newProject.name}" créé`);
    }
  };

  const handleProjectUpdated = (updatedProject) => {
    // Vérifier si l'utilisateur est admin ou manager assigné au projet
    if (
      role === "admin" ||
      (role === "manager" &&
        updatedProject.assignedEmployees.some((emp) => emp._id === user._id))
    ) {
      setProjects((prev) =>
        prev.map((proj) =>
          proj._id === updatedProject._id ? updatedProject : proj
        )
      );
      toast.success(`Projet "${updatedProject.name}" mis à jour`);
    }
  };

  const handleProjectDeleted = (deletedProject) => {
    // Vérifier si l'utilisateur est admin ou manager assigné au projet
    if (
      role === "admin" ||
      (role === "manager" &&
        projects.some(
          (p) =>
            p._id === deletedProject._id &&
            p.assignedEmployees.some((emp) => emp._id === user._id)
        ))
    ) {
      setProjects((prev) =>
        prev.filter((proj) => proj._id !== deletedProject._id)
      );
      toast.success(`Projet "${deletedProject.name}" supprimé`);
    }
  };

  const handleNotification = (notification) => {
    // Vérifier si la notification concerne l'utilisateur actuel
    if (notification.recipient === user._id || role === "admin") {
      toast.info(notification.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
     const userId = user?._id;
     const socket = getSocket(token, userId);

   

    socket.on("project_created", handleProjectCreated);
    socket.on("project_updated", handleProjectUpdated);
    socket.on("project_deleted", handleProjectDeleted);
    socket.on("new_notification", handleNotification);

    // Chargement initial des projets
    fetchProjects();

    return () => {
      socket.off("project_created", handleProjectCreated);
      socket.off("project_updated", handleProjectUpdated);
      socket.off("project_deleted", handleProjectDeleted);
      socket.off("new_notification", handleNotification);
    };
  }, []);

  useEffect(() => {
    let result = [...projects];

    if (filterStatus !== "all") {
      result = result.filter((project) => project.status === filterStatus);
    }

    if (filterPriority !== "all") {
      result = result.filter((project) => project.priority === filterPriority);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(term) ||
          (project.company && project.company.toLowerCase().includes(term)) ||
          (project.city && project.city.toLowerCase().includes(term))
      );
    }

    if (sortOption) {
      switch (sortOption) {
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "company":
          result.sort((a, b) => a.company.localeCompare(b.company));
          break;
        case "city":
          result.sort((a, b) => a.city.localeCompare(b.city));
          break;
        case "status":
          result.sort((a, b) => a.status.localeCompare(b.status));
          break;
        case "priority":
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          result.sort(
            (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
          );
          break;
        default:
          break;
      }
    }

    setFilteredProjects(result);
  }, [projects, searchTerm, sortOption, filterStatus, filterPriority]);

  const handleAddProjectClick = () => {
    setShowForm(true);
    setNewProject({
      name: "",
      description: "",
      company: "",
      city: "",
      status: "active",
      startDate: "",
      employees: [],
      logo: null,
      priority: "medium",
    });
    setError(null);
    setSuccess(null);
  };

  const handelEditClick = (project) => {
    setSelectedProject(project);
    setShowUpdateForm(true);
  };

  const handelEditProject = async (projectId, updatedProject) => {
    const formData = new FormData();
    Object.keys(updatedProject).forEach((key) => {
      if (key !== "logo") {
        formData.append(key, updatedProject[key]);
      }
    });
    if (updatedProject.logo instanceof File) {
      formData.append("logo", updatedProject.logo);
    }

    try {
      await axios.put(
        `http://localhost:5001/api/admin/projects/update/${projectId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Projet mis à jour avec succès !");
      setShowUpdateForm(false);
    } catch (error) {
      console.log("Erreur lors de la mise à jour du projet :", error);
      setError("Erreur lors de la mise à jour du projet.");
    }
  };

  const handelDeleteProject = async (projectId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/admin/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.log("Erreur lors de la suppression du projet :", error);
      setError("Erreur lors de la suppression du projet.");
    }
  };

  if (isLoading) {
    return <div className="projets loading">Chargement des projets...</div>;
  }

  return (
    <div className="projets">
      <div className="header-section">
        <h1 className="projet-page-title">Projets</h1>
        {role === "admin" && (
          <button
            className="add-employee-btn"
            onClick={handleAddProjectClick}
            style={{ fontSize: "1.4rem" }}
          >
            <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
            Ajouter un projet
          </button>
        )}
      </div>
      <div className="search-filter-container">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher projets par nom, entreprise ou ville"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ fontSize: "1.1rem" }}
          />
        </div>

        <div className="filter-wrapper">
          <div className="custom-select">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
              style={{ fontSize: "1.2rem" }}
            >
              <option value="all">📊 Tous statuts</option>
              <option value="active">🟢 Actif</option>
              <option value="inactive">⚪ Inactif</option>
              <option value="completed">✅ Terminé</option>
            </select>
          </div>

          <div className="custom-select">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
              style={{ fontSize: "1.2rem" }}
            >
              <option value="all">🎯 Toutes priorités</option>
              <option value="high">🔴 Haute</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="low">🟢 Basse</option>
            </select>
          </div>

          <div className="custom-select">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
              style={{ fontSize: "1.2rem" }}
            >
              <option value="">🔃 Trier par</option>
              <option value="name">Nom</option>
              <option value="company">Entreprise</option>
              <option value="city">Ville</option>
              <option value="status">Statut</option>
              <option value="priority">Priorité</option>
            </select>
          </div>
        </div>
      </div>

      <div className="project-container">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={role === "admin" ? handelDeleteProject : null}
              handelEditClick={role === "admin" ? handelEditClick : null}
            />
          ))
        ) : (
          <p className="no-projects">Aucun projet trouvé.</p>
        )}
      </div>

      {showForm && (
        <FormulaireProjet
          setShowModal={setShowForm}
          newProject={newProject}
          setNewProject={setNewProject}
          setSuccess={setSuccess}
          setError={setError}
          error={error}
          success={success}
        />
      )}
      {showUpdateForm && (
        <FormulaireProjetUpdate
          project={selectedProject}
          onEdit={handelEditProject}
          onClose={() => setShowUpdateForm(false)}
        />
      )}
    </div>
  );
};

export default ProjetsAdmin;
