import { Card, Row, Col, Progress, Select, Tag, Divider } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, StarOutlined } from "@ant-design/icons";
import ProgressChart from "./ProgressChart";

const { Option } = Select;

const YearlyStats = ({ data }) => {
  if (!data) return null;

  const { year, stats, monthlyStats } = data;
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Trouver le meilleur mois
  const bestMonth = monthlyStats.reduce((prev, current) => 
    (prev.completionRate > current.completionRate) ? prev : current
  );

  return (
    <div className="admin-yearly-stats">
      <Row gutter={[20, 20]} className="admin-yearly-overview">
        <Col xs={24} md={12} lg={8}>
          <Card title="Résumé Annuel" className="admin-stats-card">
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

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="Progression Mensuelle" className="admin-stats-card">
            <ProgressChart 
              data={monthlyStats.map(m => ({
                month: m.month.split('-')[1],
                value: m.completionRate
              }))}
              type="bar"
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Activité par Mois" className="admin-stats-card">
            <ProgressChart 
              data={[
                { name: 'Terminées', value: stats.completed },
                { name: 'En cours', value: stats.inProgress },
                { name: 'En retard', value: stats.late },
                { name: 'En attente', value: stats.pending }
              ]}
              type="pie"
              height={300}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Détails par Mois" className="admin-stats-card">
        <Row gutter={[16, 16]} className="admin-monthly-stats-grid">
          {monthlyStats.map((month) => (
            <Col key={month.month} xs={24} sm={12} md={8} lg={6}>
              <div className={`admin-monthly-stat-item ${currentMonth === month.month ? 'current-month' : ''}`}>
                <h3>
                  {new Date(month.month).toLocaleString('default', { month: 'long' })}
                  {month.month === bestMonth.month && (
                    <StarOutlined style={{ color: '#ffd166', marginLeft: 8 }} />
                  )}
                </h3>
                
                <div className="admin-progress-container">
                  <div className="admin-progress-text">{month.completionRate}%</div>
                  <Progress 
                    percent={month.completionRate} 
                    strokeColor={month.completionRate >= 80 ? '#06d6a0' : month.completionRate >= 50 ? '#ffd166' : '#e63946'}
                    showInfo={false}
                  />
                </div>
                
                <div className="admin-stats-details">
                  <div className="admin-stats-row">
                    <span className="admin-stat-label">Terminées:</span>
                    <span className="admin-stat-value">{month.completed}</span>
                  </div>
                  <div className="admin-stats-row">
                    <span className="admin-stat-label">Total:</span>
                    <span className="admin-stat-value">{month.total}</span>
                  </div>
                  <div className="admin-stats-row">
                    <span className="admin-stat-label">En retard:</span>
                    <span className="admin-stat-value late">{month.late}</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="Meilleur Mois" className="admin-stats-card best-month">
        <div className="admin-best-month-container">
          <h3>
            {new Date(bestMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
            <StarOutlined style={{ color: '#ffd166', marginLeft: 8 }} />
          </h3>
          <Progress 
            type="circle" 
            percent={bestMonth.completionRate} 
            strokeColor="#06d6a0"
            width={120}
            format={() => (
              <div className="admin-circle-progress-text">
                <div>{bestMonth.completionRate}%</div>
                <div className="admin-circle-progress-subtext">de complétion</div>
              </div>
            )}
          />
          <div className="admin-best-month-details">
            <p><strong>{bestMonth.completed}</strong> tâches terminées sur <strong>{bestMonth.total}</strong></p>
            <p>Seulement <strong>{bestMonth.late}</strong> tâches en retard</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default YearlyStats;