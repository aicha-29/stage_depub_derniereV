import { Card, Row, Col, Progress, Tag, Divider } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ProgressChart from "./ProgressChart";

const MonthlyStats = ({ data }) => {
  if (!data) return null;

  const { month, stats, dailyStats } = data;
  const currentDay = dayjs().format("YYYY-MM-DD");

  return (
    <div className="admin-monthly-stats">
      <Row gutter={[20, 20]} className="admin-monthly-overview">
        <Col xs={24} md={12} lg={8}>
          <Card title="Résumé Mensuel" className="admin-stats-card">
            <div className="admin-stat-item">
              <h4>Tâches Total</h4>
              <p className="admin-stat-value">{stats.total}</p>
            </div>
            <div className="admin-stat-item">
              <h4>Tâches Terminées</h4>
              <p className="admin-stat-value">{stats.completed}</p>
            </div>
            <div className="admin-stat-item">
              <h4>Taux de Complétion</h4>
              <p className="admin-stat-value">{stats.completionRate}%</p>
              <Progress 
                percent={stats.completionRate} 
                status={stats.completionRate < 50 ? "exception" : "success"}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Répartition par Type" className="admin-stats-card">
            <div className="admin-stat-item">
              <h4>Journalières</h4>
              <p className="admin-stat-value">{stats.dailyCount}</p>
            </div>
            <div className="admin-stat-item">
              <h4>Long Terme</h4>
              <p className="admin-stat-value">{stats.longCount}</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={24} lg={8}>
          <Card title="Statut des Tâches" className="admin-stats-card">
            <div className="admin-stat-item">
              <h4>En Cours</h4>
              <p className="admin-stat-value">{stats.inProgress}</p>
            </div>
            <div className="admin-stat-item">
              <h4>En Retard</h4>
              <p className="admin-stat-value">{stats.late}</p>
            </div>
            <div className="admin-stat-item">
              <h4>En Attente</h4>
              <p className="admin-stat-value">{stats.pending}</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Progression Journalière" className="admin-stats-card">
        <ProgressChart 
          data={dailyStats.map(d => ({
            date: d.date,
            value: d.completionRate
          }))}
          type="area"
          height={300}
        />
      </Card>

       {/* <Card title="Détails par Jour" className="admin-stats-card">
        <Row gutter={[16, 16]} className="admin-daily-stats-grid">
          {dailyStats.map((day) => (
            <Col key={day.date} xs={12} sm={8} md={6} lg={4}>
              <div className={`admin-daily-stat-item ${currentDay === day.date ? 'current-day' : ''}`}>
                <h4>{dayjs(day.date).format("DD")}</h4>
                <p className="admin-completion-rate">{day.completionRate}%</p>
                <Progress 
                  percent={day.completionRate} 
                  size="small" 
                  status={day.completionRate < 50 ? "exception" : "success"}
                />
                <div className="admin-task-count">
                  <Tag color="#06d6a0">{day.completed}✓</Tag>
                  <Tag color="#457b9d">{day.total}Σ</Tag>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>  */}
      <Card title="Détails par Jour" className="admin-stats-card">
  <div className="daily-progress-table">
    {dailyStats.map((day) => (
      <div key={day.date} className={`daily-progress-row ${currentDay === day.date ? 'current-day' : ''}`}>
        <div className="day-header">
          <span className="day-name">{dayjs(day.date).format("ddd")}.</span>
          <span className="day-date">{dayjs(day.date).format("D MMM")}</span>
        </div>
        <div className="day-status">
            <CheckCircleOutlined style={{ color: "#06d6a0", marginRight: 8 }} />
          <span>{day.completed}/{day.total} tâches</span>
        </div>
        <div className="day-progress">
          <Progress 
            percent={day.completionRate} 
            showInfo={false}
            strokeColor={day.completionRate < 50 ? "#e63946" : "#06d6a0"}
            trailColor="#f0f0f0"
          />
          <span className="progress-value">{day.completionRate}%</span>
        </div>
      </div>
    ))}
  </div>
</Card>

    </div>
  );
};

export default MonthlyStats;