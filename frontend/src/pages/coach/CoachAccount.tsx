import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { useEffect, useState } from "react";
import { LuLogOut } from "react-icons/lu";
import { CgClose } from "react-icons/cg";
import styles from "./CoachAccount.module.css";
import { PiPen } from "react-icons/pi";
import AccountSetting from "../../components/AccountSetting";
import clsx from "clsx";
import { coach_rules_zh, coach_rules_en } from "../../assets/rules/rule";
import axios from "axios";
import { useTranslation } from "react-i18next";
import CourseCard from "../../components/CourseCard";
import { useUserContext } from "../../contexts/UserContext";
import { isThisMonthMY } from "../../ultis/timeCheck";

const CoachAccount = () => {
  const { t, i18n } = useTranslation("account");
  const { user, logout, setPrevPage, setSelectedCourseId, setLoading } =
    useAppContext();
  const { allBookings, courses } = useUserContext();
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState("0");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [classCountThisMonth, setClassCountThisMonth] = useState(0);
  const [studentCountThisMonth, setStudentCountThisMonth] = useState(0);

  const filters = [
    { name: t("coach.scheduled"), value: "0" },
    { name: t("coach.paid"), value: "1" },
    { name: t("completed"), value: "2" },
    { name: t("cancelled"), value: "-1" },
  ];

  const handleDetail = (course_id: any) => {
    setPrevPage("/coach_account");
    setSelectedCourseId(course_id);
    navigate("/coach_coursedetail");
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}coach/coach-get-course.php`, {
        user_id: user.id,
      })
      .then((res) => {
        setClassCountThisMonth(res.data.classCountThisMonth);
        setStudentCountThisMonth(res.data.studentCountThisMonth);
      })
      .catch((err) => alert("Error： " + err))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (courses.length > 0 && user) {
      const c1 = courses.filter((course: any) => course.coach_id == user.id);
      const c2 = c1.map((course: any) => ({
        ...course,
        booking_count: allBookings
          .filter(
            (bookings: any) =>
              bookings.course_id === course.id && bookings.status != "cancelled"
          )
          .reduce(
            (sum: number, booking: any) => sum + (booking.head_count || 0),
            0
          ),
        booking_status: true,
      }));
      setAllCourses(c2);

      const c3 = c1.filter(
        (course: any) => isThisMonthMY(course.start_time) && course.state != -1
      );

      const classCount = c3.length;
      const totalStudentCount = c3.reduce((total: any, course: any) => {
        const count = allBookings
          .filter(
            (booking: any) =>
              booking.course_id === course.id && booking.status !== "cancelled"
          )
          .reduce(
            (sum: number, booking: any) => sum + (booking.head_count || 0),
            0
          );
        return total + count;
      }, 0);

      setClassCountThisMonth(classCount);
      setStudentCountThisMonth(totalStudentCount);
    }
    setLoading(false);
  }, [courses, allBookings, user]);

  if (!user) {
    return (
      <div
        className={clsx(styles["account-container"], styles["not-logged-in"])}
      >
        <div className={styles["account-box"]}>
          <p>{t("notLoggedIn")}</p>
          <Link to="/login" className={styles["login-link"]}>
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["dashboard-container"]}>
      <div className={styles["dashboard-header"]}>
        <div className={styles["user-info"]}>
          <div className={styles["avatar"]}>
            <img
              src={
                user.profile_pic
                  ? import.meta.env.VITE_API_BASE_URL + user.profile_pic
                  : "/assets/Avatar/Default.webp"
              }
              alt="avatar"
            />
          </div>
          <div className={styles["login-text"]}>
            {user.name}
            <br />
            <span>{user.phone}</span>
          </div>
        </div>

        <div className={styles["account-dashboard-btns"]}>
          <button
            className={styles["account-dashboard-btn"]}
            onClick={() => {
              setSettingOpen(true);
            }}
          >
            <PiPen />
          </button>
          <button
            className={styles["account-dashboard-btn"]}
            onClick={async () => {
              await logout();
            }}
          >
            <LuLogOut />
          </button>
        </div>
      </div>

      <div className={styles["account-stats-section"]}>
        <div className={styles["stat-item"]}>
          <div className={styles["stat-label"]}>
            {t("coach.classCountThisMonth")}
          </div>
          <div className={styles["stat-value"]}>{classCountThisMonth}</div>
        </div>
        <div className={clsx(styles["stat-item"], styles["right"])}>
          <div className={styles["stat-label"]}>
            {t("coach.studentCountThisMonth")}
          </div>
          <div className={styles["stat-value"]}>{studentCountThisMonth}</div>
        </div>
      </div>

      <div className={clsx(styles["account-stats-section"], styles["rule"])}>
        <div className={clsx(styles["stat-item"], styles["rule"])}>
          <div
            className={clsx(styles["stat-value"], styles["rule"])}
            onClick={() => {
              setRuleOpen(true);
            }}
          >
            {t("coach.viewCoachRules")}
          </div>
        </div>
      </div>

      <div className={styles["account-couses-section"]}>
        <div className={styles["account-couses-strip"]}>
          {filters.map((item, index) => (
            <button
              className={clsx(
                styles["account-couses-filter"],
                filterValue === item.value && styles["active"]
              )}
              key={index}
              onClick={() => setFilterValue(item.value)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className={styles["account-couses-list"]}>
          {Array.isArray(allCourses) && allCourses.length > 0 ? (
            allCourses.filter((item) => item.state == filterValue).length ===
            0 ? (
              <p style={{ padding: "1rem" }}>{t("noRecord")}</p>
            ) : (
              allCourses
                .filter((item) => item.state == filterValue)
                .map((item: any) => (
                  <CourseCard
                    key={item.id}
                    name={item.name}
                    coach_name={item.coach_name}
                    location={item.location}
                    start_time={item.start_time}
                    booking_count={item.booking_count}
                    price={item.price}
                    price_m={item.price_m}
                    min_book={item.min_book}
                    is_booked={true}
                    course_pic={item.course_pic}
                    bookBtnClickHandler={() => handleDetail(item.id)}
                  />
                ))
            )
          ) : (
            <p style={{ padding: "1rem" }}>{t("noRecord")}</p>
          )}
        </div>
      </div>

      <div className={styles["footer-text"]}>
        Be Studio 2025 All Rights Reserved
        <br />
        <a
          href="https://bestudiobp.com/be-rule/tnc.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", marginRight: 12 }}
          className={styles["footer-text"]}
        >
          Privacy Policy
        </a>
        <a
          href="https://bestudiobp.com/be-rule/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
          className={styles["footer-text"]}
        >
          T&amp;C
        </a>
      </div>

      {ruleOpen && (
        <div className={styles["rule-overlay"]}>
          <div className={styles["rule-container"]}>
            <span className={styles["rule-text"]}>
              {" "}
              {i18n.language.startsWith("zh") ? coach_rules_zh : coach_rules_en}
            </span>
            <button
              className={styles["close-rule-button"]}
              onClick={() => setRuleOpen(false)}
            >
              <CgClose className={styles["close-icon"]} />
            </button>
          </div>
        </div>
      )}

      {settingOpen && <AccountSetting setSettingOpen={setSettingOpen} />}
    </div>
  );
};

export default CoachAccount;
