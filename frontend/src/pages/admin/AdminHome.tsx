// src/pages/AdminHome.tsx
import "./AdminHome.css";
import { FaUser, FaCalendarCheck, FaWallet } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../api/services/adminService";
import type { AdminHomeData } from "../../api/types/admin";

const AdminHome = () => {
  const { user, setLoading } = useAppContext();
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState<AdminHomeData | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/home");
    }
  }, []);

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  useEffect(() => {
    setLoading(true);
    adminService
      .getHomeData()
      .then((data) => setHomeData(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-home-container">
      <h2 className="welcome">👋 欢迎回来，{user?.name}！</h2>
      <p className="date">今天是 {today}</p>

      <div className="stats-section">
        <div className="stat-card">
          <FaUser className="icon" />
          <div>
            <h3>用户人数</h3>
            <p>{homeData?.user_count}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaUser className="icon" />
          <div>
            <h3>会员人数</h3>
            <p>{homeData?.member_count}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaCalendarCheck className="icon" />
          <div>
            <h3>今日预约</h3>
            <p>{homeData?.booking_count}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaWallet className="icon" />
          <div>
            <h3>今日交易额</h3>
            <p>{homeData?.total_amount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
