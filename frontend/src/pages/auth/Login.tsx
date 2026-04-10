import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Login.module.css";
import { useAppContext } from "../../contexts/AppContext";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input/input";
import axios from "axios";
import { CgClose } from "react-icons/cg";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();
  const { setUser, setSelectedPage, setLoading } = useAppContext();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhoneNumber(phone)) {
      alert(t("validatePhone"));
      return;
    }

    if (password.length < 8) {
      alert(t("validatePassword"));
      return;
    }

    const formData = {
      phone,
      password,
    };
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}auth-login.php`, formData, {
        withCredentials: true, // ✅ 必须加这个，才能存 session
      });

      if (res.data.success) {
        setUser(res.data.profile);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-content"]}>
        <h1 className={styles["login-title"]}>{t("title")}</h1>
        <button
          className={styles.closeBtn}
          onClick={() => {
            setSelectedPage("home");
            navigate("/home");
          }}
        >
          <CgClose />
        </button>
        {error && <div className={styles["login-error"]}>{error}</div>}
        <form onSubmit={handleLogin} className={styles["login-form"]}>
          <PhoneInput
            placeholder={t("phone")}
            defaultCountry="MY"
            value={phone}
            onChange={(value) => setPhone(value || "")}
            className={styles["login-input"]}
            required
          />
          <div className={styles["form-bottom-row"]}>
            <input
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles["login-input"]}
              required
            />
          </div>

          <div className={styles["form-bottom-row"]}>
            {/* <label className={styles["remember-me"]}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              记住我
            </label>{" "} */}
            <span
              className={styles["register-text"]}
              onClick={() => navigate("/register")}
              role="button"
              tabIndex={0}
            >
              {t("joinUs")}
            </span>
          </div>
          <button type="submit" className={styles["login-button"]}>
            {t("login")}
          </button>
          <div className={styles["form-bottom-row"]}>
            <span
              className={styles["forget-password-text"]}
              onClick={() => navigate("/forget_password")}
              role="button"
              tabIndex={0}
            >
              {t("forgetPassword")}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
