

import { useState, useEffect } from "react";
import { Spin, message, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import api from "../../api/statsApi";
import StatsHeader from "../../components/employe/stats/StatsHeader";
import EmployeeStatsDashboard from "../../components/employe/stats/GlobalStats";
import DailyStats from "../../components/employe/stats/DailyStats";
import MonthlyStats from "../../components/employe/stats/MonthlyStats";
import YearlyStats from "../../components/employe/stats/YearlyStats";
import { getSocket } from '../../utils/socket';
import { toast } from 'react-toastify';
import "./stats.css";

const StatsPage = ({ employeeId }) => {
  const effectiveEmployeeId =
    employeeId || JSON.parse(localStorage.getItem("user"))?._id;

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
          data = await api.getDailyStats(params.date, effectiveEmployeeId);
          break;
        case "monthly":
          data = await api.getMonthlyStats(
            params.year,
            params.month,
            effectiveEmployeeId
          );
          break;
        case "yearly":
          data = await api.getYearlyStats(params.year, effectiveEmployeeId);
          break;
        default:
          data = await api.getUserStats(effectiveEmployeeId);
      }

      setStatsData(data);
      setStatsType(type);
    } catch (error) {
      setError(error);
      message.error(`Erreur lors du chargement: ${error.message}`);
      console.error("Erreur détaillée:", error);
    } finally {
      setLoading(false);
    }
  };
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
  const handlePeriodChange = (period) => {
    setParams(period);
    fetchStats(period.type, period);
  };
   
  useEffect(() => {
    fetchStats("global");
  }, [employeeId]); // Important pour recharger si l'ID change

  const getPageTitle = () => {
    const titles = {
      global: "Vue Globale",
      daily: "Statistiques Journalières",
      monthly: "Statistiques Mensuelles",
      yearly: "Statistiques Annuelles",
    };
    return titles[statsType];
  };

  const renderError = () => (
    <div className="error-container">
      <div className="error-content">
        <ExclamationCircleOutlined
          style={{ color: "var(--secondary-red)", fontSize: "48px" }}
        />
        <h3>Erreur de chargement</h3>
        <p>{error?.message || "Une erreur inconnue est survenue"}</p>
        <Button
          type="primary"
          onClick={() => fetchStats(statsType, params)}
          style={{ background: "var(--secondary-red)" }}
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
        <div className="loading-container">
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
        return <EmployeeStatsDashboard data={statsData} />;
    }
  };

  return (
    <div
      className="stats-page scrollable-container"
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="header-section">
        <h1 className="projet-page-title">{getPageTitle()}</h1>
      </div>
      <StatsHeader onPeriodChange={handlePeriodChange} />
      <div className="stats-content">{renderStats()}</div>
    </div>
  );
};

export default StatsPage;
