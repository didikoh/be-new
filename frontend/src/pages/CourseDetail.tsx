import clsx from "clsx";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useNavigationStore } from "../stores/useNavigationStore";
import { useDataStore } from "../stores/useDataStore";
import { MdArrowBack } from "react-icons/md";
import { useEffect, useState } from "react";
import styles from "./CourseDetail.module.css";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { courseService } from "../api/services/courseService";
import { bookingService } from "../api/services/bookingService";

const CourseDetail = () => {
  const { t } = useTranslation("detail");
  const selectedCourseId = useNavigationStore((s) => s.selectedCourseId);
  const prevPage = useNavigationStore((s) => s.prevPage);
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const setLoading = useUIStore((s) => s.setLoading);
  const setPromptMessage = useUIStore((s) => s.setPromptMessage);
  const cards = useDataStore((s) => s.cards);
  const navigate = useNavigate();
  const [bookpopupVisible, setBookPopupVisible] = useState(false);
  const [bookPeopleCount, setBookPeopleCount] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isbooked, setIsbooked] = useState("");
  const [headCount, setHeadCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!selectedCourse) return;
    const total_price = selectedCourse.price_m * bookPeopleCount;
    setTotalPrice(total_price);
  }, [bookPeopleCount, selectedCourse]);

  useEffect(() => {
    if (!selectedCourseId) {
      return;
    }
    setLoading(true);
    courseService
      .getDetail(selectedCourseId)
      .then((res) => {
        setSelectedCourse(res.course);
        if (res.is_booked) {
          setIsbooked(res.is_booked.status);
        }
        if (res.head_count) {
          setHeadCount(res.head_count);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCourseId, user]);

  const handleBackButtonClick = () => {
    navigate(prevPage);
  };

  const handleBook = async () => {
    if (!user) {
      setPromptMessage({ message: t("pleaseLogin"), type: "error" });
      navigate("/login");
      return;
    }

    if (user.is_member == 0) {
      const phone = "60187695676"; // 改成你自己的手机号（马来西亚手机号前面加60）
      const message = t("joinUsWhatsapp");
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${phone}?text=${encodedMessage}`;

      window.open(url, "_blank");
      return;
    }

    const card = cards[0];
    const availableBalance = card.balance - card.frozen_balance;

    if (availableBalance < totalPrice) {
      setPromptMessage({ message: t("balanceNotEnough"), type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const response = await bookingService.create({
        course_id: selectedCourse.id,
        head_count: bookPeopleCount,
      });
      if (response.success) {
        setPromptMessage({ message: t("bookingSuccess"), type: "success" });
        await checkAuth();
      } else {
        setPromptMessage({ message: response.message, type: "error" });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("bookingFailed");
      setPromptMessage({ message: msg, type: "error" });
    }

    setLoading(false);
  };

  if (!selectedCourse) {
    return (
      <div className={styles.detailLoadingContainer}>
        <button
          className={styles.backButton}
          onClick={() => {
            handleBackButtonClick();
          }}
        >
          <MdArrowBack className={styles.backIcon} />
        </button>
        <div>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <button
          className={styles.backButton}
          onClick={() => {
            handleBackButtonClick();
          }}
        >
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
          alt="course banner"
          className={styles.detailBg}
        />
      </div>
      <div className={styles.detailContent}>
        <div className={clsx(styles.detailCard, styles.title)}>
          {" "}
          <div className={styles.courseTitleRow}>
            <h2>{selectedCourse.name}</h2>
            {/* <span className={styles.courseTag}>团课</span> */}
            {/* <span className={styles.courseShare}>分享</span> */}
          </div>
          <div className={styles.courseMeta}>
            <div className={styles.courseMetaItem}>
              {t("duration")}
              <br />
              <strong>{selectedCourse.duration} min</strong>
            </div>
            <div className={styles.courseMetaItem}>
              {t("minBook")}
              <br />
              <strong>{selectedCourse.min_book}</strong>
            </div>
          </div>
        </div>
        <div className={clsx(styles.detailCard, styles.description)}>
          {" "}
          <div className={styles.instructorInfo}>
            <img
              src={
                selectedCourse.coach_pic
                  ? import.meta.env.VITE_API_BASE_URL + selectedCourse.coach_pic
                  : "./assets/Avatar/Default.webp"
              }
              alt="coach avatar"
              className={styles.avatar}
            />
            <div>
              <strong>{selectedCourse.coach_name}</strong>
            </div>
          </div>
          <div className={styles.descRow}>
            {t("classroom")}{" "}
            <span>{selectedCourse.location || t("noLocation")}</span>
          </div>
          {/* <div className={styles.descRow}>
            {t("intro")} <span>{t("noIntro")}</span>
          </div> */}
        </div>
        <div className={clsx(styles.detailCard, styles.details)}>
          {" "}
          <div className={styles.infoRow}>
            {t("classTime")}
            <span>{selectedCourse.start_time}</span>
          </div>
          <div className={styles.infoRow}>
            {t("memberPrice")}
            <span>RM{selectedCourse.price_m}</span>
          </div>
          {(!isbooked || (isbooked && isbooked == "booked")) && (
            <div className={styles.infoRow}>
              {t("bookingCount")}
              <div className={styles.peopleCount}>
                <button
                  onClick={() =>
                    setBookPeopleCount(Math.max(1, bookPeopleCount - 1))
                  }
                >
                  <FaMinus />
                </button>

                <span>{bookPeopleCount}</span>

                <button onClick={() => setBookPeopleCount(bookPeopleCount + 1)}>
                  <FaPlus />
                </button>
              </div>
            </div>
          )}
          {isbooked && (
            <div className={styles.infoRow}>
              {t("bookedCount")}
              <div className={styles.peopleCount}>
                <span>{headCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.detailFooter}>
        <button
          className={styles.detailBookButton}
          onClick={() => setBookPopupVisible(true)}
          disabled={
            !isbooked || (isbooked && isbooked == "booked") ? false : true
          }
        >
          {!isbooked || (isbooked && isbooked == "booked")
            ? t("bookNow")
            : t("booked")}{" "}
        </button>
      </div>

      {bookpopupVisible && (
        <div className={styles.bookPopup}>
          <div className={styles.popupContent}>
            <h2>{t("popupTitle")}</h2>
            <p>
              {t("popupCourseName")} {selectedCourse.name}
            </p>
            <p>
              {t("popupTime")}
              {selectedCourse.start_time}
            </p>
            <p>
              {t("popupPeople")} {bookPeopleCount} {t("popupUnit")}
            </p>
            <p>
              {t("popupUnitPrice")} {selectedCourse.price_m}
            </p>
            <p>
              {t("popupTotalPrice")} {totalPrice}
            </p>
            <div className={styles.popupBtns}>
              <button
                onClick={() => {
                  handleBook();
                }}
              >
                {t("popupConfirm")}
              </button>
              <button onClick={() => setBookPopupVisible(false)}>
                {t("popupClose")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
