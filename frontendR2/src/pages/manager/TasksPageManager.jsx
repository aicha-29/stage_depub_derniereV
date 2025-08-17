import { useState } from "react";
import { Radio, Card } from "antd";
import TasksPage from "../admin/TasksPage";
import Taches from "../employe/Taches";
import "./StatsPageManager.css"; // Réutilisez le même CSS

const TasksPageManager = () => {
  const [viewType, setViewType] = useState("admin");

  return (
    <div className="manager-dashboard-container">
      <Card
        title="Sélection de la Vue Tâches"
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
            Toutes les Tâches
          </Radio.Button>
          <Radio.Button 
            value="employee" 
            className="radio-btn radio-btn-employee"
          >
            Mes Tâches
          </Radio.Button>
        </Radio.Group>
      </Card>

      {viewType === "admin" ? (
        <TasksPage />
      ) : (
        <Taches />
      )}
    </div>
  );
};

export default TasksPageManager;