import { Card, Progress } from "antd";

const StatsCard = ({ title, value, total, icon, color }) => {
  return (
    <Card className="admin-stats-indicator-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="admin-stats-indicator-content">
        <h3>{title}</h3>
        <div className="admin-stats-indicator-value">
          {icon && <span className="admin-stats-icon">{icon}</span>}
          <span>{value}</span>
          {total !== undefined && <span className="admin-stats-total"> / {total}</span>}
        </div>
        {total !== undefined && (
          <Progress 
            percent={Math.round((value / total) * 100)} 
            showInfo={false}
            strokeColor={color}
          />
        )}
      </div>
    </Card>
  );
};

export default StatsCard;