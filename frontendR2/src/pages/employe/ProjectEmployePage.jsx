import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import ProjectEmployeCard from "../../components/employe/ProjectEmployeCard";
import "../../index.css";
import "../../components/admin/EmployeCard.css";
import { FiSearch } from "react-icons/fi";
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';

const ProjectEmployePage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
     const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;
    // Configuration Socket.IO
    const socket = getSocket(token, userId);

    

    // Gestionnaires d'événements
    const handleProjectCreated = (projectWithUrls) => {
      setProjects(prev => [...prev, projectWithUrls]);
      toast.success(`Nouveau projet "${projectWithUrls.name}" créé`);
    };

    const handleProjectUpdated = (updatedProject) => {
      setProjects(prev => 
        prev.map(proj => 
          proj._id === updatedProject._id ? updatedProject : proj
        )
      );
      toast.success(`Projet "${updatedProject.name}" mis à jour`);
    }; 

    const handleProjectDeleted = (deletedProject) => {
      setProjects(prev => prev.filter(proj => proj._id !== deletedProject._id));
      toast.success(`Projet "${deletedProject.name}" supprimé`);
    };

    const handleNotification = (notification) => {
      toast.info(notification.message);
    };

  

    // Écouteurs d'événements
    socket.on('project_created', handleProjectCreated);
    socket.on('project_updated', handleProjectUpdated);
    socket.on('project_deleted', handleProjectDeleted);
    socket.on('new_notification', handleNotification);

    // Chargement initial des projets
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/employee/projects/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(res.data);
        setFilteredProjects(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur récupération projets :", err);
        setIsLoading(false);
      }
    };

    fetchData();

    // Nettoyage
    return () => {
      socket.off('project_created', handleProjectCreated);
      socket.off('project_updated', handleProjectUpdated);
      socket.off('project_deleted', handleProjectDeleted);
      socket.off('new_notification', handleNotification);
      
    };
  }, []);

  useEffect(() => {
    let result = [...projects];

    // Filtrage par statut
    if (filterStatus !== "all") {
      result = result.filter((project) => project.status === filterStatus);
    }

    // Filtrage par priorité
    if (filterPriority !== "all") {
      result = result.filter((project) => project.priority === filterPriority);
    }

    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(term) ||
          (project.company && project.company.toLowerCase().includes(term)) ||
          (project.city && project.city.toLowerCase().includes(term))
      );
    }

    // Tri
    if (sortOption) {
      switch (sortOption) {
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "company":
          result.sort((a, b) => a.company?.localeCompare(b.company));
          break;
        case "city":
          result.sort((a, b) => a.city?.localeCompare(b.city));
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

  if (isLoading) {
    return <div className="projets loading">Chargement des projets...</div>;
  }

  return (
    <div className="projets">
      <div className="header-section">
        <h1 className="projet-page-title">Projets</h1>
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
            <ProjectEmployeCard key={project._id} project={project} />
          ))
        ) : (
          <p className="no-projects">Aucun projet trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectEmployePage;