import { useEffect, useState } from "react";
import popupStyle from "./EditingUser.module.css";
import { useAppContext } from "../../contexts/AppContext";
import axios from "axios";
import clsx from "clsx";
import DatePicker from "react-datepicker";
import { parseISO, format } from "date-fns";

const ChargeMember = ({
  chargingMember,
  setChargingMember,
  setRefresh,
}: any) => {
  const { setLoading } = useAppContext();
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [chargePackage, setChargePackage] = useState<any>("");
  const [paymentValue, setPaymentValue] = useState<any>("");
  const [validUntil, setValidUntil] = useState<any>("");

  useEffect(() => {
    setChargePackage(chargingMember.is_member);
    setChargeAmount(0); // 重置
    setValidUntil(chargingMember.valid_balance_to || null);
    setPaymentValue(0);
  }, [setChargingMember]);

  const handleChargeConfirm = () => {
    setLoading(true);

    if (chargePackage != 1) {
      alert("请先激活会员，才可以进行充值!");
      setLoading(false);
      return;
    }
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}admin/topup.php`, {
        id: chargingMember.id,
        amount: chargeAmount,
        valid_balance_to: validUntil,
        package: chargePackage,
        payment: paymentValue,
      })
      .then((res) => {
        if (res.data.success) {
          setRefresh((prev: any) => prev + 1);
          setChargingMember(null);
        } else {
          alert("充值失败" + res.data.message);
        }
      })
      .catch(() => {
        alert("充值失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className={popupStyle["popup-overlay"]}>
      <div className={popupStyle["popup-card"]}>
        <h3>充值/会员</h3>
        <form>
          <div className={popupStyle["edit-row"]}>
            <label>名字：</label>
            <span className={popupStyle["form-input"]}>
              {chargingMember.name}
            </span>
          </div>

          <div className={popupStyle["edit-row"]}>
            <label>充值:</label>
            <input
              type="number"
              step="0.01"
              className={popupStyle["form-input"]}
              value={chargeAmount}
              onChange={(e) => setChargeAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className={popupStyle["edit-row"]}>
            <label>有效期:</label>
            <div className={popupStyle["date-picker"]}>
              <DatePicker
                className={popupStyle["date-input"]}
                selected={validUntil ? parseISO(validUntil) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    setValidUntil(format(date, "yyyy-MM-dd")); // 保存为"yyyy-MM-dd"字符串
                  } else {
                    setValidUntil("");
                  }
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="选择日期"
                showYearDropdown
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                required
              />
            </div>
          </div>

          <div className={popupStyle["edit-row"]}>
            <label>激活会员:</label>
            <input
              type="checkbox"
              className={popupStyle["form-checkbox"]}
              checked={chargePackage === 1}
              onChange={(e) => setChargePackage(e.target.checked ? 1 : 0)}
              disabled={chargingMember.is_member === 1}
            />
          </div>

          <div className={popupStyle["edit-row"]}>
            <label>收款:</label>
            <input
              type="number"
              step="0.01"
              className={popupStyle["form-input"]}
              value={paymentValue}
              onChange={(e) => setPaymentValue(Number(e.target.value))}
              required
            />
          </div>

          <div className={popupStyle["popup-actions"]}>
            <button
              type="button"
              className={clsx(popupStyle.btn, popupStyle.confirm)}
              onClick={() => handleChargeConfirm()}
            >
              确认
            </button>
            <button
              type="button"
              className={clsx(popupStyle.btn, popupStyle["close-btn"])}
              onClick={() => setChargingMember(null)}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChargeMember;
