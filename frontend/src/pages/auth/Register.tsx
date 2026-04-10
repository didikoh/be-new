import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { CgClose } from "react-icons/cg";
import { useRef, useState } from "react";
import PhoneInput from "react-phone-number-input/input";
import { isValidPhoneNumber } from "react-phone-number-input/input";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useAppContext } from "../../contexts/AppContext";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const Register = () => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();
  const { setUser, setLoading } = useAppContext();
  // 定义表单状态
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const Icon = show ? FaEye : FaEyeSlash;
  const Icon2 = show2 ? FaEye : FaEyeSlash;
  const [responseMsg, setResponseMsg] = useState("");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidPhoneNumber(phone)) {
      alert(t("validatePhone"));
      return;
    }

    if (password.length < 8) {
      alert(t("validatePassword"));
      return;
    }

    if (password !== password2) {
      alert(t("register.validateConfirmPassword"));
      return;
    }

    const formData = {
      name,
      phone,
      birthday: birthday ? birthday.toISOString().slice(0, 10) : "", // 转 "yyyy-mm-dd"
      password,
      ...(profilePic && { profile_pic: profilePic }),
    };
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}auth-register.php`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // ✅ 必须加这个，才能存 session
      });
      if (res.data.success) {
        setUser(res.data.profile);
      }
      setResponseMsg(res.data.message);
    } catch (err: any) {
      console.error(err);
      setResponseMsg(err.response?.data?.message || "Network Error");
    }
    setLoading(false);
    // 提交后跳转或发请求
    // alert("注册成功（模拟）！");
    // navigate("/login");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>{t("register.title")}</h3>
          <div
            className={styles.close}
            onClick={() => {
              navigate("/login");
            }}
          >
            <CgClose />
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("register.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles["form-input"]}
            required
          />

          <PhoneInput
            placeholder={t("register.phone")}
            defaultCountry="MY"
            value={phone}
            onChange={(value) => setPhone(value || "")}
            className={styles["form-input"]}
            required
          />

          <DatePicker
            selected={birthday}
            onChange={(date: Date | null) => setBirthday(date)}
            placeholderText={t("register.birthday")}
            dateFormat="yyyy-MM-dd"
            className={styles["form-input"]}
            maxDate={new Date()} // 生日最大为今天
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            required
          />

          <div className={styles["form-row"]}>
            <input
              type={show ? "text" : "password"}
              placeholder={t("register.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder={t("register.confirmPassword")}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={styles["form-input"]}
              required
            />
            <Icon2
              className={styles["show-icon"]}
              onClick={() => setShow2(!show2)}
            />
          </div>
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
            placeholder={t("register.uploadAvatar")}
            defaultValue={profilePic ? profilePic.name : ""}
            onClick={() => fileInputRef.current?.click()}
            className={styles["form-input"]}
          />
          <button type="submit">{t("register.submit")}</button>
          {responseMsg && <p className={styles["text-error"]}>{responseMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
