///////////////////
import React, { useState, useEffect } from "react";
import TaskEmployeCard from "../../components/employe/TaskEmployeCard.jsx";
import { FiSearch, FiPlus } from "react-icons/fi";
import TaskEmployeForm from "../../components/employe/TaskEmployeForm.jsx";
import TaskEmployeUpdate from "../../components/employe/TaskEmployeUpdate.jsx";
import TaskAddForm from "../admin/TaskAddForm.jsx";
import TaskEditForm from "../admin/TaskEditForm.jsx";
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';
<<<<<<< HEAD
import {  FiCheckCircle,FiXCircle } from "react-icons/fi";
import axios from "axios";
import './Taches.css'
=======
import axios from "axios";
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

const Taches = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Toutes");
  const [projectFilter, setProjectFilter] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
<<<<<<< HEAD
const [taskTypeFilter, setTaskTypeFilter] = useState("Tous");
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  const fetchRole = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("data", res.data.data);
      console.log("role est ", res.data.data.role);
      setRole(res.data.data.role);
    } catch (error) {
      console.log("erreur lors de la récuppération du role", error);
    }
  };
<<<<<<< HEAD
   
=======
     useEffect(() => {
         const token = localStorage.getItem("token");
         const user = JSON.parse(localStorage.getItem('user'));
         const userId = user?._id;
         
         // Configuration Socket.IO
         const socket = getSocket(token, userId);
  
         const handleNotification = (notification) => {
          toast.info(notification.message);
        };
        socket.on('new_notification', handleNotification);
  
  
        return () => {
        socket.off('new_notification', handleNotification);
      };
    }, []);
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  useEffect(() => {
    fetchRole();
  }, []);
  const fetchTasks = async () => {
    try {
<<<<<<< HEAD
=======
      // const response =
      //   role === "employee"
      //     ? await fetch("http://localhost:5001/api/employee/tasks/", {
      //         headers: {
      //           Authorization: `Bearer ${localStorage.getItem("token")}`,
      //         },
      //       })
      //     : await fetch("http://localhost:5001/api/admin/tasks", {
      //         headers: {
      //           Authorization: `Bearer ${localStorage.getItem("token")}`,
      //         },
      //       });
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      const response = await fetch(
        "http://localhost:5001/api/employee/tasks/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tâches");
      }
      const data = await response.json();
      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
    useEffect(() => {
         const token = localStorage.getItem("token");
         const user = JSON.parse(localStorage.getItem('user'));
         const userId = user?._id;
         
         // Configuration Socket.IO
         const socket = getSocket(token, userId);
  
         const handleNotification = (notification) => {
            
          toast.info(notification.message);
              // Rafraîchir les tâches si nécessaire
    if (notification.type === 'task_late' || 
        notification.type === 'all_daily_tasks_completed') {
      fetchTasks();
    }

        };
       const handleTaskDeleted= (deletedTaskId) => {
      setTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTaskId));
      setFilteredTasks(prev => prev.filter(task => task._id !== deletedTaskId));
    }

          const handleTaskCreated= (newTask) => {
         if (newTask.assignedTo._id === userId || newTask.createdBy === userId ) {
      setTasks(prevTasks => [newTask, ...prevTasks]);
      setFilteredTasks(prev => [newTask, ...prev]);
       toast.info( `Création de la tâche "${newTask.title}" est  reussit`);
         }
    }
    // const handleassigner =(newTask) => {
    //   setTasks(prevTasks => [newTask, ...prevTasks]);
    //   setFilteredTasks(prev => [newTask, ...prev]);
         
    // }
    // Gestion de la désassignation
  const handleTaskUnassigned = (task) => {
    setTasks(prevTasks => prevTasks.filter(t => t._id !== task._id));
    setFilteredTasks(prev => prev.filter(t => t._id !== task._id));
  };

  // Gestion de la nouvelle assignation
  const handleTaskAssigned = (newTask) => {
    // Vérifie si la tâche n'existe pas déjà
    if (!tasks.some(t => t._id === newTask._id)) {
      setTasks(prevTasks => [formatTask(newTask), ...prevTasks]);
      setFilteredTasks(prev => [formatTask(newTask), ...prev]);
    }
  };
  //   const handleTaskUpdated = (updatedTask) => {
  //   if (updatedTask.assignedTo?._id === userId || updatedTask.createdBy?._id === userId) {
  //     setTasks(prev => 
  //       prev.map(task => 
  //         task._id === updatedTask._id ? formatTask(updatedTask) : task
  //       )
  //     );
  //     setFilteredTasks(prev => 
  //       prev.map(task => 
  //         task._id === updatedTask._id ? formatTask(updatedTask) : task
  //       )
  //     );
  //   }
  // };  
    // Gestion des mises à jour normales
  const handleTaskUpdated = (updatedTask) => {
    const isRelevant = 
      updatedTask.assignedTo?._id === userId || 
      updatedTask.createdBy?._id === userId;

    if (isRelevant) {
      setTasks(prev => 
        prev.map(task => 
          task._id === updatedTask._id ? formatTask(updatedTask) : task
        )
      );
      setFilteredTasks(prev => 
        prev.map(task => 
          task._id === updatedTask._id ? formatTask(updatedTask) : task
        )
      );
    } else {
      // Si la tâche ne nous concerne plus
      setTasks(prev => prev.filter(task => task._id !== updatedTask._id));
      setFilteredTasks(prev => prev.filter(task => task._id !== updatedTask._id));
    }
  };
        socket.on('desassigner_tache',handleTaskUnassigned ); 
        socket.on('assigner_tache',handleTaskAssigned );
        socket.on('new_notification', handleNotification);
         // Écouter les événements de tâches
        socket.on('task_created', handleTaskCreated);
        socket.on('task_updated', handleTaskUpdated);
        socket.on('task_deleted',handleTaskDeleted );
  
        return () => {
        socket.off('desassigner_tache',handleTaskUnassigned );
        socket.off('assigner_tache',handleTaskAssigned  );
       
        socket.off('new_notification', handleNotification);
        socket.off('task_created',handleTaskCreated);
        socket.off('task_updated', handleTaskUpdated);
        socket.off('task_deleted',handleTaskDeleted);
      
      };
    }, [tasks]);
    // Fonction helper pour formater les tâches de manière cohérente
