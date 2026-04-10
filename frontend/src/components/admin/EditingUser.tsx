import axios from "axios";
import styles from "./EditingUser.module.css";
import clsx from "clsx";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";
import { useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { parseISO, format } from "date-fns";

const EditingUser = ({
  setEditingUser,
  editingUser,
  handleClosePopup,
  selectedRole,
  setRefresh,
}: any) => {
  const { setLoading } = useAppContext();
  const [name, setName] = useState<any>(editingUser.name);
  const [phone, setPhone] = useState<any>(editingUser.phone);
  const [birthday, setBirthday] = useState<any>(editingUser.birthday);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  useEffect(() => {

  }, []);

  const handleSave = () => {
    if (editingUser.id) {
      if (name == "" || phone == "" || birthday == "") {
        alert("请填写完整信息");
        return;
      }
      if (!isValidPhoneNumber(phone)) {
        alert("请输入正确的电话号码！");
        return;
      }

      setLoading(true);
      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}admin/edit-user.php`, {
          name: name,
          phone: phone,
          birthday: birthday,
          role: selectedRole,
          id: editingUser.id,
          user_id: editingUser.user_id,
        })
        .then((res) => {
          if (res.data.success) {
            setRefresh((prev: any) => prev + 1);
            setEditingUser(null);
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => alert(err))
        .finally(() => setLoading(false));
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    await axios
      .post(`${import.meta.env.VITE_API_BASE_URL}admin/delete-user.php`, {
        user_id: editingUser.user_id,
        role: selectedRole,
      })
      .then((res) => {
        if (res.data.success) {
          setRefresh((prev: any) => prev + 1);
          setEditingUser(null);
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => alert(err));
    setLoading(true);
  };

  const handleChangePassword = () => {
    if (newPassword.length < 8) {
      alert("密码至少8位");
      return;
    }

    if (newPassword !== newPassword2) {
      alert("两次密码不一致");
      return;
    }

    const formData = new FormData();
    formData.append("action", "admin_change_password");
    formData.append("user_id", editingUser.user_id);
    formData.append("role", selectedRole);
    formData.append("password_new", newPassword);

    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}edit-profile.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.success) {
          alert("密码更新成功");
          setEditingUser(null);
        } else {
          alert(res.data.message || "更新失败");
        }
      })
      .catch((err) => alert(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className={styles["popup-overlay"]}>
      <div className={styles["popup-card"]}>
        <div className={styles["header-row"]}>
          <h3>
            {changePasswordMode
              ? "更改密码"
              : `编辑${selectedRole === "student" ? "学生" : "教师"}资料`}
          </h3>
          <span
            className={styles["change-toggle"]}
            onClick={() => setChangePasswordMode(!changePasswordMode)}
          >
            {changePasswordMode ? "编辑资料" : "更改密码"}
          </span>
        </div>
        {!changePasswordMode ? (
          <form>
            <div className={styles["edit-row"]}>
              <label>姓名:</label>
              <input
                className={styles["form-input"]}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles["edit-row"]}>
              <label>电话:</label>
              <PhoneInput
                placeholder=""
                defaultCountry="MY"
                value={phone}
                onChange={setPhone}
                className={styles["form-input"]}
                required
              />{" "}
            </div>

            <div className={styles["edit-row"]}>
              <label>生日:</label>
              <div className={styles["date-picker"]}>
                <DatePicker
                  className={styles["date-input"]}
                  selected={birthday ? parseISO(birthday) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setBirthday(format(date, "yyyy-MM-dd")); // 保存为"yyyy-MM-dd"字符串
                    } else {
                      setBirthday("");
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="选择日期"
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                  maxDate={new Date()}
                  required
                />
              </div>
            </div>

            <div className={styles["popup-actions"]}>
              {editingUser.id != -1 && (
                <button
                  type="button"
                  className={clsx(styles.btn, styles.delete)}
                  onClick={() => setDeleteConfirm(true)}
                >
                  删除用户
                </button>
              )}
              <button
                type="button"
                className={clsx(styles.btn, styles.confirm)}
                onClick={() => handleSave()}
              >
                保存
              </button>
              <button
                type="button"
                className={clsx(styles.btn, styles["close-btn"])}
                onClick={handleClosePopup}
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <form className={styles["change-password-form"]}>
            <div className={styles["edit-row"]}>
              <label>新密码:</label>
              <input
                type="password"
                className={styles["form-input"]}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="输入新密码（至少8位）"
                required
              />
            </div>
            <div className={styles["edit-row"]}>
              <label>确认密码:</label>
              <input
                type="password"
                className={styles["form-input"]}
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                placeholder="确认密码（至少8位）"
                required
              />
            </div>
            <div className={styles["popup-actions"]}>
              <button
                type="button"
                className={clsx(styles.btn, styles.confirm)}
                onClick={handleChangePassword}
              >
                更新密码
              </button>
              <button
                type="button"
                className={clsx(styles.btn, styles["close-btn"])}
                onClick={handleClosePopup}
              >
                取消
              </button>
            </div>
          </form>
        )}
      </div>

      {deleteConfirm && (
        <div className={styles["popup-overlay"]}>
          <div className={clsx(styles["popup-card"], styles["delete-confirm"])}>
            <h3>确认删除该用户?</h3>
            <span>名字:{editingUser.name}</span>
            <div className={styles["popup-actions"]}>
              <button
                className={clsx(styles.btn, styles.delete)}
                onClick={handleDelete}
              >
                确定
              </button>
              <button
                type="button"
                className={clsx(styles.btn, styles["close-btn"])}
                onClick={() => setDeleteConfirm(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditingUser;
