import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../pages/admin/TaskAddForm.module.css";
import { FiX } from "react-icons/fi";
const initialState = {
  title: "",
  description: "",
  type: "daily",
  status: "pending",
  projectId: null,
  assignedToId: null,
  progress: 0,
  intervention: "on_site",
};
<<<<<<< HEAD
 const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
const TaskEmployeForm = ({ onTaskAdded, onClose }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    type: "daily",
    status: "pending",
    projectId: null,
    assignedToId: null,
    progress: 0,
    intervention: "on_site",
  });

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/employee/projects/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setProjects(projectsRes.data);
      } catch (err) {
        setError("Erreur de chargement des données.");
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTaskData((prev) => ({
      ...prev,
      [name]: name === "progress" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!taskData.title || !taskData.projectId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    console.log("Task data envoyée :", taskData);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/employee/tasks/create`,
        taskData, // envoie l'objet JSON
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json", // très important
          },
        }
      );

      if (onTaskAdded) onTaskAdded(response.data.task);
<<<<<<< HEAD
      
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

      // Réinitialisation
      setTaskData({
        title: "",
        description: "",
        type: "daily",
        status: "pending",
<<<<<<< HEAD
        projectId: taskData.projectId,
        assignedToId:userId ,
=======
        projectId: null,
        assignedToId: null,
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
        progress: 0,
        intervention: "on_site",
      });
      console.log("tache", response.data.task);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
      console.error(err.response?.data);
    }
  };

<<<<<<< HEAD
//   return (
//     <form className={styles.addTaskForm} onSubmit={handleSubmit}>
//       <div
//         style={{
//           display: "flex",
//           gap: "1rem",
//           alignItems: "center",
//         }}
//       >
//         <h2 style={{ fontSize: "1.7rem", color: "rgba(80, 80, 84, 1)" }}>
//           Ajouter une tâche Pour Moi
//         </h2>
//         <FiX
//           size={18}
//           style={{
//             color: "rgba(80, 80, 84, 1)",
//             position: "absolute",
//             left: "24.5rem",
//             top: "2.2rem",
//             cursor: "pointer",
//           }}
//           onClick={onClose}
//         />
//       </div>

//       {error && <div className={styles.errorMessage}>{error}</div>}

//       <label>Titre *</label>
//       <input
//         type="text"
//         name="title"
//         value={taskData.title}
//         onChange={handleChange}
//         required
//       />

//       <label>Description</label>
//       <textarea
//         name="description"
//         value={taskData.description}
//         onChange={handleChange}
//       />

//       <label>Type *</label>
//       <select
//         name="type"
//         value={taskData.type}
//         onChange={handleChange}
//         required
//       >
//         <option value="daily">Journalier</option>
//       </select>

//       <label>Statut</label>
//       <select name="status" value={taskData.status} onChange={handleChange}>
//         <option value="pending">En attente</option>
//         <option value="inProgress">En cours</option>
//         <option value="completed">Complétée</option>
//         <option value="late">En retard</option>
//       </select>

//       <label>Projet *</label>
//       <select
//         name="projectId"
//         value={taskData.projectId}
//         onChange={handleChange}
//         required
//       >
//         <option value="">-- Sélectionner un projet --</option>
//         {projects.map((project) => (
//           <option key={project._id} value={project._id}>
//             {project.name}
//           </option>
//         ))}
//       </select>

//       <label>Avancement (%)</label>
//       <input
//         type="number"
//         name="progress"
//         value={taskData.progress}
//         onChange={handleChange}
//         min={0}
//         max={100}
//       />

//       <label>Type d'intervention</label>
//       <select
//         name="intervention"
//         value={taskData.intervention}
//         onChange={handleChange}
//       >
//         <option value="on_site">Sur site</option>
//         <option value="remote">À distance</option>
//       </select>
//       <div style={{ display: "flex", gap: "2rem" }}>
//         <button type="submit">Créer la tâche</button>
//         <button type="button" onClick={onClose}>
//           Annuler
//         </button>
//       </div>
//     </form>
//   );
// };
  return (
    <div className={styles.modalOverlay}>
      <form className={styles.addTaskForm} onSubmit={handleSubmit}>
        <h2>Ajouter une tâche pour moi</h2>
        <button 
          type="button" 
          className={styles.closeButton} 
          onClick={onClose}
        >
          <FiX />
        </button>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formGroup}>
          <label className={styles.requiredField}>Titre</label>
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Type</label>
          <select
            name="type"
            value={taskData.type}
            onChange={handleChange}
            disabled // Désactivé car seulement "daily" pour les employés
          >
            <option value="daily">Journalier</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Statut</label>
          <select 
            name="status" 
            value={taskData.status} 
            onChange={handleChange}
          >
            <option value="pending">En attente</option>
            <option value="inProgress">En cours</option>
            <option value="completed">Complétée</option>
            <option value="late">En retard</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.requiredField}>Projet</label>
          <select
            name="projectId"
            value={taskData.projectId}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner un projet --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Avancement (%)</label>
          <input
            type="number"
            name="progress"
            value={taskData.progress}
            onChange={handleChange}
            min={0}
            max={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Type d'intervention</label>
          <select
            name="intervention"
            value={taskData.intervention}
            onChange={handleChange}
          >
            <option value="on_site">Sur site</option>
            <option value="remote">À distance</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            Créer la tâche
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
=======
  return (
    <form className={styles.addTaskForm} onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.7rem", color: "rgba(80, 80, 84, 1)" }}>
          Ajouter une tâche Pour Moi
        </h2>
        <FiX
          size={18}
          style={{
            color: "rgba(80, 80, 84, 1)",
            position: "absolute",
            left: "24.5rem",
            top: "2.2rem",
            cursor: "pointer",
          }}
          onClick={onClose}
        />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <label>Titre *</label>
      <input
        type="text"
        name="title"
        value={taskData.title}
        onChange={handleChange}
        required
      />

      <label>Description</label>
      <textarea
        name="description"
        value={taskData.description}
        onChange={handleChange}
      />

      <label>Type *</label>
      <select
        name="type"
        value={taskData.type}
        onChange={handleChange}
        required
      >
        <option value="daily">Journalier</option>
      </select>

      <label>Statut</label>
      <select name="status" value={taskData.status} onChange={handleChange}>
        <option value="pending">En attente</option>
        <option value="inProgress">En cours</option>
        <option value="completed">Complétée</option>
        <option value="late">En retard</option>
      </select>

      <label>Projet *</label>
      <select
        name="projectId"
        value={taskData.projectId}
        onChange={handleChange}
        required
      >
        <option value="">-- Sélectionner un projet --</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </select>

      <label>Avancement (%)</label>
      <input
        type="number"
        name="progress"
        value={taskData.progress}
        onChange={handleChange}
        min={0}
        max={100}
      />

      <label>Type d'intervention</label>
      <select
        name="intervention"
        value={taskData.intervention}
        onChange={handleChange}
      >
        <option value="on_site">Sur site</option>
        <option value="remote">À distance</option>
      </select>
      <div style={{ display: "flex", gap: "2rem" }}>
        <button type="submit">Créer la tâche</button>
        <button type="button" onClick={onClose}>
          Annuler
        </button>
      </div>
    </form>
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  );
};

export default TaskEmployeForm;
