import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import styles from "./TaskAddForm.module.css";
const initialState = {
  title: "",
  description: "",
  type: "daily",
  status: "pending",
  deadline: undefined,
  projectId: null,
  assignedToId: null,
  progress: 0,
  intervention: "on_site",
};

<<<<<<< HEAD
const TaskAddForm = ({onAddTask , onClose }) => {
=======
const TaskAddForm = ({ onTaskAdded, onClose }) => {
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    type: "daily",
    status: "pending",
    deadline: undefined,
    projectId: null,
    assignedToId: null,
    progress: 0,
    intervention: "on_site",
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskData.type !== "long") {
      setTaskData((prev) => ({ ...prev, deadline: "" }));
    }
  }, [taskData.type]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/admin/projects/cards`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`http://localhost:5001/api/admin/employees/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
<<<<<<< HEAD
      
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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
<<<<<<< HEAD
    
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    if (!taskData.title || !taskData.type || !taskData.projectId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (taskData.type === "long" && !taskData.deadline) {
      setError("Veuillez spécifier une deadline pour les tâches longues.");
      return;
    }
    console.log("Task data envoyée :", taskData);

    try {
      const response = await axios.post(
        `http://localhost:5001/api/admin/tasks/create`,
        taskData, // envoie l'objet JSON
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json", // très important
          },
        }
      );

<<<<<<< HEAD
      if (onAddTask) onAddTask(response.data.task);
=======
      if (onTaskAdded) onTaskAdded(response.data.task);
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

      // Réinitialisation
      setTaskData({
        title: "",
        description: "",
        type: "daily",
        status: "pending",
        deadline: undefined,
        projectId: null,
        assignedToId: null,
        progress: 0,
        intervention: "on_site",
      });
<<<<<<< HEAD
        onClose();
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      console.log("tache", response.data.task);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
      console.error(err.response?.data);
    }
  };

<<<<<<< HEAD
//   return (
//       <div className={styles.modalOverlay}>
//     <form className={styles.addTaskForm} onSubmit={handleSubmit}>
//       <h2 style={{ fontSize: "1.7rem", color: "rgba(80, 80, 84, 1)" }}>
//         Ajouter une tâche
//       </h2>
//       <FiX
//         size={18}
//         style={{
//           color: "rgba(80, 80, 84, 1)",
//           position: "absolute",
//           left: "24.5rem",
//           top: "2.2rem",
//           cursor: "pointer",
//         }}
//         onClick={onClose}
//       />

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
//         <option value="long">Long terme</option>
//       </select>

//       {taskData.type === "long" && (
//         <>
//           <label>Deadline *</label>
//           <input
//             type="date"
//             name="deadline"
//             value={taskData.deadline}
//             onChange={handleChange}
//             required
//           />
//         </>
//       )}

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

//       <label>Employé assigné</label>
//       <select
//         name="assignedToId"
//         value={taskData.assignedToId}
//         onChange={handleChange}
//       >
//         <option value="">-- Aucun --</option>
//         {users.map((user) => (
//           <option key={user._id} value={user._id}>
//             {user.name}
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
//     </div>
//   );
// };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.addTaskForm} onSubmit={handleSubmit}>
        <h2>Ajouter une tâche</h2>
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
          <label className={styles.requiredField}>Type</label>
          <select
            name="type"
            value={taskData.type}
            onChange={handleChange}
            required
          >
            <option value="daily">Journalier</option>
            <option value="long">Long terme</option>
          </select>
        </div>

        {taskData.type === "long" && (
          <div className={styles.formGroup}>
            <label className={styles.requiredField}>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={taskData.deadline}
              onChange={handleChange}
              required
            />
          </div>
        )}

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
          <label>Employé assigné</label>
          <select
            name="assignedToId"
            value={taskData.assignedToId}
            onChange={handleChange}
          >
            <option value="">-- Aucun --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
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
  );
};
=======
  return (
    <form className={styles.addTaskForm} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: "1.7rem", color: "rgba(80, 80, 84, 1)" }}>
        Ajouter une tâche
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
        <option value="long">Long terme</option>
      </select>

      {taskData.type === "long" && (
        <>
          <label>Deadline *</label>
          <input
            type="date"
            name="deadline"
            value={taskData.deadline}
            onChange={handleChange}
            required
          />
        </>
      )}

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

      <label>Employé assigné</label>
      <select
        name="assignedToId"
        value={taskData.assignedToId}
        onChange={handleChange}
      >
        <option value="">-- Aucun --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name}
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
  );
};

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
export default TaskAddForm;
