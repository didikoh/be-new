// src/components/BottomNavBar/BottomNavBar.tsx
import { FaHome, FaClock, FaUser, FaCalendar, FaWallet } from "react-icons/fa";
import "./BottomNavBar.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { GrYoga } from "react-icons/gr";
import { MdClass } from "react-icons/md";
import { useTranslation } from "react-i18next";

const BottomNavBar = () => {
  const { t } = useTranslation("nav");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const selectedPage = useUIStore((s) => s.selectedPage);
  const setSelectedPage = useUIStore((s) => s.setSelectedPage);

  const navItems = [
    { label: t("home"), icon: <FaHome />, value: "home", role: "student" },
    {
      label: t("schedule"),
      icon: <FaClock />,
      value: "schedule",
      role: "student",
    },
    // {
    //   label: "活动",
    //   icon: <FaShoppingBag />,
    //   value: "event",
    //   role: "student",
    // },
    {
      label: t("account"),
      icon: <FaUser />,
      value: "account",
      role: "student",
    },
    {
      label: t("coach_schedule"),
      icon: <GrYoga />,
      value: "coach_schedule",
      role: "coach",
    },
    // { label: "场地", icon: <FaCalendar />, value: "coach_site", role: "coach" },
    {
      label: t("coach_account"),
      icon: <FaUser />,
      value: "coach_account",
      role: "coach",
    },

    {
      label: t("admin_home"),
      icon: <FaHome />,
      value: "admin_home",
      role: "admin",
    },
    {
      label: t("admin_member"),
      icon: <FaCalendar />,
      value: "admin_member",
      role: "admin",
    },
    {
      label: t("admin_transaction"),
      icon: <FaWallet />,
      value: "admin_transaction",
      role: "admin",
    },
    {
      label: t("admin_course"),
      icon: <MdClass />,
      value: "admin_course",
      role: "admin",
    },
    // {
    //   label: "场地",
    //   icon: <GrYoga />,
    //   value: "admin_site",
    //   role: "admin",
    // },
    {
      label: t("admin_account"),
      icon: <FaUser />,
      value: "admin_account",
      role: "admin",
    },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(
        (item, index) =>
          (user ? user.role : "student") === item.role && (
            <div
              key={index}
              className={`nav-item ${
                item.value === selectedPage ? "active" : ""
              }`}
              onClick={() => {
                setSelectedPage(item.value);
                navigate("/" + item.value);
              }}
            >
              {item.icon}
              <div>{item.label}</div>
            </div>
          )
      )}
    </div>
  );
};

export default BottomNavBar;
