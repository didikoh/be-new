import styles from "./ForgetPassword.module.css";
import { useNavigate } from "react-router-dom";
import { CgClose } from "react-icons/cg";
import { useTranslation } from "react-i18next";

const ForgetPassword = () => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();

  const handleContact = () => {
    const phone = "60187695676"; // 改成你自己的手机号（马来西亚手机号前面加60）
    const message = "你好，我想重设密码";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(url, "_blank");
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>{t("FP.title")}</h3>
          <div
            className={styles.close}
            onClick={() => {
              navigate("/login");
            }}
          >
            <CgClose />
          </div>
        </div>

        <button
          className={styles.contact}
          onClick={() => {
            handleContact();
          }}
        >
          {t("FP.contact")}
        </button>
      </div>
    </div>
  );
};

export default ForgetPassword;
