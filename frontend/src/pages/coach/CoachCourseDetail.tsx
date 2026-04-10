import { MdArrowBack } from "react-icons/md";
import { useAppContext } from "../../contexts/AppContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import axios from "axios";
import styles from "./CoachCourseDetail.module.css";
import { useTranslation } from "react-i18next";

const stateLabelMap: Record<number, string> = {
  "-1": "课程已取消",
  0: "取消课程 / 强制开始",
  1: "课程已开始",
  2: "课程已结算",
};

const stateLabelMap2: Record<number, string> = {
  "-1": "课程已取消",
  0: "开始",
  1: "课程已开始",
  2: "课程已结算",
};

const CoachCourseDetail = () => {
  const { t, i18n } = useTranslation("detail");
  const { user, selectedCourseId, prevPage, setSelectedPage, setLoading } =
    useAppContext();
  const navigate = useNavigate();
  const [bookPopupVisible, setBookPopupVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [booked, setBooked] = useState<any[]>([]);
  const [cancelStudents, setCancelStudents] = useState<any>(null);
  const [totalBooked, setTotalBooked] = useState(0);
  const [cancelCoursePopupVisible, setCancelCoursePopupVisible] =
    useState(false);

  const handleBackButtonClick = () => {
    navigate(prevPage);
  };

  useEffect(() => {
    if (user.role !== "coach") {
      i18n.changeLanguage("zh");
    }
    if (!selectedCourseId) {
      return;
    }
    setLoading(true);
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/coach/coach-course-detail.php`,
        {
          course_id: selectedCourseId,
        }
      )
      .then((res) => {
        setSelectedCourse(res.data.course);
        setBooked(res.data.bookings);
        const sum = res.data.bookings.reduce(
          (acc: any, cur: any) => acc + cur.head_count,
          0
        );
        setTotalBooked(sum);
      })
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  const handleStartCourse = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    await axios
      .post(`${import.meta.env.VITE_API_BASE_URL}admin/start-course.php`, {
        course_id: selectedCourseId,
      })
      .then((res) => {
        if (res.data.success) {
          navigate("/admin_course");
        } else {
          alert("出错了");
        }
      });
    setLoading(false);
    // setBookPopupVisible(false);
    // 你可以显示“扣款完成”或刷新页面
    // 建议重新请求当前课程详情数据
    // window.location.reload(); // 或用 setRefresh
  };

  const handleCancel = async () => {
    if (!cancelStudents) return;
    setLoading(true);
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}admin/cancel-booking.php`,
      {
        booking_id: cancelStudents.id,
      }
    );

    if (res.data.success) {
    }
    setCancelStudents(null);
    // 重新加载
    setBooked(booked.filter((b) => b.id !== cancelStudents.id));
    setLoading(false);
  };

  const handleRemoveCourse = async () => {
    setLoading(true);
    await axios
      .post(`${import.meta.env.VITE_API_BASE_URL}admin/remove-course.php`, {
        course_id: selectedCourseId,
      })
      .then((res) => {
        alert(res.data.message);
      });
    setLoading(false);
  };

  if (!selectedCourse) {
    return (
      <div className={styles.detailLoadingContainer}>
        <button className={styles.backButton} onClick={handleBackButtonClick}>
          <MdArrowBack className={styles.backIcon} />
        </button>
        <div>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <button className={styles.backButton} onClick={handleBackButtonClick}>
          <MdArrowBack className={styles.backIcon} />
        </button>
        <div className={styles.detailHeaderText}>{t("courseDetail")}</div>
      </div>
      <div className={styles.detailBanner}>
        <img
          src={
            selectedCourse.course_pic
              ? "./assets/course/" + selectedCourse.course_pic
              : "./assets/logo/new_logo.jpg"
          }
          alt="couse banner"
          className={styles.detailBg}
        />
      </div>
      <div className={styles.detailContent}>
        <div className={clsx(styles.detailCard, styles.title)}>
          <div className={styles.courseTitleRow}>
            {/* <span className="course-tag">团课</span> */}
            <h2>{selectedCourse.name}</h2>
            {/* <span className={styles.courseShare}>🔗 分享</span> */}
          </div>
          <div className={styles.courseMeta}>
            <div>
              {t("duration")}
              <br />
              <strong>{selectedCourse.duration} min</strong>
            </div>
            <div>
              {t("minBook")}
              <br />
              <strong>
                {selectedCourse.min_book} {t("popupUnit")}
              </strong>
            </div>
          </div>
        </div>
        <div className={clsx(styles.detailCard, styles.description)}>
          <div className={styles.instructorInfo}>
            <img
              src={
                selectedCourse.coach_pic
                  ? import.meta.env.VITE_API_BASE_URL + selectedCourse.coach_pic
                  : "/assets/Avatar/Default.webp"
              }
              className={styles.avatar}
              alt="coach avatar"
            />
            <div>
              <strong>{selectedCourse.coach_name}</strong>
            </div>
          </div>
          <div className={styles.descRow}>
            {t("classroom")} <span>{selectedCourse.location}</span>
          </div>
          {/* <div className={styles.descRow}>
            {t("intro")} <span>{t("noIntro")}</span>
          </div> */}
        </div>
        <div className={clsx(styles.detailCard, styles.details)}>
          <div className={styles.infoRow}>
            {t("classTime")}
            <span>{selectedCourse.start_time}</span>
          </div>
          <div className={styles.infoRow}>
            {t("nonMemberPrice")}
            <span>RM{selectedCourse.price}</span>
          </div>
          <div className={styles.infoRow}>
            {t("memberPrice")}
            <span>RM{selectedCourse.price_m}</span>
          </div>
          <div className={styles.infoRow}>
            {t("bookingCount")}
            <div className={styles.peopleCount}>
              <span>{totalBooked}</span>
            </div>
          </div>
          {/* <div className="info-row">
              预约备注：
              <input placeholder="请填写备注" maxLength={200} />
            </div> */}
        </div>

        <div className={clsx(styles.detailCard, styles.bookedStudents)}>
          <h3>{t("bookedCount")}</h3>
          {booked.filter((student) => student.status !== "cancelled").length ===
          0 ? (
            <p>{t("coach.noBooked")}</p>
          ) : (
            <ul className={styles.studentList}>
              {booked
                .filter((student) => student.status !== "cancelled")
                .map((student) => (
                  <li key={student.id} className={styles.studentRow}>
                    <div>
                      <strong>{student.student_name}</strong>（
                      {student.student_phone}） {student.head_count}{" "}
                      {t("popupUnit")}
                    </div>
                    {student.status === "booked" && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setCancelStudents(student)}
                      >
                        {t("coach.cancelBooking")}
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      <div className={styles.detailFooter}>
        {user && user.role == "admin" && (
          <>
            {totalBooked < selectedCourse.min_book ? (
              <button
                className={clsx(
                  styles.detailBookButton,
                  styles.cancelCourseButton
                )}
                onClick={() => {
                  if (selectedCourse.state !== 0) {
                    navigate("/admin_course");
                    setSelectedPage("admin_course");
                  } else {
                    setCancelCoursePopupVisible(true);
                  }
                }}
              >
                {stateLabelMap[selectedCourse.state] ?? "未知状态"}
              </button>
            ) : (
              <button
                className={styles.detailBookButton}
                onClick={() => {
                  if (selectedCourse.state !== 0) {
                    navigate("/admin_course");
                    setSelectedPage("admin_course");
                  } else {
                    setBookPopupVisible(true);
                  }
                }}
              >
                {stateLabelMap2[selectedCourse.state] ?? "未知状态"}
              </button>
            )}
          </>
        )}
        {user && user.role == "coach" && (
          <button
            className={styles.detailBookButton}
            onClick={() => {
              navigate("/coach_schedule");
              setSelectedPage("coach_schedule");
            }}
          >
            {t("coach.returnSchedule")}
          </button>
        )}
      </div>

      {bookPopupVisible && (
        <div className={styles.bookPopup}>
          <div className={styles.popupContent}>
            <h2>开始课程</h2>
            <p>课程名称: {selectedCourse.name}</p>
            <p>时间: {selectedCourse.start_time}</p>
            <p>人数: {totalBooked} 人</p>
            <div className={styles.popupBtns}>
              <button
                onClick={() => {
                  handleStartCourse();
                }}
              >
                确认
              </button>
              <button onClick={() => setBookPopupVisible(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {cancelStudents && (
        <div className={styles.cancelPopup}>
          <div className={styles.popupContent}>
            <h2>{t("coach.cancelBooking")}</h2>
            <p>
              {t("coach.studentName")}
              {cancelStudents.student_name}
            </p>
            <p>
              {t("coach.studentHeadCount")}
              {cancelStudents.head_count} {t("popupUnit")}
            </p>
            <div className={styles.popupBtns}>
              <button
                onClick={() => {
                  handleCancel();
                }}
              >
                {t("popupConfirm")}
              </button>
              <button onClick={() => setCancelStudents(null)}>
                {t("popupClose")}
              </button>
            </div>
          </div>
        </div>
      )}
      {cancelCoursePopupVisible && (
        <div className={styles.bookPopup}>
          <div className={styles.popupContent}>
            <h2>预约人数不足</h2>
            <p>课程名称: {selectedCourse.name}</p>
            <p>时间: {selectedCourse.start_time}</p>
            <p>
              当前预约: <span style={{ color: "red" }}>{totalBooked}</span> /
              最低开课人数: {selectedCourse.min_book}
            </p>
            <div className={styles.popupBtns}>
              <button
                style={{ background: "#f33" }}
                onClick={async () => {
                  // 调用后端 remove-course.php 或 cancel-course.php
                  if (!window.confirm("确认移除课程及所有预约？")) return;
                  await handleRemoveCourse();
                  setCancelCoursePopupVisible(false);
                  navigate("/admin_course"); // 返回课程表或刷新
                }}
              >
                移除排程
              </button>
              <button
                style={{ background: "#fe9" }}
                onClick={async () => {
                  // 强制调用 start-course.php（无视人数）
                  if (!window.confirm("确认强制开始课程并自动扣款吗？")) return;
                  await handleStartCourse();
                  setCancelCoursePopupVisible(false);
                }}
              >
                强制开始
              </button>
              <button onClick={() => setCancelCoursePopupVisible(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachCourseDetail;
