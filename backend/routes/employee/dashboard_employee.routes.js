const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/employee/dashboard_employe.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

router.get(
  "/stats/:employeeId",
  authMiddleware,
  dashboardController.getUserStats
);

router.get(
  "/stats/daily/:employeeId",
  authMiddleware,
  dashboardController.getDailyStats
);

router.get(
  "/stats/monthly/:employeeId",
  authMiddleware,
  dashboardController.getMonthlyStats
);

router.get(
  "/stats/yearly/:employeeId",
  authMiddleware,
  dashboardController.getYearlyStats
);

module.exports = router;
