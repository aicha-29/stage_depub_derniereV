import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const API_BASE_URL = "http://localhost:5001/api/admin/dashboard"; // Remplacez par votre URL backend

const getGlobalStats = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5001/api/admin/dashboard/stats",
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des statistiques globales"
    );
  }
};

const getDailyStats = async (date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/daily`, {
      params: { date },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des statistiques journalières"
    );
  }
};

const getMonthlyStats = async (year, month) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/monthly`, {
      params: { year, month },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des statistiques mensuelles"
    );
  }
};

const getYearlyStats = async (year) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/yearly`, {
      params: { year },
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des statistiques annuelles"
    );
  }
};

export default {
  getGlobalStats,
  getDailyStats,
  getMonthlyStats,
  getYearlyStats,
};
