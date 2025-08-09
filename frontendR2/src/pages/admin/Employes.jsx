import React, { useEffect, useState } from "react";
import EmployeCard from "../../components/admin/EmployeCard.jsx";
import EmployeeModal from "../../components/admin/EmployeModal";
import EmployeeUpdateForm from "../../components/admin/EmployeUpdate";
import AddEmployeModal from "../../components/admin/AddEmployeModal";
import "../../components/admin/EmployeCard.css";
import axios from "axios";
import { FiSearch, FiPlus } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import StatsPage from "../employe/StatsPage.jsx";
import { getSocket } from "../../utils/socket";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [filteredEmployes, setFilteredEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [employeeToUpdate, setEmployeeToUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("");
  const [selectedEmployeeForDashboard, setSelectedEmployeeForDashboard] = 
    useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
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
      toast.error("Erreur lors de la récupération du rôle");
    }
  };

  useEffect(() => {
    fetchRole();
    fetchEmployees();
    setupSocketListeners();
  }, []);

  const setupSocketListeners = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    
    const socket = getSocket(token, userId);

    // Écouter les mises à jour d'employés
    socket.on('employee_updated', (updatedEmployee) => {
      setEmployes(prev => 
        prev.map(emp => 
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        )
      );
      setFilteredEmployes(prev => 
        prev.map(emp => 
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        )
      );
      
      if (selectedEmployee?._id === updatedEmployee._id) {
        setEmployeeDetails(prev => ({
          ...prev,
          employee: updatedEmployee
        }));
      }
      toast.success(`Profil de ${updatedEmployee.name} mis à jour`);
    });

    // Écouter les nouveaux employés
    socket.on('new_employee', (newEmployee) => {
      setEmployes(prev => [...prev, newEmployee]);
      setFilteredEmployes(prev => [...prev, newEmployee]);
      toast.success(`Nouvel employé ajouté: ${newEmployee.name}`);
    });

    // Écouter les suppressions d'employés
    socket.on('employee_deleted', (deletedEmployee) => {
      setEmployes(prev => prev.filter(emp => emp._id !== deletedEmployee._id));
      setFilteredEmployes(prev => prev.filter(emp => emp._id !== deletedEmployee._id));
      
      if (selectedEmployee?._id === deletedEmployee._id) {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setEmployeeDetails(null);
      }
      toast.warning(`Employé ${deletedEmployee.name} supprimé`);
    });

    return () => {
      socket.off('employee_updated');
      socket.off('new_employee');
      socket.off('employee_deleted');
    };
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5001/api/admin/employees",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEmployes(response.data);
      setFilteredEmployes(response.data);
      //toast.success("Liste des employés actualisée");
    } catch (err) {
      console.error("Error fetching employes:", err);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/admin/employees/detailse/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast.error("Erreur lors du chargement des détails");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const results = employes.filter(
      (employe) =>
        (employe.name &&
          employe.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employe.prenom &&
          employe.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employe.position &&
          employe.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployes(results);
  }, [searchTerm, employes]);

  const handleCardClick = async (employe) => {
    try {
      setSelectedEmployee(employe);
      const details = await fetchEmployeeDetails(employe._id);
      setEmployeeDetails(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load employee details:", error);
      toast.error("Échec du chargement des détails");
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const formData = new FormData();
      Object.keys(newEmployee).forEach((key) => {
        if (key !== "profilePhoto") {
          formData.append(key, newEmployee[key]);
        }
      });

      if (newEmployee.profilePhoto) {
        formData.append("profilePhoto", newEmployee.profilePhoto);
      }

      const response = await axios.post(
        "http://localhost:5001/api/admin/employees/ajout",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEmployes([...employes, response.data.employee]);
      setFilteredEmployes([...filteredEmployes, response.data.employee]);
      setIsAddModalOpen(false);
      toast.success("Employé ajouté avec succès");
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Erreur lors de l'ajout de l'employé");
    }
  };

  const handleUpdateEmployee = async (id, updatedData) => {
    try {
      const formData = new FormData();
      Object.keys(updatedData).forEach((key) => {
        if (key !== "profilePhoto" && updatedData[key] !== null) {
          formData.append(key, updatedData[key]);
        }
      });

      if (updatedData.profilePhoto instanceof File) {
        formData.append("profilePhoto", updatedData.profilePhoto);
      }
      
      formData.append("id", id);

      const response = await axios.post(
        `http://localhost:5001/api/admin/employees/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEmployes(
        employes.map((emp) => (emp._id === id ? response.data.employee : emp))
      );
      setFilteredEmployes(
        filteredEmployes.map((emp) =>
          emp._id === id ? response.data.employee : emp
        )
      );

      setIsUpdateModalOpen(false);
      toast.success("Employé mis à jour avec succès");
      return response.data;
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Erreur lors de la mise à jour");
      throw error;
    }
  };

  const handelDetlete = async (employeId) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer cet employé ?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5001/api/admin/employees/${employeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEmployes((prev) => prev.filter((p) => p._id !== employeId));
        setFilteredEmployes((prev) => prev.filter((p) => p._id !== employeId));
        toast.success("Employé supprimé avec succès");
      } catch (error) {
        console.log("erreur de suppression", error);
        toast.error("Échec de la suppression");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmployeeDetails(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setEmployeeToUpdate(null);
  };

  const handleShowDashboard = (employe) => {
    setSelectedEmployee(employe);
    setShowDashboard(true);
  };

  const handleBackFromDashboard = () => {
    setShowDashboard(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="employes-page">
      {showDashboard ? (
        <div className="dashboard-container">
          <button
            onClick={handleBackFromDashboard}
            className="back-button-dash"
          >
            <div>
              <FaArrowLeft />
            </div>
            <span className="retour">Retour</span>
          </button>
          <StatsPage employeeId={selectedEmployee?._id} />
        </div>
      ) : (
        <>
          <div className="employes-header">
            <h1 className="employe-page-title">Employés</h1>
            {role == "admin" && (
              <button
                className="add-employee-btn"
                onClick={() => setIsAddModalOpen(true)}
                style={{ fontSize: "1.4rem" }}
              >
                <FiPlus className="add-icon" style={{ fontSize: "1.8rem" }} />
                Ajouter un employé
              </button>
            )}
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ fontSize: "1.2rem" }}
              />
            </div>
          </div>

          <div className="employe-list">
            {filteredEmployes.length > 0 ? (
              filteredEmployes.map((employe) => (
                <EmployeCard
                  key={employe._id}
                  employe={employe}
                  onClick={() => handleCardClick(employe)}
                  onDelete={() => handelDetlete(employe._id)}
                  onUpdate={handleUpdateEmployee}
                  onShowDashboard={handleShowDashboard}
                />
              ))
            ) : (
              <div className="no-results">
                <p>Aucun employé trouvé</p>
              </div>
            )}
          </div>

          {isModalOpen && employeeDetails && (
            <div className="dashboard-employe-for-admin">
              <EmployeeModal
                employeeData={employeeDetails}
                onClose={closeModal}
                onShowDashboard={() => handleShowDashboard(selectedEmployee)}
              />
            </div>
          )}

          {isAddModalOpen && (
            <AddEmployeModal
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddEmployee}
            />
          )}

          {isUpdateModalOpen && employeeToUpdate && (
            <EmployeeUpdateForm
              employe={employeeToUpdate}
              onClose={closeUpdateModal}
              onUpdate={handleUpdateEmployee}
            />
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Employes;