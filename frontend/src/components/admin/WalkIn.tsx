import styles from "./EditingUser.module.css";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useUIStore } from "../../stores/useUIStore";
import "react-datepicker/dist/react-datepicker.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import { adminService } from "../../api/services/adminService";

const WalkIn = ({ selectedCourse, setWalkInOpen, fetchCourses }: any) => {
  const setLoading = useUIStore((s) => s.setLoading);
  const setPromptMessage = useUIStore((s) => s.setPromptMessage);
  const [headCount, setHeadCount] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState("Guest");
  const [phone, setPhone] = useState<any>("");
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {

  }, []);

  const handleWalkInSubmit = () => {
    setLoading(true);
    console.log(selectedUserType);
    if (selectedUserType === "Guest") {
      adminService
        .walkIn({ course_id: selectedCourse.id, head_count: headCount })
        .then((res) => {
          if (res.success) {
            setPromptMessage({ message: "Walk In 成功", type: "success" });
            fetchCourses();
            setWalkInOpen(false);
          } else {
            setPromptMessage({ message: res.message, type: "error" });
          }
        })
        .catch((err) => {
          setPromptMessage({ message: String(err), type: "error" });
        });
    } else {
      if (!isValidPhoneNumber(phone)) {
        setPromptMessage({ message: "请输入正确的电话号码！", type: "warning" });
        setLoading(false);
        return;
      }
      adminService
        .bookByPhone({ phone, course_id: selectedCourse.id, head_count: headCount })
        .then((res) => {
          if (res.success) {
            setPromptMessage({ message: "新增报名成功", type: "success" });
            fetchCourses();
            setWalkInOpen(false);
          } else {
            setPromptMessage({ message: res.message, type: "error" });
          }
        })
        .catch((err) => {
          setPromptMessage({ message: String(err), type: "error" });
        });
    }

    setLoading(false);
  };

  const handleCheck = async () => {
    setLoading(true);
    const res = await adminService.lookupStudent({ phone });
    if (res.success) {
      setName(res.name ?? "");
      setChecked(true);
    } else {
      setPromptMessage({ message: res.message, type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className={styles["popup-overlay"]}>
      <div className={styles["popup-card"]}>
        <div className={styles["header-row"]}>
          <h3>Walk In 报名</h3>
        </div>

        <form className={styles["change-password-form"]}>
          <div className={styles["edit-row"]}>
            <label>客户类型:</label>
            <select
              name="user_type"
              className={styles["form-input"]}
              value={selectedUserType}
              onChange={(e) => {
                setSelectedUserType(e.target.value);
              }}
            >
              <option value="Guest">Guest</option>
              <option value="Member">Member</option>
            </select>
          </div>
          {selectedUserType === "Member" && (
            <>
              <div className={styles["edit-row"]}>
                <label>电话:</label>
                <PhoneInput
                  placeholder=""
                  defaultCountry="MY"
                  value={phone}
                  onChange={setPhone}
                  className={styles["form-input"]}
                  required
                />
              </div>
              <div className={styles["edit-row"]}>
                <label>学生姓名</label>
                <input
                  type="text"
                  className={styles["form-input"]}
                  value={name}
                  readOnly
                  placeholder="学生名"
                />
              </div>
            </>
          )}
          <div className={styles["edit-row"]}>
            <label>课程:</label>
            <span className={styles["form-input"]} style={{ border: "none" }}>
              {selectedCourse.name}
            </span>
          </div>
          <div className={styles["edit-row"]}>
            <label>时间:</label>
            <span className={styles["form-input"]} style={{ border: "none" }}>
              {selectedCourse.start_time}
            </span>
          </div>
          <div className={styles["edit-row"]}>
            <label>人数:</label>
            <input
              type="number"
              className={styles["form-input"]}
              value={headCount}
              onChange={(e) => setHeadCount(parseInt(e.target.value))}
              placeholder="人数"
              required
            />
          </div>

          <div className={styles["popup-actions"]}>
            {selectedUserType === "Member" && <button
              type="button"
              className={clsx(styles.btn, styles.delete)}
              onClick={handleCheck}
            >
              检查学生
            </button>}

            {(checked || selectedUserType === "Guest")&& (
              <button
                type="button"
                className={clsx(styles.btn, styles.confirm)}
                onClick={handleWalkInSubmit}
              >
                确认
              </button>
            )}
            <button
              type="button"
              className={clsx(styles.btn, styles["close-btn"])}
              onClick={() => setWalkInOpen(false)}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkIn;
