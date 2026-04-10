import { useEffect, useState } from "react";
import dayjs from "dayjs";
import styles from "./Schedule.module.css";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import CourseCard from "../components/CourseCard";
import { useUserContext } from "../contexts/UserContext";
import { isSevenDaysMY } from "../ultis/timeCheck";

const Schedule = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("schedule");
  const { user, setSelectedCourseId, setPrevPage, setLoading } =
    useAppContext();
  const { courses, allBookings } = useUserContext();
  const [allcourses, setAllCourses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const weekDates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, "day"));
  const filteredCourses = () => {
    if (allcourses.length === 0) return [];
    return allcourses.filter((course) =>
      dayjs(course.start_time).isSame(selectedDate, "day")
    );
  };

  useEffect(() => {
    setLoading(true);
    if (courses.length > 0) {
      const c1 = courses.filter(
        (course: any) =>
          isSevenDaysMY(course.start_time) &&
          (course.state == 0 || course.state == 1)
      );
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
        booking_status: allBookings.some(
          (booking: any) =>
            booking.course_id === course.id &&
            user &&
            booking.student_id == user.id &&
            booking.status != "cancelled"
        ),
      }));
      setAllCourses(c2);
    }
    setLoading(false);
  }, [courses, allBookings]);

  const handleDetail = (course_id: any) => {
    setPrevPage("/schedule");
    setSelectedCourseId(course_id);
    navigate("/coursedetail");
  };

  useEffect(() => {}, [selectedDate]);

  return (
    <div className={styles["schedule-container"]}>
      <div className={styles["schedule-card"]}>
        <div className={styles["date-strip"]}>
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={clsx(styles["date-item"], {
                [styles["active"]]: selectedDate.isSame(date, "date"),
              })}
              onClick={() => setSelectedDate(date)}
            >
              <div className={styles["day-number"]}>{date.date()}</div>
              <div className={styles["day-week"]}>{date.format("dd")}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles["course-list"]}>
        {filteredCourses().length > 0 ? (
          filteredCourses().reverse().map((item) => (
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
              is_booked={item.booking_status}
              course_pic={item.course_pic}
              bookBtnClickHandler={() => handleDetail(item.id)}
            />
          ))
        ) : (
          <p>{t("noCourse")}</p>
        )}
      </div>
    </div>
  );
};

export default Schedule;
