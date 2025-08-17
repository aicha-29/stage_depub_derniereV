const Project = require("../../models/project");
const Task = require("../../models/task");
const User = require("../../models/user");
const mongoose = require("mongoose");

// Fonction utilitaire pour générer des dates manquantes
const fillMissingDates = (data, startDate, endDate, format) => {
  const dateMap = Object.fromEntries(data.map((d) => [d.date, d]));
  const dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().slice(0, 10);
    dates.push(
      dateMap[dateStr] || {
        date: dateStr,
        pourcentage: 0,
        nombre: "0/0",
        completed: 0,
        total: 0,
      }
    );
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Statistiques quotidiennes
exports.getDailyStats = async (req, res) => {
  try {
    const { date } = req.query; // Format: YYYY-MM-DD
    const { employeeId } = req.params;
    const userId = new mongoose.Types.ObjectId(employeeId);
    const selectedDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      late: 0,
      avgProgress: 0,
    };

    res.json({
      date: selectedDate.toISOString().slice(0, 10),
      stats: {
        ...result,
        completionRate:
          result.total > 0
            ? Math.round((result.completed / result.total) * 100)
            : 0,
      },
      tasks: await Task.find({
        assignedTo: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("project", "name")
        .sort({ createdAt: -1 }),
    });
  } catch (err) {
    console.error("[Daily Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques quotidiennes",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.query; // Format: YYYY, MM (1-12)
    const { employeeId } = req.params;
    const userId = new mongoose.Types.ObjectId(employeeId);
    const selectedYear = parseInt(year) || new Date().getFullYear();
    const selectedMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(selectedYear, selectedMonth - 1, 1);
    const endDate = new Date(selectedYear, selectedMonth, 0);
    endDate.setHours(23, 59, 59, 999);

    // Stats quotidiennes pour le mois
    const dailyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                    { $ne: ["$type", "daily"] }, // ← On exclut les tâches daily ici
                  ],
                },
                1,
                0,
              ],
            },
          },

          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          total: 1,
          completed: 1,
          inProgress: 1,
          pending: 1,
          late: 1,
          avgProgress: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Stats globales pour le mois
    const monthlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: { $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] } },
          longCount: { $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] } },
        },
      },
    ]);

    const filledDailyStats = fillMissingDates(
      dailyStats,
      startDate,
      endDate,
      "%Y-%m-%d"
    );

    res.json({
      month: `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`,
      stats: monthlyStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        late: 0,
        avgProgress: 0,
        completionRate: 0,
      },
      dailyStats: filledDailyStats,
    });
  } catch (err) {
    console.error("[Monthly Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques mensuelles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getYearlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const { employeeId } = req.params.employeeId;
    const userId = new mongoose.Types.ObjectId(employeeId);
    const selectedYear = parseInt(year) || new Date().getFullYear();
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    endDate.setHours(23, 59, 59, 999);

    // ===================== STATS MENSUELLES =====================
    const monthlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: {
            $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] },
          },
          longCount: {
            $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: 1,
          completed: 1,
          inProgress: 1,
          pending: 1,
          late: 1,
          avgProgress: 1,
          dailyCount: 1,
          longCount: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    // ===================== STATS GLOBALES ANNUELLES =====================
    const yearlyStats = await Task.aggregate([
      {
        $match: {
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          late: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "completed"] },
                    { $lt: ["$deadline", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgProgress: { $avg: "$progress" },
          dailyCount: {
            $sum: { $cond: [{ $eq: ["$type", "daily"] }, 1, 0] },
          },
          longCount: {
            $sum: { $cond: [{ $eq: ["$type", "long"] }, 1, 0] },
          },
        },
      },
    ]);

    // ===================== REMPLIR LES MOIS MANQUANTS =====================
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, "0");
      return `${selectedYear}-${month}`;
    });

    const monthMap = Object.fromEntries(monthlyStats.map((m) => [m.month, m]));
    const filledMonthlyStats = allMonths.map(
      (month) =>
        monthMap[month] || {
          month,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          late: 0,
          avgProgress: 0,
          dailyCount: 0,
          longCount: 0,
          completionRate: 0,
        }
    );

    // ===================== RÉPONSE =====================
    res.json({
      year: selectedYear,
      stats: yearlyStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        late: 0,
        avgProgress: 0,
        completionRate: 0,
        dailyCount: 0,
        longCount: 0,
      },
      monthlyStats: filledMonthlyStats,
    });
  } catch (err) {
    console.error("[Yearly Stats Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques annuelles",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = new mongoose.Types.ObjectId(employeeId);
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    // 📅 Récupération des tâches journalières sur 7 jours
    const rawDaily = await Task.aggregate([
      {
        $match: {
          type: "daily",
          assignedTo: userId,
          createdAt: { $gte: startDate, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          pourcentage: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
            ],
          },
          nombre: {
            $concat: [
              { $toString: "$completed" },
              "/",
              { $toString: "$total" },
            ],
          },
        },
      },
    ]);

    // Remplissage des jours manquants
    const getLastNDays = (n) => {
      const dates = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }
      return dates;
    };
    const last7Days = getLastNDays(7);
    const mapRaw = Object.fromEntries(rawDaily.map((d) => [d.date, d]));
    const dailyProgression = last7Days.map(
      (date) => mapRaw[date] || { date, pourcentage: 0, nombre: "0/0" }
    );

    // 📊 Statistiques des tâches
    const [taskStats] = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $facet: {
          taskTypes: [
            {
              $group: {
                _id: "$type",
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
                },
                late: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$status", "completed"] },
                          { $lt: ["$deadline", new Date()] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
              },
            },
          ],
          progressionStats: [
            {
              $group: {
                _id: null,
                avgProgression: { $avg: "$progress" },
                minProgression: { $min: "$progress" },
                maxProgression: { $max: "$progress" },
              },
            },
          ],
        },
      },
    ]);

    // On garde uniquement le type "daily" pour "tasks.stats"
    const formattedTasksStats = (taskStats.taskTypes || [])
      .filter((t) => t._id === "daily")
      .map((type) => ({
        type: type._id,
        total: type.total,
        completed: type.completed,
        inProgress: type.inProgress,
        late: type.late,
        pending: type.pending,
        completionRate:
          type.total > 0 ? Math.round((type.completed / type.total) * 100) : 0,
      }));

    const progressionData = taskStats.progressionStats[0] || {
      _id: null,
      avgProgression: 0,
      minProgression: 0,
      maxProgression: 0,
    };

    // 🔍 Activités récentes & critiques
    const [recentActivities, criticalTasks] = await Promise.all([
      Task.find({ assignedTo: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("project", "name logo")
        .populate("assignedTo", "profilePhoto position"),
      Task.find({
        assignedTo: userId,
        deadline: { $lt: new Date() },
        status: { $ne: "completed" },
      })
        .sort({ deadline: 1 })
        .limit(5)
        .populate("project", "name priority")
        .populate("assignedTo", "profilePhoto position"),
    ]);

    const enrichedRecentActivities = recentActivities.map((a) => ({
      _id: a._id,
      title: a.title,
      type: a.type,
      status: a.status,
      progress: a.progress,
      project: a.project
        ? {
            _id: a.project._id,
            name: a.project.name,
            logo: a.project.logo || null,
            id: a.project._id,
          }
        : null,
      assignedTo: {
        photo: a.assignedTo?.profilePhoto,
        position: a.assignedTo?.position,
      },
      intervention: a.intervention,
    }));

    const enrichedCriticalTasks = criticalTasks.map((t) => ({
      _id: t._id,
      title: t.title,
      type: t.type,
      status: t.status,
      progress: t.progress,
      project: t.project,
      assignedTo: {
        photo: t.assignedTo?.profilePhoto,
        position: t.assignedTo?.position,
      },
      intervention: t.intervention,
    }));

    // 📦 Statistiques projets
    const userProjects = await Project.find({ assignedEmployees: userId });
    const activeProjects = userProjects.filter(
      (p) => p.status === "active"
    ).length;
    const inactiveProjects = userProjects.filter(
      (p) => p.status === "inactive"
    ).length;
    const completedProjects = userProjects.filter(
      (p) => p.status === "completed"
    ).length;
    const overallProgression =
      userProjects.length > 0
        ? Math.round(
            userProjects.reduce((sum, p) => sum + p.progression, 0) /
              userProjects.length
          )
        : 0;

    // 📤 Réponse finale formatée
    res.json({
      projects: {
        active: activeProjects,
        inactive: inactiveProjects,
        completed: completedProjects,
        total: userProjects.length,
        overallProgression,
      },
      tasks: {
        stats: formattedTasksStats,
        progression: progressionData,
        total:
          formattedTasksStats.length > 0 ? formattedTasksStats[0].total : 0,
        dailyProgression,
        statusDistribution: {
          completed:
            formattedTasksStats.length > 0
              ? formattedTasksStats[0].completed
              : 0,
          inProgress:
            formattedTasksStats.length > 0
              ? formattedTasksStats[0].inProgress
              : 0,
          late:
            formattedTasksStats.length > 0 ? formattedTasksStats[0].late : 0,
          pending:
            formattedTasksStats.length > 0 ? formattedTasksStats[0].pending : 0,
        },
      },
      activities: {
        recent: enrichedRecentActivities,
        critical: enrichedCriticalTasks,
      },
    });
  } catch (err) {
    console.error("[User Dashboard Controller] Error:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques personnelles",
    });
  }
};