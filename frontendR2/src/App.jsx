import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import StatsPage from "./pages/employe/StatsPage";
import Taches from "./pages/employe/Taches";
import Favorites from "./pages/employe/Favorites";
import Profil from "./pages/employe/ProfilPage";
import Login from "./pages/login";
import NavbarAdmin from "./components/admin/NavbarAdmin";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ProjetsAdmin from "./pages/admin/ProjetsAdmin";
import Employes from "./pages/admin/Employes";
import ProfilPage from "./pages/admin/ProfilPage";
import TasksPage from "./pages/admin/TasksPage";
import NavbarEmploye from "./components/employe/NavbarEmploye";
import ProjectEmployePage from "./pages/employe/ProjectEmployePage";
import NavbarManager from "./components/manager/NavbarManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StatsPageAdmin from "./pages/admin/StatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import StatsPageWrapper from "./pages/employe/StatsPageWrapper";
import ManagerProjectsPage from "./pages/manager/projetManagerPage";
function App() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const path = location.pathname;

  const shouldShowSidebar =
    (role === "employee" &&
      [
        "/employe/dashboard",
        "/employe/projets",
        "/employe/taches",
        "/employe/favorites",
        "/employe/profil",
        "/employee/notifications",
      ].includes(path)) ||
    (role === "admin" &&
      [
        "/admin/dashboard",
        "/admin/projets",
        "/admin/employes",
        "/admin/profil",
        "/admin/taches",
        "/admin/notifications",
      ].includes(path)) ||
    (role === "manager" &&
      [
        "/manager/dashboard",
        "/manager/projets",
        "/manager/employes",
        "/manager/profil",
        "/manager/favorites",
        "/manager/taches",
        "/manager/notifications",
      ].includes(path));

  const renderSidebar = () => {
    if (!shouldShowSidebar) return null;

    if (role === "employee") return <NavbarEmploye />;
    if (role === "admin") return <NavbarAdmin />;
    if (role === "manager") return <NavbarManager />;
    return null;
  };

  return (
    <div className="app-layout">
      <ToastContainer />
      <div className="sidebar">{renderSidebar()}</div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/employe/dashboard"
            element={
              <ProtectedRoute role={"employee"}>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/notifications"
            element={
              <ProtectedRoute role="employee">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/projets"
            element={
              <ProtectedRoute role="employee">
                <ProjectEmployePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/taches"
            element={
              <ProtectedRoute role="employee">
                <Taches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/favorites"
            element={
              <ProtectedRoute role="employee">
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/profil"
            element={
              <ProtectedRoute role="employee">
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employe/notifications"
            element={
              <ProtectedRoute role="employee">
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute role="manager">
                <StatsPageAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/notifications"
            element={
              <ProtectedRoute role="manager">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/projets"
            element={
              <ProtectedRoute role="manager">
                <ManagerProjectsPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/employes"
            element={
              <ProtectedRoute role="manager">
                <Employes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/favorites"
            element={
              <ProtectedRoute role="manager">
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/taches"
            element={
              <ProtectedRoute role="manager">
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profil"
            element={
              <ProtectedRoute role="manager">
                <ProfilPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <StatsPageAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projets"
            element={
              <ProtectedRoute role="admin">
                <ProjetsAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute role="admin">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employes"
            element={
              <ProtectedRoute role="admin">
                <Employes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employes/:id/dashboard"
            element={
              <ProtectedRoute role={["admin"]}>
                <StatsPageWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/taches"
            element={
              <ProtectedRoute role="admin">
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profil"
            element={
              <ProtectedRoute role="admin">
                <ProfilPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
