import { useState } from "react";
import { Radio, Card } from "antd";
import StatsPageAdmin from "../admin/StatsPage";
import StatsPage from "../employe/StatsPage";
import "./StatsPageManager.css"; // Nous créerons ce fichier CSS

const StatsPageManager = () => {
  const [dashboardType, setDashboardType] = useState("admin");

  return (
    <div className="manager-dashboard-container">
      <Card
        title="Sélection du Tableau de Bord"
        className="dashboard-selector-card"
        headStyle={{
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          borderBottom: "1px solid #d9d9d9",
          borderRadius: "8px 8px 0 0",
        }}
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Radio.Group
          value={dashboardType}
          onChange={(e) => setDashboardType(e.target.value)}
          className="dashboard-radio-group"
        >
          <Radio.Button 
            value="admin" 
            className="radio-btn radio-btn-admin"
          >
            Dashboard Administrateur
          </Radio.Button>
          <Radio.Button 
            value="employee" 
            className="radio-btn radio-btn-employee"
          >
            Dashboard Employé
          </Radio.Button>
        </Radio.Group>
      </Card>

      {dashboardType === "admin" ? (
        <StatsPageAdmin />
      ) : (
        <StatsPage employeeId={JSON.parse(localStorage.getItem("user"))?._id} />
      )}
    </div>
  );
};

export default StatsPageManager;