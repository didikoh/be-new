import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AdminTransaction.module.css";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { useNavigate } from "react-router-dom";
import popupStyle from "../../components/admin/EditingUser.module.css";
import adminMemberStyles from "./AdminMember.module.css";
import clsx from "clsx";
import Purchase from "../../components/admin/Purchase";
import { adminService } from "../../api/services/adminService";
import type { Transaction, PaginationMeta } from "../../api/types/admin";
import Pagination from "../../components/Pagination/Pagination";

const AdminTransaction: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUIStore((s) => s.setLoading);
  const setPromptMessage = useUIStore((s) => s.setPromptMessage);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState<Transaction | null>(null);
  const [paymentValue, setPaymentValue] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("income");
  const [openPurchase, setOpenPurchase] = useState<boolean>(false);

  useEffect(() => {
    if (user?.role !== "admin") navigate("/home");
  }, []);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when type or search changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setPage(1);
  }, [selectedType, debouncedSearch]);

  const fetchTransactions = useCallback(() => {
    setTableLoading(true);
    setLoading(true);
    adminService
      .queryTransactions({
        type: selectedType,
        page,
        per_page: perPage,
        search: debouncedSearch || undefined,
      })
      .then((res) => {
        setTransactions(res.items);
        setPagination(res.pagination);
      })
      .catch(() => setPromptMessage({ message: "获取交易记录失败", type: "error" }))
      .finally(() => { setTableLoading(false); setLoading(false); });
  }, [selectedType, page, perPage, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const GenerateInvoice = (id: number) => {
    window.open(adminService.getInvoiceUrl(id));
  };

  useEffect(() => {
    if (editingInvoice) setPaymentValue(editingInvoice.payment);
  }, [editingInvoice]);

  const handleEditInvoice = () => {
    if (!editingInvoice) return;
    adminService
      .updateTransactionPayment(editingInvoice.transaction_id, { payment: paymentValue })
      .then((res) => {
        setPromptMessage({ message: res.message, type: res.success ? "success" : "error" });
        if (res.success) {
          setEditingInvoice(null);
          fetchTransactions();
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
            className={selectedType === "income" ? adminMemberStyles["active"] : ""}
            onClick={() => setSelectedType("income")}
          >
            收入
          </button>
          <button
            className={selectedType === "expense" ? adminMemberStyles["active"] : ""}
            onClick={() => setSelectedType("expense")}
          >
            买课
          </button>
          <button
            className={selectedType === "purchase" ? adminMemberStyles["active"] : ""}
            onClick={() => setSelectedType("purchase")}
          >
            消费
          </button>
        </div>
      </div>

      <div className={adminMemberStyles["admin-member-filter"]}>
        <div className={adminMemberStyles["member-filter-left"]}>
          <input
            type="text"
            placeholder="搜索会员名/手机"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selectedType === "purchase" && (
          <button
            className={adminMemberStyles["add-new-member"]}
            onClick={() => setOpenPurchase(true)}
          >
            新增
          </button>
        )}
      </div>

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
          {tableLoading ? (
            <tr>
              <td colSpan={selectedType === "income" ? 8 : 7} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                加载中...
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={selectedType === "income" ? 8 : 7} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                暂无数据
              </td>
            </tr>
          ) : (
            transactions.map((t, index) => (
              <tr key={t.transaction_id}>
                <td>{(page - 1) * perPage + index + 1}</td>
                <td>{t.student_name}</td>
                <td
                  className={(() => {
                    switch (t.type) {
                      case "Top Up Package": return styles["income"];
                      case "payment": return styles["expense"];
                      case "purchase": return styles["expense"];
                      default: return "";
                    }
                  })()}
                >
                  {(() => {
                    switch (t.type) {
                      case "Top Up Package": return "收入";
                      case "payment": return "买课";
                      case "purchase": return "消费";
                      default: return "未知";
                    }
                  })()}
                </td>
                <td>{t.payment}</td>
                <td>{t.amount}</td>
                <td>{t.point || "-"}</td>
                {selectedType === "expense" && <td>{t.head_count || "-"}</td>}
                {selectedType === "expense" && (
                  <td>{t.course_id ? `${t.course_name}（${t.start_time}）` : "-"}</td>
                )}
                {selectedType === "purchase" && <td>{t.description}</td>}
                <td>{t.time}</td>
                {selectedType === "income" && (
                  <td>
                    {t.type !== "payment" && (
                      <>
                        <button className={styles["btn-action"]} onClick={() => setEditingInvoice(t)}>
                          修改
                        </button>
                        <button className={styles["btn-action"]} onClick={() => GenerateInvoice(t.transaction_id)}>
                          收据
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          disabled={tableLoading}
        />
      )}

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
