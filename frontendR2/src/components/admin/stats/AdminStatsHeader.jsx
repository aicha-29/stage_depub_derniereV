import { useState } from "react";
import { Button, DatePicker, Select } from "antd";
import { CalendarOutlined, AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminStatsHeader = ({ currentType, onPeriodChange }) => {
  const [periodType, setPeriodType] = useState(currentType);
  const [customDate, setCustomDate] = useState(dayjs());
  const [customMonth, setCustomMonth] = useState(dayjs());
  const [customYear, setCustomYear] = useState(dayjs().year());

  const handleTypeChange = (type) => {
    setPeriodType(type);
    let params = { type };
    
    if (type === "daily") {
      params.date = customDate.format("YYYY-MM-DD");
    } else if (type === "monthly") {
      params.year = customMonth.year();
      params.month = customMonth.month() + 1;
    } else if (type === "yearly") {
      params.year = customYear;
    }
    
    onPeriodChange(params);
  };

  const handleDateChange = (date) => {
    setCustomDate(date);
    onPeriodChange({
      type: "daily",
      date: date.format("YYYY-MM-DD")
    });
  };

  const handleMonthChange = (date) => {
    setCustomMonth(date);
    onPeriodChange({
      type: "monthly",
      year: date.year(),
      month: date.month() + 1
    });
  };

  const handleYearChange = (year) => {
    setCustomYear(year);
    onPeriodChange({
      type: "yearly",
      year
    });
  };

  return (
    <div className="admin-stats-header">
      <div className="admin-stats-period-selector">
        <div className="admin-view-buttons">
          <Button
            type={periodType === "global" ? "primary" : "default"}
            icon={<AppstoreOutlined />}
            onClick={() => handleTypeChange("global")}
          >
            Vue Globale
          </Button>
          <Button
            type={periodType === "daily" ? "primary" : "default"}
            icon={<CalendarOutlined />}
            onClick={() => handleTypeChange("daily")}
          >
            Journalier
          </Button>
          <Button
            type={periodType === "monthly" ? "primary" : "default"}
            icon={<BarsOutlined />}
            onClick={() => handleTypeChange("monthly")}
          >
            Mensuel
          </Button>
          <Button
            type={periodType === "yearly" ? "primary" : "default"}
            icon={<BarsOutlined />}
            onClick={() => handleTypeChange("yearly")}
          >
            Annuel
          </Button>
        </div>

        {periodType === "daily" && (
          <DatePicker
            value={customDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            className="admin-date-picker"
          />
        )}

        {periodType === "monthly" && (
          <DatePicker
            picker="month"
            value={customMonth}
            onChange={handleMonthChange}
            format="MM/YYYY"
            className="admin-month-picker"
          />
        )}

        {periodType === "yearly" && (
          <Select
            value={customYear}
            onChange={handleYearChange}
            className="admin-year-select"
          >
            {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(year => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
};

export default AdminStatsHeader;