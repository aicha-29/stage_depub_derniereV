const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const cors = require("cors");
const path = require("path");
const http = require('http');
const socketio = require('socket.io');
<<<<<<< HEAD
const messageRoutes = require("./routes/message.routes");
=======

>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068


const notificationRoutes = require('./routes/notification.routes');
const authMiddleware = require("./middlewares/auth.middleware");
const adminDashboardRoutes = require("./routes/admin/dashboard.routes");
const profileRoutes = require("./routes/profile.routes");
const projectRoutes = require("./routes/admin/crudProjet.routes");
const tasksRoutes = require("./routes/admin/crudTasks.routes");
const employeesRoutes = require("./routes/admin/crudEmployees.routes");
const employeDashboard = require("./routes/employee/dashboard_employee.routes");
const projectEmployeRoute = require("./routes/employee/projects.routes");
const taskEmployeRoute = require("./routes/employee/task.routes");
//const getEmployeTask = require("./routes/employee/task.routes");
const getUsersStats = require("./routes/employee/dashboard_employee.routes");
const app = express();
const server = http.createServer(app);







app.use(express.urlencoded({ extended: true }));

dotenv.config();
connectDB();

app.use(cors({
<<<<<<< HEAD
  origin: ["http://localhost:5174","http://localhost:5173","http://localhost:5175"], // ou ajouter d'autres origins si besoin
=======
  origin: ["http://localhost:5174","http://localhost:5173"], // ou ajouter d'autres origins si besoin
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
  credentials: true
}));

app.use(express.json());


const io = socketio(server, {
  cors: {
<<<<<<< HEAD
    origin: ["http://localhost:5174","http://localhost:5173","http://localhost:5175"], // Remplacez par l'URL de votre frontend
=======
    origin: ["http://localhost:5174","http://localhost:5173"], // Remplacez par l'URL de votre frontend
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
    methods: ["GET", "POST"],
    credentials: true
  }
});
<<<<<<< HEAD

=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068
// Routes
app.use("/api/auth", authRoutes); //Toutes les routes définies dans authRoutes seront préfixées par /api/auth
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/projects", projectRoutes); //aussi pour ajouter un projet
app.use("/api/admin/employees", employeesRoutes);
app.use("/api/admin/tasks", tasksRoutes);
app.use("/public", express.static("public"));
//////////////ESPACE EMPLOYE ///////////////////////////
app.use("/api/employee/dashboard", getUsersStats);
app.use("/api/employee/projects", projectEmployeRoute);
app.use("/api/employee/tasks", taskEmployeRoute);
app.use('/api/notifications', notificationRoutes);
<<<<<<< HEAD
app.use("/api/messages", messageRoutes);
=======
>>>>>>> 60710b6d54c5e787e27567e0a08902e5df448068

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouvelle connexion Socket.IO:', socket.id);

  // Rejoindre des rooms basées sur l'userId
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} a rejoint sa room`);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Exportez io pour l'utiliser dans les contrôleurs
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));


