import { FaFacebook, FaPhone } from "react-icons/fa";
import clsx from "clsx";
import homeStyle from "./Home.module.css";
import { ImInstagram } from "react-icons/im";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useNavigationStore } from "../stores/useNavigationStore";
import { useDataStore } from "../stores/useDataStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CourseCard from "../components/CourseCard";
import { isSevenDaysMY, isTodayMY } from "../ultis/timeCheck";
// import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setLoading = useUIStore((s) => s.setLoading);
  const setSelectedCourseId = useNavigationStore((s) => s.setSelectedCourseId);
  const setPrevPage = useNavigationStore((s) => s.setPrevPage);
  const courses = useDataStore((s) => s.courses);
  const allBookings = useDataStore((s) => s.allBookings);
  const [booked, SetBooked] = useState<any[]>([]);
  const [recommended, SetRecommended] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    if (courses.length > 0) {
      const c1 = courses.filter(
        (course: any) =>
          isTodayMY(course.start_time) &&
          (course.state == 0 || course.state == 1)
      );
      //add status and count
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
      SetRecommended(c2);

      if (allBookings.length > 0 && user && user.role == "student") {
        const c1 = courses.filter(
          (course: any) =>
            isSevenDaysMY(course.start_time) &&
            (course.state == 0 || course.state == 1)
        );
        //get my booking
        const c2 = c1.filter((course: any) =>
          allBookings.some(
            (booking: any) =>
              booking.course_id === course.id &&
              booking.student_id == user.id &&
              booking.status != "cancelled"
          )
        );
        // add count
        const c3 = c2.map((course: any) => ({
          ...course,
          booking_count: allBookings
            .filter(
              (bookings: any) =>
                bookings.course_id === course.id &&
                bookings.status != "cancelled"
            )
            .reduce(
              (sum: number, booking: any) => sum + (booking.head_count || 0),
              0
            ),
        }));
        SetBooked(c3);
      }
    }
    setLoading(false);
  }, [courses, allBookings]);

  const handleDetail = (course_id: any) => {
    setPrevPage("/home");
    setSelectedCourseId(course_id);
    navigate("/coursedetail");
  };

  return (
    <div className={homeStyle["student-homepage"]}>
      <div
        className={clsx(homeStyle["home-card"], homeStyle["studio-intro-card"])}
      >
        <div className={homeStyle["studio-header"]}>
          <img
            src="./assets/logo/logo.png"
            alt="logo"
            className={homeStyle["studio-logo"]}
          />
          <div className={homeStyle["studio-info"]}>
            <div className={homeStyle["studio-name"]}>Be Studio</div>
            <div className={homeStyle["studio-contact"]}>
              {t("contactAdmin")}：xiaohann
            </div>
          </div>
        </div>

        <div className={homeStyle["studio-detail"]}>
          <div className={homeStyle["studio-detail-left"]}>
            <div className={homeStyle["studio-phone"]}>
              {t("contact")}：<span>0187695676</span>
            </div>
            <div className={homeStyle["studio-address"]}>
              {t("address")}：
              <span>
                No. 34A & 34B, Jalan Kundang 1,
                <br /> Taman Bukit Pasir, 83000 Batu Pahat,
                <br /> Johor Darul Ta'zim
              </span>
            </div>
          </div>
        </div>

        <div className={homeStyle["studio-social"]}>
          <button
            className={clsx(
              homeStyle["social-icon-btn"],
              homeStyle["whatsapp"]
            )}
            onClick={() => window.open("https://wa.me/60187695676", "_blank")}
          >
            <FaPhone className={homeStyle["social-icon"]} />
          </button>
          <button
            className={clsx(homeStyle["social-icon-btn"], homeStyle["insta"])}
            onClick={() =>
              window.open("https://www.instagram.com/befitness_bp/", "_blank")
            }
          >
            <ImInstagram className={homeStyle["social-icon"]} />
          </button>
          <button
            className={clsx(
              homeStyle["social-icon-btn"],
              homeStyle["facebook"]
            )}
            onClick={() =>
              window.open(
                "https://www.facebook.com/profile.php?id=100083076293256",
                "_blank"
              )
            }
          >
            <FaFacebook className={homeStyle["social-icon"]} />
          </button>
        </div>
      </div>

      <div className={homeStyle["home-card"]}>
        <img
          className={homeStyle["time-table"]}
          src="./time_table.jpg"
          alt="Time Table"
        />
      </div>

      {/* my appointment */}
      <div
        className={clsx(homeStyle["home-card"], homeStyle["appointment-card"])}
      >
        <div className={homeStyle["appointment-header"]}>
          {t("section3/4.title3")}
        </div>
        <div className={homeStyle["appointment-list"]}>
          {!booked || booked.length === 0 ? (
            <p style={{ padding: "1rem" }}>{t("section3/4.noData3")}</p>
          ) : (
            booked.map((item: any) => (
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

      {/* courses recommend */}
      <div className={clsx(homeStyle["home-card"], homeStyle["courses-card"])}>
        <div className={homeStyle["courses-header"]}>
          {t("section3/4.title4")}
        </div>
        <div className={homeStyle["courses-list"]}>
          {!recommended || recommended.length === 0 ? (
            <p style={{ padding: "1rem" }}>{t("section3/4.noData4")}</p>
          ) : (
            recommended.map((item) => (
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
                is_booked={
                  item.booking_status && item.booking_status != "cancelled"
                }
                course_pic={item.course_pic}
                bookBtnClickHandler={() => handleDetail(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
