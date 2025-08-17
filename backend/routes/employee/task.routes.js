const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("../../controllers/employee/task.controller");
const roleMiddleware = require("../../middlewares/role.middleware");

<<<<<<< HEAD
router.post("/validate-day",authMiddleware, taskController.validateDay);
router.post("/cancel-day-validation",authMiddleware, taskController.cancelDayValidation);
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
router.get("/", authMiddleware, taskController.getEmployeTask);
router.delete(
  "/delete/:taskId",
  authMiddleware,
  taskController.deleteEmployeTask
);
router.put("/update/:taskId", authMiddleware, taskController.updateEmployeTask);
router.post("/create", authMiddleware, taskController.createDailyTask);
router.post(
  "/:taskId/toggle-favorite",
  authMiddleware,

  taskController.toggleFavorites
);
router.get("/favorites", authMiddleware, taskController.getFavoriteTasks);

module.exports = router;
