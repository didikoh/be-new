import { useNavigate } from "react-router-dom";
import styles from "./ChangePassword.module.css";
import { CgClose } from "react-icons/cg";
import { useState } from "react";

const ChangePassword = () => {
  const navigate = useNavigate();

  // 定义表单状态
  // const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [oldPassword2, setOldPassword2] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h3>账号注册</h3>
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
              placeholder="旧密码"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={styles["form-input"]}
            />

            <input
              type="text"
              placeholder="重复旧密码"
              value={oldPassword2}
              onChange={(e) => setOldPassword2(e.target.value)}
              className={styles["form-input"]}
            />

            <input
              type="text"
              placeholder="新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles["form-input"]}
            />
            <button type="submit">提交</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
