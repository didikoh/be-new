import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";

const Construction = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setSelectedPage = useUIStore((s) => s.setSelectedPage);

  const handleBack = () => {
    switch (user?.role) {
      case "student":
        navigate("/Home");
        setSelectedPage("home");
        break;
      case "coach":
        navigate("/coach_schedule");
        setSelectedPage("coach_schedule");
        break;
      default:
        navigate("/Home");
        setSelectedPage("home");
        break;
    }
  };
  return (
    <div className="construction">
      ⚡页面还在开发中⚡
      <br />
      <button onClick={() => handleBack()} className="back-link">
        返回
      </button>
    </div>
  );
};

export default Construction;
