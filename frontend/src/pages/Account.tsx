import { useNavigate, Link } from "react-router-dom";
import styles from "./Account.module.css";
import { useAppContext } from "../contexts/AppContext";
import { LuLogOut } from "react-icons/lu";
import { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import AccountSetting from "../components/AccountSetting";
import { PiPen } from "react-icons/pi";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import CourseCard from "../components/CourseCard";
import { useUserContext } from "../contexts/UserContext";
import { rules_en, rules_zh } from "../assets/rules/rule";
import { isThisWeekMY } from "../ultis/timeCheck";

const Account = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("account");
  const { user, logout, setPrevPage, setSelectedCourseId, setLoading } =
    useAppContext();
  const { courses, allBookings, cards } = useUserContext();
  const [filterValue, setFilterValue] = useState("booked");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const filters = [
    { name: t("booked"), value: "booked" },
    { name: t("paid"), value: "paid" },
    { name: t("cancelled"), value: "cancelled" },
    { name: t("completed"), value: "completed" },
  ];

  const joinUs = () => {
    const phone = "60187695676"; // 改成你自己的手机号（马来西亚手机号前面加60）
    const message = t("joinUsWhatsapp");
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!user || user.role !== "student") {
      return;
    }

    setLoading(true);
    if (courses.length > 0) {
      const c1 = courses.filter((course: any) => course.state != -1);
      let myCourses: any[] = [];
      allBookings.forEach((bookings: any) => {
        const c_temp_1 = c1.find(
          (course: any) =>
            course.id === bookings.course_id && bookings.student_id == user.id
        );
        if (c_temp_1) {
          const c_temp_2 = {
            ...c_temp_1,
            booking_count: allBookings
              .filter(
                (bookings: any) =>
                  bookings.course_id === c_temp_1.id &&
                  bookings.status != "cancelled"
              )
              .reduce(
                (sum: number, booking: any) => sum + (booking.head_count || 0),
                0
              ),
            booking_status: true,
            status: bookings.status,
          };
          myCourses.push(c_temp_2);
        }
      });

      let total_minutes = 0;
      allBookings.forEach((bookings: any) => {
        const c_temp_1 = c1.find(
          (course: any) =>
            course.id === bookings.course_id &&
            bookings.status === "completed" &&
            bookings.student_id == user.id &&
            isThisWeekMY(course.start_time)
        );
        if (!c_temp_1) return;
        total_minutes += c_temp_1.duration;
      });

      setAllCourses(myCourses);
      setTotalMinutes(total_minutes);
    }

    setLoading(false);
  }, [user, courses, allBookings]);

  const handleDetail = (course_id: any) => {
    setPrevPage("/account");
    setSelectedCourseId(course_id);
    navigate("/coursedetail");
  };

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
                  : "./assets/Avatar/Default.webp"
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

      {/* <div className={styles["account-stats-section"]}>
        <div className={styles["stat-item"]}>
          <div className={styles["stat-label"]}>{t("myBalance")}</div>
          <div className={styles["stat-value"]}>
            RM {user.balance - user.frozen_balance}
          </div>
        </div>
        <div className={clsx(styles["stat-item"], styles["right"])}>
          <div className={styles["stat-label"]}>{t("myPoint")}</div>
          <div className={styles["stat-value"]}>{user.point}</div>
        </div>
      </div> */}

      {cards.length === 0 && (
        <div className={styles["account-stats-section"]}>
          <div className={styles["stat-item"]}>
            <>
              <div className={styles["stat-label"]}>{t("notMember")}</div>
              <div
                className={clsx(styles["stat-value"], styles["join-us"])}
                onClick={joinUs}
              >
                {t("joinUs")}
              </div>
            </>
          </div>
        </div>
      )}

      {cards.length > 0 &&
        cards.map((card: any, index: number) => (
          <div className={styles["account-cards-section"]} key={index}>
            <div className={styles["account-cards-header"]}>
              {card.card_type_id == 2 ? t("cardPromotion") : t("cardMember")}
            </div>
            <div className={styles["account-cards-content"]}>
              <div className={styles["account-cards-item"]}>
                <span>{t("myBalance")}</span>
                <span>RM {card.balance - card.frozen_balance}</span>
              </div>
              <div className={styles["account-cards-item"]}>
                <span>{t("balanceUntil")}</span>
                <span>
                  {new Date(card.valid_balance_to).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

      <div className={styles["account-stats-section"]}>
        <div className={clsx(styles["stat-item"])}>
          <div className={styles["stat-label"]}>{t("studyThisWeek")}</div>
          <div className={styles["stat-value"]}>
            {Math.floor(totalMinutes / 60) > 0
              ? `${Math.floor(totalMinutes / 60)} ${t("hours")}`
              : ""}
            {totalMinutes % 60 > 0
              ? `${totalMinutes % 60} ${t("minutes")}`
              : Math.floor(totalMinutes / 60) === 0
              ? `0 ${t("minutes")}`
              : ""}
            {}
          </div>
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
            {t("viewRules")}
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
          {!allCourses ||
          allCourses.filter((item) => item.status === filterValue).length ===
            0 ? (
            <p style={{ padding: "1rem" }}>{t("noRecord")}</p>
          ) : (
            allCourses
              .filter((item) => item.status === filterValue)
              .map((item) => (
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
              {i18n.language.startsWith("zh") ? rules_zh : rules_en}
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

export default Account;
