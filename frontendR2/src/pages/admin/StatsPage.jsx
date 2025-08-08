import { useState, useEffect } from "react";
import { Spin, message, Button, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import api from "../../api/statsAdminApi";
import AdminStatsHeader from "../../components/admin/stats/AdminStatsHeader";
import GlobalStats from "../../components/admin/stats/GlobalStats";
import DailyStats from "../../components/admin/stats/DailyStats";
import MonthlyStats from "../../components/admin/stats/MonthlyStats";
import YearlyStats from "../../components/admin/stats/YearlyStats";
import "./adminStats.css";

const StatsPageAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [statsType, setStatsType] = useState("global");
  const [statsData, setStatsData] = useState(null);
  const [params, setParams] = useState({});
  const [error, setError] = useState(null);

  const fetchStats = async (type, params = {}) => {
    try {
      setError(null);
      setLoading(true);
      let data;

      switch (type) {
        case "daily":
          data = await api.getDailyStats(params.date);
          break;
        case "monthly":
          data = await api.getMonthlyStats(params.year, params.month);
          break;
        case "yearly":
          data = await api.getYearlyStats(params.year);
          break;
        default:
          data = await api.getGlobalStats();
      }

      setStatsData(data);
      setStatsType(type);
    } catch (error) {
      console.error("Fetch stats error:", error);
      setError(error);
      notification.error({
        message: "Erreur de chargement",
        description:
          "Impossible de charger les statistiques. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setParams(period);
    fetchStats(period.type, period);
  };

  useEffect(() => {
    fetchStats("global");
  }, []);

  const getPageTitle = () => {
    const titles = {
      global: "Tableau de Bord Administrateur",
      daily: "Statistiques Journalières",
      monthly: "Statistiques Mensuelles",
      yearly: "Statistiques Annuelles",
    };
    return titles[statsType];
  };

  const renderError = () => (
    <div className="admin-error-container">
      <div className="admin-error-content">
        <ExclamationCircleOutlined className="admin-error-icon" />
        <h3>Erreur de chargement</h3>
        <p>
          {error?.message ||
            "Une erreur est survenue lors du chargement des données"}
        </p>
        <Button
          type="primary"
          onClick={() => fetchStats(statsType, params)}
          className="admin-retry-btn"
        >
          Réessayer
        </Button>
      </div>
    </div>
  );

  const renderStats = () => {
    if (error) return renderError();
    if (loading)
      return (
        <div className="admin-loading-container">
          <Spin size="large" />
        </div>
      );

    switch (statsType) {
      case "daily":
        return <DailyStats data={statsData} />;
      case "monthly":
        return <MonthlyStats data={statsData} />;
      case "yearly":
        return <YearlyStats data={statsData} />;
      default:
        return <GlobalStats data={statsData} />;
    }
  };

  return (
    <div
      className="admin-stats-page scrollable-container"
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="admin-header-section">
        <h1 className="admin-page-title">{getPageTitle()}</h1>
        {/* <p className="admin-page-subtitle">
          {statsType === "global" 
            ? "Vue globale sur l'ensemble des projets et tâches" 
            : statsType === "daily" 
              ? "Détails des activités journalières" 
              : statsType === "monthly" 
                ? "Analyse mensuelle des performances" 
                : "Synthèse annuelle des indicateurs clés"}
        </p> */}
      </div>

      <AdminStatsHeader
        currentType={statsType}
        onPeriodChange={handlePeriodChange}
      />

      <div className="admin-stats-content">{renderStats()}</div>
    </div>
  );
};

export default StatsPageAdmin;
