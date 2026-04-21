import React, { useEffect, useState } from "react";
import styles from "./AdminTransaction.module.css";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import popupStyle from "../../components/admin/EditingUser.module.css";
import adminMemberStyles from "./AdminMember.module.css";
import clsx from "clsx";
import Purchase from "../../components/admin/Purchase";
import { adminService } from "../../api/services/adminService";
import type { Transaction } from "../../api/types/admin";

const AdminTransaction: React.FC = () => {
  const { setLoading, user, setPromptMessage } = useAppContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();
  const [editingInvoice, setEditingInvoice] = useState<Transaction | null>(null);
  const [paymentValue, setPaymentValue] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("income");
  const [openPurchase, setOpenPurchase] = useState<boolean>(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/home");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    adminService
      .queryTransactions({ type: selectedType })
      .then((data) => setTransactions(data))
      .finally(() => setLoading(false));
  }, [selectedType]);

  const GenerateInvoice = (id: number) => {
    window.open(adminService.getInvoiceUrl(id));
  };

  useEffect(() => {
    if (editingInvoice) {
      setPaymentValue(editingInvoice.payment);
    }
  }, [editingInvoice]);

  const handleEditInvoice = () => {
    if (!editingInvoice) return;
    adminService
      .updateTransactionPayment(editingInvoice.transaction_id, { payment: paymentValue })
      .then((res) => {
        setPromptMessage({ message: res.message, type: res.success ? "success" : "error" });
        if (res.success) {
          window.location.reload();
        }
      })
      .catch((err) => setPromptMessage({ message: String(err), type: "error" }));
  };

  return (
    <div className={styles["admin-transaction-container"]}>
      <div className={adminMemberStyles["admin-member-header"]}>
        <h2>交易记录</h2>
        <div className={adminMemberStyles["admin-member-header-btns"]}>
          <button
            className={
              selectedType === "income" ? adminMemberStyles["active"] : ""
            }
            onClick={() => setSelectedType("income")}
          >
            收入
          </button>
          <button
            className={
              selectedType === "expense" ? adminMemberStyles["active"] : ""
            }
            onClick={() => setSelectedType("expense")}
          >
            买课
          </button>
          <button
            className={
              selectedType === "purchase" ? adminMemberStyles["active"] : ""
            }
            onClick={() => setSelectedType("purchase")}
          >
            消费
          </button>
        </div>
      </div>

      {selectedType === "purchase" && (
        <div className={adminMemberStyles["admin-member-filter"]}>
          <div>{/*Empty here*/}</div>
          <button
            className={adminMemberStyles["add-new-member"]}
            onClick={() => setOpenPurchase(true)}
          >
            新增
          </button>
        </div>
      )}

      <table className={styles["transaction-table"]}>
        <thead>
          <tr>
            <th>ID</th>
            <th>会员</th>
            <th>类型</th>
            <th>收入 (RM)</th>
            <th>金额 (RM)</th>
            <th>积分</th>
            {selectedType === "expense" && <th>人数</th>}
            {selectedType === "expense" && <th>课程</th>}
            {selectedType === "purchase" && <th>详情</th>}
            <th>交易时间</th>
            {selectedType === "income" && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 &&
            transactions.map((t, index) => (
              <tr key={t.transaction_id}>
                <td>{index}</td>
                <td>{t.student_name}</td>
                <td
                  className={(() => {
                    switch (t.type) {
                      case "Top Up Package":
                        return styles["income"];
                      case "payment":
                        return styles["expense"];
                      case "purchase":
                        return styles["expense"];
                      default:
                        return "";
                    }
                  })()}
                >
                  {(() => {
                    switch (t.type) {
                      case "Top Up Package":
                        return "收入";
                      case "payment":
                        return "买课";
                      case "purchase":
                        return "消费";
                      default:
                        return "未知";
                    }
                  })()}
                </td>
                <td>{t.payment}</td>
                <td>{t.amount}</td>
                <td>{t.point || "-"}</td>
                {selectedType === "expense" && <td>{t.head_count || "-"}</td>}
                {selectedType === "expense" && (
                  <td>
                    {t.course_id ? `${t.course_name}（${t.start_time}）` : "-"}
                  </td>
                )}
                {selectedType === "purchase" && <td>{t.description}</td>}
                <td>{t.time}</td>
                {selectedType === "income" && (
                  <td>
                    {t.type != "payment" && (
                      <>
                        <button
                          className={styles["btn-action"]}
                          onClick={() => setEditingInvoice(t)}
                        >
                          修改
                        </button>
                        <button
                          className={styles["btn-action"]}
                          onClick={() => GenerateInvoice(t.transaction_id)}
                        >
                          收据
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>

      {editingInvoice && (
        <div className={popupStyle["popup-overlay"]}>
          <div className={popupStyle["popup-card"]}>
            <h3>充值/会员</h3>
            <form>
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
                  onClick={() => handleEditInvoice()}
                >
                  确认
                </button>
                <button
                  type="button"
                  className={clsx(popupStyle.btn, popupStyle["close-btn"])}
                  onClick={() => setEditingInvoice(null)}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openPurchase && <Purchase setOpenPurchase={setOpenPurchase} />}
    </div>
  );
};

export default AdminTransaction;
