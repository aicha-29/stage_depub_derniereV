import { useParams } from "react-router-dom";
import StatsPage from "./StatsPage";

const StatsPageWrapper = () => {
  const { id } = useParams();
  return <StatsPage employeeId={id} />;
};

export default StatsPageWrapper;