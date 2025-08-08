import axios from "axios";

const BASE_URL = "http://localhost:5001/api/employee/dashboard/stats";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const getUserStats = async (employeeId) => {
  const response = await axios.get(`${BASE_URL}/${employeeId}`, {
    headers: getAuthHeaders(),
  });
  console.log("id", employeeId);
  return response.data;
};

const getDailyStats = async (date, employeeId) => {
  const response = await axios.get(`${BASE_URL}/daily/${employeeId}`, {
    params: { date },
    headers: getAuthHeaders(),
  });
  return response.data;
};

const getMonthlyStats = async (year, month, employeeId) => {
  const response = await axios.get(`${BASE_URL}/monthly/${employeeId}`, {
    params: { year, month },
    headers: getAuthHeaders(),
  });
  return response.data;
};

const getYearlyStats = async (year, employeeId) => {
  const response = await axios.get(`${BASE_URL}/yearly/${employeeId}`, {
    params: { year },
    headers: getAuthHeaders(),
  });
  return response.data;
};

export default {
  getDailyStats,
  getMonthlyStats,
  getYearlyStats,
  getUserStats,
};