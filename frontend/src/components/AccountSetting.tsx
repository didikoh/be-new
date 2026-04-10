import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import styles from "./AccountSetting.module.css";
import { useAppContext } from "../contexts/AppContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { profileService } from "../api/services/profileService";

const AccountSetting = ({ setSettingOpen }: any) => {
  const { t } = useTranslation("account");
  const { user, setRefreshKey, logout, setLoading } = useAppContext();
  // 定义表单状态
  const [name, setName] = useState(user.name || "");
  const [birthday, setBirthday] = useState<Date | null>(
    user.birthday ? new Date(user.birthday) : null
  );

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordNew2, setPasswordNew2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const Icon = show ? FaEye : FaEyeSlash;
  const Icon2 = show2 ? FaEye : FaEyeSlash;
  const Icon3 = show3 ? FaEye : FaEyeSlash;
  const [responseMsg, setResponseMsg] = useState("");
  const [changePassword, setChangePassword] = useState(false);

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await profileService.update({
        name,
        birthday: birthday ? birthday.toISOString().slice(0, 10) : "",
        phone: user.phone,
        role: user.role,
        user_id: user.user_id,
        ...(profilePic ? { profile_pic: profilePic } : {}),
      });
      if (res.success) {
        setSettingOpen(false);
        setRefreshKey((prev: any) => prev + 1);
      } else {
        setResponseMsg(res.message ?? t("accountSetting.networkError"));
      }
    } catch (err: any) {
      console.error(err);
      setResponseMsg(err.message ?? t("accountSetting.networkError"));
    }
    setLoading(false);
  };

  const handleSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordOld.length < 8 || passwordNew.length < 8) {
      alert(t("accountSetting.passwordTooShort"));
      return;
    }

    if (passwordNew !== passwordNew2) {
      alert(t("accountSetting.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);
      const res = await profileService.changePassword({
        phone: user.phone,
        password_old: passwordOld,
        password_new: passwordNew,
        user_id: user.user_id,
      });
      if (res.success) {
        alert(t("accountSetting.passwordChangeSuccess"));
        logout();
      } else {
        setResponseMsg(res.message ?? t("accountSetting.networkError"));
      }
    } catch (err: any) {
      console.error(err);
      setResponseMsg(err.message ?? t("accountSetting.networkError"));
    }
    setLoading(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles["header-left"]}>
            <h3>
              {changePassword
                ? t("accountSetting.changePassword")
                : t("accountSetting.editProfile")}
            </h3>
            <div
              className={styles["change-form"]}
              onClick={() => setChangePassword(!changePassword)}
            >
              {changePassword
                ? t("accountSetting.editProfile")
                : t("accountSetting.changePassword")}
            </div>
          </div>
          <div
            className={styles.close}
            onClick={() => {
              setSettingOpen(false);
            }}
          >
            <CgClose />
          </div>
        </div>

        {!changePassword ? (
          <form className={styles.form} onSubmit={handleSubmitEdit}>
            <input
              type="text"
              placeholder={t("accountSetting.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles["form-input"]}
              required
            />

            <DatePicker
              selected={birthday}
              onChange={(date: Date | null) => setBirthday(date)}
              placeholderText={t("accountSetting.birthdayPlaceholder")}
              dateFormat="yyyy-MM-dd"
              className={styles["form-input"]}
              maxDate={new Date()} // 生日最大为今天
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              required
            />

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfilePic(file);
              }}
              className={styles["hidden-file-input"]}
            />

            <input
              type="text"
              placeholder={t("accountSetting.uploadAvatarPlaceholder")}
              defaultValue={profilePic ? profilePic.name : ""}
              onClick={() => fileInputRef.current?.click()}
              className={styles["form-input"]}
            />
            <button type="submit">{t("accountSetting.submit")}</button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleSubmitPassword}>
            <div className={styles["form-row"]}>
              <input
                type={show ? "text" : "password"}
                placeholder={t("accountSetting.oldPasswordPlaceholder")}
                value={passwordOld}
                onChange={(e) => setPasswordOld(e.target.value)}
                className={styles["form-input"]}
                required
              />
              <Icon
                className={styles["show-icon"]}
                onClick={() => setShow(!show)}
              />
            </div>

            <div className={styles["form-row"]}>
              <input
                type={show2 ? "text" : "password"}
                placeholder={t("accountSetting.newPasswordPlaceholder")}
                value={passwordNew}
                onChange={(e) => setPasswordNew(e.target.value)}
                className={styles["form-input"]}
                required
              />
              <Icon2
                className={styles["show-icon"]}
                onClick={() => setShow2(!show2)}
              />
            </div>

            <div className={styles["form-row"]}>
              <input
                type={show3 ? "text" : "password"}
                placeholder={t("accountSetting.confirmNewPasswordPlaceholder")}
                value={passwordNew2}
                onChange={(e) => setPasswordNew2(e.target.value)}
                className={styles["form-input"]}
                required
              />
              <Icon3
                className={styles["show-icon"]}
                onClick={() => setShow3(!show3)}
              />
            </div>

            <button type="submit">{t("accountSetting.submit")}</button>
          </form>
        )}
        {responseMsg && <p className={styles["response-msg"]}>{responseMsg}</p>}
      </div>
    </div>
  );
};

export default AccountSetting;
