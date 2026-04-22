import { useTranslation } from "react-i18next";
import styles from "./CourseCard.module.css";
import { useAuthStore } from "../stores/useAuthStore";

interface CourseCardProps {
  name: string;
  coach_name: string;
  location: string;
  start_time: string;
  booking_count: number;
  price: number;
  price_m: number;
  min_book: number;
  is_booked: boolean;
  course_pic: string;
  bookBtnClickHandler: () => void;
}

const CourseCard = ({
  name,
  coach_name,
  location,
  start_time,
  booking_count,
  price_m,
  min_book,
  is_booked,
  course_pic,
  bookBtnClickHandler,
}: CourseCardProps) => {
  const { t } = useTranslation("courseCard");
  const user = useAuthStore((s) => s.user);
  return (
    <div className={styles["course-card"]}>
      <img
        src={
          course_pic
            ? "./assets/course/" + course_pic
            : "./assets/logo/new_logo.jpg"
        }
        alt="course background"
        className={styles["course-bg"]}
      />
      <div className={styles["course-overlay"]}>
        <div className={styles["course-time"]}>{start_time}</div>
        <div className={styles["course-header"]}>
          <div className={styles["course-title"]}>{name}</div>
        </div>
        <div className={styles["course-info"]}>
          <span>{coach_name}</span>
          <span> | </span>
          <span>{location || t("locationDefault")}</span>
        </div>
        <div className={styles["course-attend"]}>
          <span className={styles["attend-count"]}>
            {t("bookedCount")}：{booking_count}
          </span>
        </div>
        <div className={styles["course-attend"]}>
          <span className={styles["attend-count"]}>
            {t("memberPrice")}：RM
            {" " + price_m}
          </span>
        </div>
        <div className={styles["course-attend"]}>
          <span className={styles["attend-count"]}>
            {t("minBook")}：{min_book}
          </span>
        </div>
        <button
          className={styles["book-button"]}
          onClick={() => {
            bookBtnClickHandler();
          }}
        >
          {is_booked
            ? user.role == "student"
              ? t("alreadyBooked")
              : t("view")
            : t("bookNow")}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
