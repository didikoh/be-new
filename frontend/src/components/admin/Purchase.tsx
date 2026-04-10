import { useState } from "react";
import axios from "axios";
import styles from "./EditingUser.module.css";
import clsx from "clsx";
import { useAppContext } from "../../contexts/AppContext";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/input";

const Purchase = ({ setOpenPurchase }: any) => {
  const [phone, setPhone] = useState<any>("");
  const [payment, setPayment] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const { setLoading } = useAppContext();
  const [checked, setChecked] = useState(false);

  const handlePurchase = async () => {
    if (!phone || !payment) {
      alert("请输入手机号和金额");
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      alert("请输入正确的电话号码！");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}admin/purchase-item.php`,
        {
          phone,
          payment: parseFloat(payment),
          description,
        }
      );

      const data = response.data;
      if (data.success) {
        alert("✅ 购买成功！");
        setPhone("");
        setPayment("");
        setDescription("");
        setOpenPurchase(false);
      } else {
        alert("❌ 错误：" + data.message);
      }
    } catch (error) {
      console.error("请求失败:", error);
      alert("❌ 请求失败，请检查网络或服务器错误");
    }

    setLoading(false);
  };

  const handleCheck = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}admin/get-student-name.php`,
      {
        phone,
      }
    );
    setLoading(true);
    const data = response.data;
    if (data.success) {
      setName(data.name);
      setChecked(true);
    } else {
      alert(data.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles["popup-overlay"]}>
      <div className={styles["popup-card"]}>
        <div className={styles["header-row"]}>
          <h3>购买商品</h3>
        </div>
        <form className={styles["change-password-form"]}>
          <div className={styles["edit-row"]}>
            <label>手机号</label>
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
            <label>学生姓名</label>
            <input
              type="text"
              className={styles["form-input"]}
              value={name}
              readOnly
              placeholder="学生名"
            />
          </div>
          <div className={styles["edit-row"]}>
            <label>金额 (RM)</label>
            <input
              type="number"
              step="0.01"
              className={styles["form-input"]}
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              placeholder="金额"
            />
          </div>
          <div className={styles["edit-row"]}>
            <label>备注</label>
            <textarea
              value={description}
              className={styles["form-input"]}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="买了或租了什么"
            />
          </div>
          <div className={styles["popup-actions"]}>
            <button
              type="button"
              className={clsx(styles.btn, styles.delete)}
              onClick={handleCheck}
            >
              检查学生
            </button>

            {checked && (
              <button
                type="button"
                className={clsx(styles.btn, styles.confirm)}
                onClick={handlePurchase}
              >
                确认
              </button>
            )}
            <button
              type="button"
              className={clsx(styles.btn, styles["close-btn"])}
              onClick={() => setOpenPurchase(false)}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Purchase;
