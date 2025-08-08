///////////////////
import React, { useState, useEffect } from "react";
import TaskEmployeCard from "../../components/employe/TaskEmployeCard.jsx";
import { FiSearch, FiPlus } from "react-icons/fi";
import TaskEmployeForm from "../../components/employe/TaskEmployeForm.jsx";
import TaskEmployeUpdate from "../../components/employe/TaskEmployeUpdate.jsx";
import TaskAddForm from "../admin/TaskAddForm.jsx";
import TaskEditForm from "../admin/TaskEditForm.jsx";
import axios from "axios";

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
  useEffect(() => {
    fetchRole();
  }, []);
  const fetchTasks = async () => {
    try {
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

    setFilteredTasks(result);
  }, [searchTerm, statusFilter, projectFilter, tasks]);

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
  return (
    <div className="tasks-page-container">
      <main className="tasks-main-content">
        <div className="header-section">
          <h1 className="projet-page-title">Tâches</h1>

          <button
            className="add-employee-btn"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "1.4rem" }}
          >
            <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
            Ajouter une tâche
          </button>
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
