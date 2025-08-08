
import { Row, Col, Card, Progress, Divider } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import StatsCard from "./StatsCard";
import ActivityItem from "./ActivityItem";
import ProgressChart from "./ProgressChart";

const GlobalStats = ({ data }) => {
  if (!data) return null;

  const { projects, tasks, activities } = data;

  // Vérifie si tasks.stats est un tableau, sinon fallback sur un tableau vide
  const taskStats = Array.isArray(tasks?.stats) ? tasks.stats : [];

  // Calculer le total des tâches complétées et des tâches en général
  const totalCompleted = taskStats.reduce(
    (sum, stat) => sum + (stat.completed || 0),
    0
  );
  const totalTasks = taskStats.reduce(
    (sum, stat) => sum + (stat.total || 0),
    0
  );

  tasks.completed = totalCompleted;
  tasks.total = totalTasks;

  // Trouver les stats des tâches long terme
  const longTermTasks = taskStats.find((stat) => stat.type === "long") || {
    completed: 0,
    inProgress: 0,
    late: 0,
    pending: 0,
  };

  const taskStatusData = [
    { name: "Terminées", value: longTermTasks.completed },
    { name: "En cours", value: longTermTasks.inProgress },
    { name: "En retard", value: longTermTasks.late },
    { name: "En attente", value: longTermTasks.pending },
  ];

  return (
    <div className="admin-global-stats">
      {/* Section 1: Overview Cards - Projects */}
      <Row gutter={[20, 20]} className="admin-overview-cards">
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatsCard
            title="Projets Total"
            value={projects.total}
            icon={<CheckCircleOutlined />}
            color="#1d3557"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatsCard
            title="Projets Actifs"
            value={projects.active}
            icon={<CheckCircleOutlined />}
            color="#457b9d"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatsCard
            title="Projets Terminés"
            value={projects.completed}
            icon={<CheckCircleOutlined />}
            color="#06d6a0"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <StatsCard
            title="Progression Moyenne"
            value={`${projects.overallProgression}%`}
            icon={
              <Progress
                type="circle"
                percent={projects.overallProgression}
                size={40}
              />
            }
            color="#a8dadc"
          />
        </Col>
      </Row>

      <Divider orientation="left">Progression</Divider>

      {/* Section 2: Progress Charts */}
      <Row gutter={[20, 20]} className="admin-progress-section">
        <Col xs={24} lg={12}>
          <Card
            title="Progression Journalière (7 derniers jours)"
            className="admin-stats-card"
          >
            <ProgressChart
              data={
                Array.isArray(tasks.dailyProgression)
                  ? tasks.dailyProgression
                  : []
              }
              type="line"
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Statut des Tâches (Long terme)"
            className="admin-stats-card"
          >
            <ProgressChart data={taskStatusData} height={300} />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Tâches</Divider>

      {/* Section 3: Tasks Stats */}
      <Row gutter={[20, 20]} className="admin-tasks-stats">
        <Col xs={24} lg={12}>
          <Card
            title="Répartition des Tâches"
            className="admin-stats-card"
            style={{ height: "100%" }}
          >
            <div className="admin-task-stats-vertical">
              <div className="admin-task-stat-item">
                <h4>Tâches Total</h4>
                <Progress
                  percent={
                    tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0
                  }
                  status={
                    tasks.total > 0 &&
                    (tasks.completed / tasks.total) * 100 < 50
                      ? "exception"
                      : "success"
                  }
                />
                <div className="admin-task-stat-details">
                  <span>
                    {tasks.completed}/{tasks.total}
                  </span>
                  <span>
                    {tasks.total > 0
                      ? Math.round((tasks.completed / tasks.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {taskStats.map((stat) => (
                <div key={stat.type} className="admin-task-stat-item">
                  <h4>
                    {stat.type === "daily" ? "Journalières" : "Long terme"}
                  </h4>
                  <Progress
                    percent={stat.completionRate}
                    status={stat.completionRate < 50 ? "exception" : "success"}
                  />
                  <div className="admin-task-stat-details">
                    <span>
                      {stat.completed}/{stat.total}
                    </span>
                    <span>{stat.completionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Activités Récentes"
            className="admin-activity-card"
            styles={{
              header: { borderLeft: "4px solid #06d6a0" },
              height: "100%",
            }}
          >
            <div className="admin-activity-list">
              {activities?.recent?.map((activity) => (
                <ActivityItem
                  key={activity._id}
                  activity={activity}
                  type="recent"
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Alertes</Divider>

      {/* Section 4: Critical Activities */}
      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <Card
            title="Tâches Critiques"
            className="admin-activity-card"
            styles={{ header: { borderLeft: "4px solid #e63946" } }}
          >
            <div className="admin-activity-list">
              {activities?.critical?.map((activity) => (
                <ActivityItem
                  key={activity._id}
                  activity={activity}
                  type="critical"
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GlobalStats;
