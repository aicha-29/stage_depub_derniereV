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
import ProjectsPageManager from "./pages/manager/ProjectsPageManager2";
import StatsPageManager from "./pages/manager/StatsPageManager";
import TasksPageManager from "./pages/manager/TasksPageManager";
<<<<<<< HEAD
import { MessagingProvider } from './context/MessagingContext';
import MessagingPanel from './components/messaging/MessagingPanel';
import MessagingPage from './pages/MessagingPage';
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

function App() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const path = location.pathname;

  // Détermine si la route actuelle est une route publique (sans sidebar)
  const isPublicRoute = ["/", "/login"].includes(path);

  const shouldShowSidebar =
    !isPublicRoute &&
    ((role === "employee" &&
      [
        "/employe/dashboard",
        "/employe/projets",
        "/employe/taches",
        "/employe/favorites",
        "/employe/profil",
        "/employee/notifications",
<<<<<<< HEAD
        "/employe/messaging"
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      ].includes(path)) ||
      (role === "admin" &&
        [
          "/admin/dashboard",
          "/admin/projets",
          "/admin/employes",
          "/admin/profil",
          "/admin/taches",
          "/admin/notifications",
<<<<<<< HEAD
          "/admin/messaging"
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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
<<<<<<< HEAD
          "/manager/messaging"
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
        ].includes(path)));

  const renderSidebar = () => {
    if (!shouldShowSidebar) return null;

    if (role === "employee") return <NavbarEmploye />;
    if (role === "admin") return <NavbarAdmin />;
    if (role === "manager") return <NavbarManager />;
    return null;
  };

  return (
<<<<<<< HEAD

     <MessagingProvider>
=======
    <>
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
      <ToastContainer />
      {isPublicRoute ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="app-layout">
          <div className="sidebar">{renderSidebar()}</div>
          <div className="main-content">
            <Routes>
<<<<<<< HEAD
          <Route
            path="/employe/messaging"
            element={
              <ProtectedRoute role={"employee"}>
                <MessagingPanel />
              </ProtectedRoute>
            }
          />
            <Route
            path="/admin/messaging"
            element={
              <ProtectedRoute role={"admin"}>
                <MessagingPanel />
              </ProtectedRoute>
            }
          />
            <Route
            path="/manager/messaging"
            element={
              <ProtectedRoute role={"manager"}>
                <MessagingPanel />
              </ProtectedRoute>
            }
          />
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
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
                path="/manager/dashboard"
                element={
                  <ProtectedRoute role="manager">
                    <StatsPageManager />
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
                    <ProjectsPageManager/>
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
                    <TasksPageManager />
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
      )}
<<<<<<< HEAD
     </MessagingProvider>
=======
    </>
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  );
}

export default App;