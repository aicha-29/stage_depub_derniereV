import { Tag } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const ActivityItem = ({ activity, type }) => {
  const getStatusIcon = () => {
    switch (activity.status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#06d6a0' }} />;
      case 'inProgress':
        return <ClockCircleOutlined style={{ color: '#ffd166' }} />;
      case 'late':
        return <ExclamationCircleOutlined style={{ color: '#e63946' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#a8dadc' }} />;
    }
  };

  const getStatusTag = () => {
    switch (activity.status) {
      case 'completed':
        return <Tag color="#06d6a0">Terminée</Tag>;
      case 'inProgress':
        return <Tag color="#ffd166">En cours</Tag>;
      case 'late':
        return <Tag color="#e63946">En retard</Tag>;
      default:
        return <Tag color="#a8dadc">En attente</Tag>;
    }
  };

  return (
    <div className={`admin-activity-item ${type === 'critical' ? 'critical' : ''}`}>
      <div className="admin-activity-icon">
        {getStatusIcon()}
      </div>
      <div className="admin-activity-content">
        <h4>{activity.title}</h4>
        <p>{activity.project?.name || 'Aucun projet'}</p>
        <div className="admin-activity-meta">
          {getStatusTag()}
          {activity.deadline && (
            <Tag>
              {type === 'critical' 
                ? `${activity.daysLate} jours de retard` 
                : `Échéance: ${dayjs(activity.deadline).format('DD/MM/YYYY')}`}
            </Tag>
          )}
          {activity.progress !== undefined && (
            <Tag color="#457b9d">{activity.progress}% complété</Tag>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;