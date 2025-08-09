import { useState } from "react";
import { Radio, Card } from "antd";
import ManagerProjectsPage from "./projetManagerPage";
import ProjectEmployePage from "../employe/ProjectEmployePage";
import "./StatsPageManager.css"; // Réutilisez le même CSS

const ProjectsPageManager = () => {
  const [viewType, setViewType] = useState("admin");

  return (
    <div className="manager-dashboard-container">
      <Card
        title="Sélection de la Vue Projets"
        className="dashboard-selector-card"
        headStyle={{
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          borderBottom: "1px solid #d9d9d9",
          borderRadius: "8px 8px 0 0",
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Radio.Group
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
          className="dashboard-radio-group"
        >
          <Radio.Button 
            value="admin" 
            className="radio-btn radio-btn-admin"
          >
            Tous les Projets
          </Radio.Button>
          <Radio.Button 
            value="employee" 
            className="radio-btn radio-btn-employee"
          >
            Mes Projets
          </Radio.Button>
        </Radio.Group>
      </Card>

      {viewType === "admin" ? (
        <ManagerProjectsPage />
      ) : (
        <ProjectEmployePage />
      )}
    </div>
  );
};

export default ProjectsPageManager;