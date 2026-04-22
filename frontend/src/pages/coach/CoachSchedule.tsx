import classes from "./CoachSchedule.module.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { useNavigationStore } from "../../stores/useNavigationStore";
import { useDataStore } from "../../stores/useDataStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CourseCard from "../../components/CourseCard";
import { isSevenDaysMY } from "../../ultis/timeCheck";

const CoachSchedule = () => {
  const { t } = useTranslation("schedule");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setLoading = useUIStore((s) => s.setLoading);
  const setSelectedCourseId = useNavigationStore((s) => s.setSelectedCourseId);
  const setPrevPage = useNavigationStore((s) => s.setPrevPage);
  const courses = useDataStore((s) => s.courses);
  const allBookings = useDataStore((s) => s.allBookings);
  const [allCourses, setAllCourses] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    if (courses.length > 0) {
      const c1 = courses.filter(
        (course: any) =>
          isSevenDaysMY(course.start_time) &&
          (course.state == 0 || course.state == 1) &&
          course.coach_id == user.id
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
    setPrevPage("/coach_schedule");
    setSelectedCourseId(course_id);
    navigate("/coach_coursedetail");
  };

  const getDateRangeString = (): string => {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const format = (date: Date) => {
      const month = date.getMonth() + 1; // 月份从0开始所以要+1
      const day = date.getDate();
      return `${month}/${day}`;
    };

    return `${format(today)} ~ ${format(sevenDaysLater)}`;
  };

  return (
    <div className={classes["course-container"]}>
      <div className={classes["header"]}>
        <div className={classes["header-text"]}>
          {t("coachTitle")}
          <br />
          {getDateRangeString()}
        </div>
      </div>
      <div className={classes["course-list"]}>
        {allCourses &&
          allCourses.map((item: any) => (
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
          ))}
      </div>
    </div>
  );
};

export default CoachSchedule;