const formatTask = (task) => {
  return {
    ...task,
    project: task.project ? {
      ...task.project,
      name: task.project.name || "Projet sans nom"
    } : null,
    assignedTo: task.assignedTo ? {
      ...task.assignedTo,
      name: task.assignedTo.name || "Non assigné"
    } : null
  };
};
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const projectsRes = await axios.get(
        "http://localhost:5001/api/employee/projects",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const usersRes = await axios.get(
        "http://localhost:5001/api/admin/employees",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = tasks;

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (task) =>
          task.title?.toLowerCase().includes(lowerSearch) ||
          task.description?.toLowerCase().includes(lowerSearch) ||
          task.project?.name?.toLowerCase().includes(lowerSearch) ||
          task.assignedTo?.name?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "Toutes") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (projectFilter !== "Tous") {
      result = result.filter((task) => task.project?.name === projectFilter);
    }
<<<<<<< HEAD
     if (taskTypeFilter !== "Tous") {
    result = result.filter((task) => task.type === taskTypeFilter);
  }
    setFilteredTasks(result);
  }, [searchTerm, statusFilter, projectFilter, tasks,taskTypeFilter,]);
=======

    setFilteredTasks(result);
  }, [searchTerm, statusFilter, projectFilter, tasks]);
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

  const handelTaskAdd = async () => {
    setShowModal(false);
    fetchTasks();
  };

  const handelDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/employee/tasks/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTasks((prev) => prev.filter((task) => task._id != id));
      setFilteredTasks((prev) => prev.filter((task) => task._id != id));
    } catch (error) {
      console.log("erreur lors de la suppression des taches ", error);
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setFilteredTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    setShowEditModal(false);
  };

  // Récupérer les valeurs uniques pour les filtres dynamiques
  const uniqueProjects = [
    ...new Set(tasks.map((task) => task.project?.name).filter(Boolean)),
  ];
  console.log("users", users);
