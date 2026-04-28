import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AdminMember.module.css";
import clsx from "clsx";
import EditingUser from "../../components/admin/EditingUser";
import popupStyle from "../../components/admin/EditingUser.module.css";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { useNavigate } from "react-router-dom";
import ChargeMember from "../../components/admin/ChargeMember";
import { adminService } from "../../api/services/adminService";
import type { AdminStudent, AdminCoach, CoachCourse, PaginationMeta } from "../../api/types/admin";
import Pagination from "../../components/Pagination/Pagination";

const studentFilterOptions = [
  { name: "名字", value: "name" },
  { name: "手机", value: "phone" },
];

const coachFilterOptions = [
  { name: "名字", value: "name" },
  { name: "手机", value: "phone" },
];

const AdminMember = () => {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUIStore((s) => s.setLoading);
  const setPromptMessage = useUIStore((s) => s.setPromptMessage);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [chargingMember, setChargingMember] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  // Student pagination state
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [studentPagination, setStudentPagination] = useState<PaginationMeta | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const [studentPerPage, setStudentPerPage] = useState(10);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilterBy, setStudentFilterBy] = useState("name");
  const [studentLoading, setStudentLoading] = useState(false);

  // Debounced search value for student API calls
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");

  // Coach list state (few coaches — no pagination needed)
  const [coaches, setCoaches] = useState<AdminCoach[]>([]);
  const [coachSearch, setCoachSearch] = useState("");
  const [coachFilterBy, setCoachFilterBy] = useState("name");
  const [coachLoading, setCoachLoading] = useState(false);

  const [viewCoachCourse, setViewCoachCourse] = useState<null | {
    name: string;
    year: number;
    month: number;
    coach_id: number;
  }>(null);
  const [coachCourses, setCoachCourses] = useState<CoachCourse[]>([]);
  const [loadingCoachCourse, setLoadingCoachCourse] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/home");
    }
  }, []);

  // Debounce student search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStudentSearch(studentSearch), 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  // Reset to page 1 when search/filterBy changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setStudentPage(1);
  }, [debouncedStudentSearch, studentFilterBy]);

  // Fetch students when pagination or search changes
  useEffect(() => {
    if (selectedRole !== "student") return;
    setStudentLoading(true);
    setLoading(true);
    adminService
      .getStudents({
        page: studentPage,
        per_page: studentPerPage,
        search: debouncedStudentSearch || undefined,
        search_by: debouncedStudentSearch ? studentFilterBy : undefined,
      })
      .then((res) => {
        setStudents(res.items);
        setStudentPagination(res.pagination);
      })
      .catch(() => setPromptMessage({ message: "获取学生列表失败", type: "error" }))
      .finally(() => { setStudentLoading(false); setLoading(false); });
  }, [selectedRole, studentPage, studentPerPage, debouncedStudentSearch, studentFilterBy, refresh]);

  // Fetch coaches (no pagination)
  useEffect(() => {
    if (selectedRole !== "coach") return;
    setCoachLoading(true);
    setLoading(true);
    adminService
      .getCoaches()
      .then((data) => setCoaches(data))
      .catch(() => setPromptMessage({ message: "获取教师列表失败", type: "error" }))
      .finally(() => { setCoachLoading(false); setLoading(false); });
  }, [selectedRole, refresh]);

  const openCoachCoursePopup = (coachName: string, id: number) => {
    const now = new Date();
    setViewCoachCourse({
      name: coachName,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      coach_id: id,
    });
  };

  useEffect(() => {
    if (!viewCoachCourse) return;
    setLoadingCoachCourse(true);
    setLoading(true);
    adminService
      .getCoachCourses(viewCoachCourse.coach_id, {
        year: viewCoachCourse.year,
        month: viewCoachCourse.month,
      })
      .then((res) => setCoachCourses(res.courses ?? []))
      .catch(() => setCoachCourses([]))
      .finally(() => { setLoadingCoachCourse(false); setLoading(false); });
  }, [viewCoachCourse]);

  // Client-side filtered coaches
  const filteredCoaches = useMemo(() => {
    if (!coachSearch) return coaches;
    const lower = coachSearch.toLowerCase();
    return coaches.filter((c) => {
      const value = c[coachFilterBy as keyof typeof c];
      return value?.toString().toLowerCase().includes(lower);
    });
  }, [coaches, coachSearch, coachFilterBy]);

  const handleClosePopup = () => {
    setEditingUser(null);
    setChargingMember(null);
  };

  const handleAddNew = () => {
    setEditingUser({ name: "", phone: "", birthday: "", id: -1, role: selectedRole });
  };

  const handleSetSelectedRole = (role: string) => {
    setSelectedRole(role);
    setStudents([]);
    setCoaches([]);
    setStudentPage(1);
    setStudentSearch("");
    setCoachSearch("");
  };

  // After delete/edit: if current page is empty, go back one page
  const handleRefresh = () => {
    if (selectedRole === "student" && students.length === 1 && studentPage > 1) {
      setStudentPage((p) => p - 1);
    } else {
      setRefresh((r) => r + 1);
    }
  };

  return (
    <div className={styles["admin-member-container"]}>
      <div className={styles["admin-member-header"]}>
        <h2>会员管理</h2>
        <div className={styles["admin-member-header-btns"]}>
          <button
            className={selectedRole === "student" ? styles["active"] : ""}
            onClick={() => handleSetSelectedRole("student")}
          >
            学生
          </button>
          <button
            className={selectedRole === "coach" ? styles["active"] : ""}
            onClick={() => handleSetSelectedRole("coach")}
          >
            教师
          </button>
        </div>
      </div>

      <div className={styles["admin-member-filter"]}>
        <div className={styles["member-filter-left"]}>
          <select
            className={styles["member-type-dropdown"]}
            value={selectedRole === "student" ? studentFilterBy : coachFilterBy}
            onChange={(e) =>
              selectedRole === "student"
                ? setStudentFilterBy(e.target.value)
                : setCoachFilterBy(e.target.value)
            }
          >
            {(selectedRole === "student" ? studentFilterOptions : coachFilterOptions).map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="搜索"
            value={selectedRole === "student" ? studentSearch : coachSearch}
            onChange={(e) =>
              selectedRole === "student"
                ? setStudentSearch(e.target.value)
                : setCoachSearch(e.target.value)
            }
          />
        </div>
        <button className={styles["add-new-member"]} onClick={handleAddNew}>
          新增
        </button>
      </div>

      <table className={styles["member-table"]}>
        {selectedRole === "student" ? (
          <>
            <thead>
              <tr>
                <th>姓名</th>
                <th>电话</th>
                <th>点数</th>
                <th>余额 (RM)</th>
                <th>会员</th>
                <th>生日</th>
                <th>余额截止日期</th>
                <th>截止日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {studentLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                    加载中...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                    暂无数据
                  </td>
                </tr>
              ) : (
                students.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>{u.point || "-"}</td>
                    <td>
                      {u.balance ? ` ${u.balance} (${u.frozen_balance})` : "-"}
                    </td>
                    <td>{u.is_member == 1 ? "是" : "否"}</td>
                    <td>{u.birthday}</td>
                    <td>{u.valid_balance_to || "-"}</td>
                    <td>{u.valid_to || "-"}</td>
                    <td style={{ display: "flex" }}>
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => setEditingUser(u)}
                      >
                        编辑
                      </button>
                      <button
                        className={clsx(styles.btn, styles.charge)}
                        onClick={() => setChargingMember(u)}
                      >
                        会员
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </>
        ) : (
          <>
            <thead>
              <tr>
                <th>姓名</th>
                <th>电话</th>
                <th>生日</th>
                <th>该月学生</th>
                <th>该月课堂</th>
                <th>注册日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {coachLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                    加载中...
                  </td>
                </tr>
              ) : filteredCoaches.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredCoaches.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>{u.birthday}</td>
                    <td>{u.month_student_count}</td>
                    <td>{u.month_course_count}</td>
                    <td>{u.join_date || "-"}</td>
                    <td style={{ display: "flex" }}>
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => setEditingUser(u)}
                      >
                        编辑
                      </button>{" "}
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => openCoachCoursePopup(u.name, u.id)}
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </>
        )}
      </table>

      {/* Pagination for students */}
      {selectedRole === "student" && studentPagination && (
        <Pagination
          pagination={studentPagination}
          onPageChange={setStudentPage}
          onPerPageChange={(n) => { setStudentPerPage(n); setStudentPage(1); }}
          disabled={studentLoading}
        />
      )}

      {/* 编辑弹窗 */}
      {editingUser && (
        <EditingUser
          editingUser={editingUser}
          handleClosePopup={handleClosePopup}
          selectedRole={selectedRole}
          setRefresh={() => handleRefresh()}
          setEditingUser={setEditingUser}
        />
      )}

      {/* 充值弹窗 */}
      {chargingMember && (
        <ChargeMember
          chargingMember={chargingMember}
          setChargingMember={setChargingMember}
          setRefresh={() => handleRefresh()}
        />
      )}

      {viewCoachCourse && (
        <div className={popupStyle["popup-overlay"]}>
          <div className={popupStyle["popup-card"]} style={{ minWidth: 420 }}>
            <h3>{viewCoachCourse.name} - 课堂明细</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <select
                className={popupStyle["select-year-month"]}
                value={viewCoachCourse.year}
                onChange={(e) =>
                  setViewCoachCourse((v) => v ? { ...v, year: Number(e.target.value) } : v)
                }
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className={popupStyle["select-year-month"]}
                value={viewCoachCourse.month}
                onChange={(e) =>
                  setViewCoachCourse((v) => v ? { ...v, month: Number(e.target.value) } : v)
                }
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} 月</option>
                ))}
              </select>
              <button
                type="button"
                className={clsx(popupStyle.btn, popupStyle.confirm)}
                onClick={() => setViewCoachCourse((v) => (v ? { ...v } : v))}
              >
                查询
              </button>
            </div>
            <div style={{ minHeight: 160, overflow: "auto", maxHeight: 500 }}>
              {loadingCoachCourse ? (
                <div>加载中...</div>
              ) : coachCourses.length === 0 ? (
                <div style={{ color: "#aaa" }}>本月没有课程</div>
              ) : (
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>ID</th>
                      <th style={{ textAlign: "left" }}>课程名</th>
                      <th>开课时间</th>
                      <th>学生人数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coachCourses.map((c, index) => (
                      <tr key={c.id}>
                        <td>{index + 1}</td>
                        <td>{c.name}</td>
                        <td>{c.start_time && c.start_time.slice(0, 16).replace("T", " ")}</td>
                        <td>{c.student_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className={popupStyle["popup-actions"]}>
              <button
                type="button"
                className={clsx(popupStyle.btn, popupStyle["close-btn"])}
                onClick={() => setViewCoachCourse(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMember;
