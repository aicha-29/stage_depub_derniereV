import React from "react";
import { Row, Col, Typography } from "antd";
import {
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DashboardOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import ProgressChart from "../../admin/stats/ProgressChart";
import ActivityItem from "../../admin/stats/ActivityItem";
import StatsCard from "../../admin/stats/StatsCard";

const { Title, Text } = Typography;

const GlobalStats = ({ data }) => {
  if (!data) return null;

  // Calculer les totaux pour les pourcentages
  const totalTasksByType = data.tasks.stats.reduce(
    (sum, t) => sum + t.total,
    0
  );
  const totalTasksByStatus = Object.values(
    data.tasks.statusDistribution
  ).reduce((sum, val) => sum + val, 0);

  return (
    <div className="global-stats">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Projets"
                value={data.projects.total}
                icon={<ProjectOutlined />}
                color="#457b9d"
                description={`Progression globale: ${data.projects.overallProgression}%`}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Tâches complétées"
                value={data.tasks.statusDistribution.completed}
                icon={<CheckCircleOutlined />}
                color="#06d6a0"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Tâches en retard"
                value={data.tasks.statusDistribution.late}
                icon={<WarningOutlined />}
                color="#e63946"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Progression moyenne"
                value={`${
                  data.tasks.progression.avgProgression?.toFixed(1) || 0
                }%`}
                icon={<DashboardOutlined />}
                color="#ffd166"
                description={
                  <>
                    <ClockCircleOutlined /> Suivi en temps réel
                  </>
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Tâches longues"
                value={
                  data.tasks.stats.find((t) => t.type === "long")?.total || 0
                }
                icon={<HourglassOutlined />}
                color="#a8dadc"
                description="Tâches à long terme"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatsCard
                title="Tâches journalières"
                value={
                  data.tasks.stats.find((t) => t.type === "daily")?.total || 0
                }
                icon={<CalendarOutlined />}
                color="#1d3557"
                description="Tâches quotidiennes"
              />
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <div className="stats-card">
            <Title level={4}>
              <BarChartOutlined /> Progression des tâches journalières (7 jours)
            </Title>
            <ProgressChart
              type="line"
              data={data.tasks.dailyProgression}
              height={300}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="stats-card">
            <Title level={4}>
              <PieChartOutlined /> Répartition par type long/journalière
            </Title>
            <ProgressChart
              type="pie"
              data={data.tasks.stats.map((t) => ({
                name: t.type === "daily" ? "Journalière" : "Long terme",
                value: t.total,
              }))}
              height={300}
            />
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="stats-card">
            <Title level={4}>
              <PieChartOutlined /> Statut des tâches longues
            </Title>
            <ProgressChart
              type="pie"
              data={[
                {
                  name: "Complétées",
                  value: data.tasks.statusDistribution.completed,
                },
                {
                  name: "En cours",
                  value: data.tasks.statusDistribution.inProgress,
                },
                {
                  name: "En retard",
                  value: data.tasks.statusDistribution.late,
                },
                {
                  name: "En attente",
                  value: data.tasks.statusDistribution.pending,
                },
              ]}
              height={300}
            />
          </div>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="activity-card">
                <Title level={4}>
                  <ClockCircleOutlined /> Activités récentes
                </Title>
                <div className="activity-list">
                  {data.activities.recent.slice(0, 5).map((activity) => (
                    <ActivityItem key={activity._id} activity={activity} />
                  ))}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="activity-card critical">
                <Title level={4}>
                  <WarningOutlined /> Tâches critiques
                </Title>
                <div className="activity-list">
                  {data.activities.critical.slice(0, 5).map((task) => (
                    <ActivityItem
                      key={task._id}
                      activity={task}
                      type="critical"
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default GlobalStats;