<<<<<<< HEAD
  
  // Ajoutez cette fonction dans votre composant Taches
const validateDay = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/employee/tasks/validate-day",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast.success(response.data.message);
    fetchTasks(); // Rafraîchir les tâches si nécessaire
  } catch (error) {
    toast.error(error.response?.data?.message || "Erreur lors de la validation");
  }
};
const cancelDayValidation = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/employee/tasks/cancel-day-validation",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast.success(response.data.message);
    fetchTasks(); // Rafraîchir les données si nécessaire
  } catch (error) {
    toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
  }
};


=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  return (
    <div className="tasks-page-container">
      <main className="tasks-main-content">
        <div className="header-section">
          <h1 className="projet-page-title">Tâches</h1>

<<<<<<< HEAD
          <div className="action-buttons">
    <button className="btn btn-add" onClick={() => setShowModal(true)}>
      <FiPlus className="btn-icon" />
      Ajouter une tâche
    </button>
    
    <button className="btn btn-validate" onClick={() => validateDay()}>
      <FiCheckCircle className="btn-icon" />
      Valider ma journée
    </button>
    
    <button className="btn btn-cancel" onClick={() => cancelDayValidation()}>
      <FiXCircle className="btn-icon" />
      Annuler la validation
    </button>
  </div>
=======
          <button
            className="add-employee-btn"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "1.4rem" }}
          >
            <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
            Ajouter une tâche
          </button>
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
        </div>
        <div className="search-filter-container">
          <div className="search-wrapper">
            <FiSearch
              className="search-icon"
              style={{ position: "absolute", top: "2rem" }}
            />
            <input
              type="text"
              placeholder="Rechercher tâches par titre, description, projet ou employé"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ fontSize: "1.25rem" }}
            />
          </div>
          <div className="filter-container">
            <div className="filter-wrapper">
              <label>Status : </label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Toutes</option>
                <option value="inProgress">en cours</option>
                <option value="completed">terminé</option>
                <option value="late">en retard</option>
              </select>
            </div>

            <div className="filter-wrapper">
              <label>Projet : </label>
              <select
                className="filter-select"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Tous</option>
                {uniqueProjects.map((proj, i) => (
                  <option key={i}>{proj}</option>
                ))}
              </select>
            </div>
<<<<<<< HEAD
            <div className="filter-wrapper">
              <label>Type : </label>
              <select
                className="filter-select"
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              >
                <option>Tous</option>
                <option value="daily">Daily</option>
                <option value="long">Long</option>
              </select>
            </div>
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <TaskEmployeCard
            tasks={filteredTasks}
            handelDelete={handelDelete}
            onEditTask={handleEditTask}
          />
        )}
      </main>

      {showModal &&
        (role === "employee" ? (
          <TaskEmployeForm
            projects={projects}
            onAddTask={handelTaskAdd}
            onClose={() => setShowModal(false)}
          />
        ) : (
          <TaskAddForm
            projects={projects}
            onAddTask={handelTaskAdd}
            onClose={() => setShowModal(false)}
          />
        ))}

      {showEditModal &&
        taskToEdit &&
        (role === "employee" ? (
          <TaskEmployeUpdate
            taskToEdit={taskToEdit}
            projects={projects}
            onUpdateTask={handleUpdateTask}
            onClose={() => setShowEditModal(false)}
          />
        ) : (
          <TaskEditForm
            taskToEdit={taskToEdit}
            projects={projects}
            users={users}
            onUpdateTask={handleUpdateTask}
            onClose={() => setShowEditModal(false)}
          />
        ))}
    </div>
  );
};

export default Taches;
