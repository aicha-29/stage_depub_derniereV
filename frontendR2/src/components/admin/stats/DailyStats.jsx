import { Card, Table, Progress, Tag } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";

const DailyStats = ({ data }) => {
  if (!data) return null;

  const { date, stats, tasks } = data;

  const columns = [
    {
      title: 'Tâche',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Projet',
      dataIndex: ['project', 'name'],
      key: 'project',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'daily' ? '#457b9d' : '#1d3557'}>
          {type === 'daily' ? 'Journalière' : 'Long terme'}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let icon, color;
        switch (status) {
          case 'completed':
            icon = <CheckCircleOutlined />;
            color = '#06d6a0';
            break;
          case 'inProgress':
            icon = <ClockCircleOutlined />;
            color = '#ffd166';
            break;
          case 'late':
            icon = <ExclamationCircleOutlined />;
            color = '#e63946';
            break;
          default:
            icon = <ClockCircleOutlined />;
            color = '#a8dadc';
        }
        return <Tag icon={icon} color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Progression',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />,
    },
  ];

  return (
    <div className="admin-daily-stats">
      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <Card title="Résumé" className="admin-stats-card">
            <div className="admin-stats-summary">
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
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Répartition par Type" className="admin-stats-card">
            <div className="admin-stats-summary">
              <div className="admin-stat-item">
                <h4>Journalières</h4>
                <p className="admin-stat-value">{stats.dailyCount}</p>
              </div>
              <div className="admin-stat-item">
                <h4>Long Terme</h4>
                <p className="admin-stat-value">{stats.longCount}</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Statut des Tâches" className="admin-stats-card">
            <div className="admin-stats-summary">
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
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={`Tâches du ${date}`} className="admin-stats-card">
        <Table 
          dataSource={tasks} 
          columns={columns} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default DailyStats;