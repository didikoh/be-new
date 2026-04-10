import { useEffect, useMemo, useState } from "react";
import styles from "./AdminMember.module.css";
import clsx from "clsx";
import EditingUser from "../../components/admin/EditingUser";
import popupStyle from "../../components/admin/EditingUser.module.css";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import ChargeMember from "../../components/admin/ChargeMember";
import { adminService } from "../../api/services/adminService";
import type { CoachCourse } from "../../api/types/admin";

const filter = [
  { name: "名字", value: "name" },
  { name: "手机", value: "phone" },
  { name: "积分", value: "point" },
  { name: "余额", value: "balance" },
  { name: "生日", value: "birthday" },
];

const AdminMember = () => {
  const { setLoading, user } = useAppContext();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<any>("student");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [chargingMember, setChargingMember] = useState<any>(null);

  const [refresh, setRefresh] = useState(0);
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
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
      .then((res) => {
        setCoachCourses(res.courses ?? []);
      })
      .catch(() => {
        setCoachCourses([]);
      })
      .finally(() => {
        setLoadingCoachCourse(false);
        setLoading(false);
      });
  }, [viewCoachCourse]);

  // 过滤成员
  const filteredMembers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((m: any) => {
      if (!search) return true;
      const value = m[filterBy as keyof typeof m];
      return value?.toString().toLowerCase().includes(search.toLowerCase());
    });
  }, [allUsers, filterBy, search]);

  useEffect(() => {
    setLoading(true);
    if (selectedRole === "student") {
      adminService
        .getStudents()
        .then((data) => setAllUsers(data))
        .catch(() => alert("获取学生列表失败"))
        .finally(() => setLoading(false));
    } else if (selectedRole === "coach") {
      adminService
        .getCoaches()
        .then((data) => setAllUsers(data))
        .catch(() => alert("获取教师列表失败"))
        .finally(() => setLoading(false));
    }
  }, [selectedRole, refresh]);

  const handleClosePopup = () => {
    setEditingUser(null);
    setChargingMember(null);
  };

  const handleAddNew = () => {
    setEditingUser({
      name: "",
      phone: "",
      birthday: "",
      id: -1,
      role: selectedRole,
    });
  };

  const handleCharge = (member: any) => {
    setChargingMember(member);
  };

  const handleSetSelectedRole = (role: string) => {
    setSelectedRole(role);
    setAllUsers([]);
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
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            {filter.map((f: any) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="搜索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {filteredMembers &&
                filteredMembers.map((user: any) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.point || "-"}</td>
                    <td>
                      {user.balance
                        ? ` ${user.balance} (${user.frozen_balance})`
                        : "-"}
                    </td>
                    <td>{user.is_member == 1 ? "是" : "否"}</td>
                    <td>{user.birthday}</td>
                    <td>{user.valid_balance_to || "-"}</td>
                    <td>{user.valid_to || "-"}</td>
                    <td style={{ display: "flex" }}>
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => setEditingUser(user)}
                      >
                        编辑
                      </button>
                      <button
                        className={clsx(styles.btn, styles.charge)}
                        onClick={() => handleCharge(user)}
                      >
                        会员
                      </button>
                    </td>
                  </tr>
                ))}
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
              {filteredMembers &&
                filteredMembers.map((user: any) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.birthday}</td>
                    <td>{user.month_student_count}</td>
                    <td>{user.month_course_count}</td>
                    <td>{user.join_date || "-"}</td>
                    <td style={{ display: "flex" }}>
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => setEditingUser(user)}
                      >
                        编辑
                      </button>{" "}
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => {
                          openCoachCoursePopup(user.name, user.id);
                        }} //查看该月的课程和对应人数
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </>
        )}
      </table>

      {/* 编辑弹窗 */}
      {editingUser && (
        <EditingUser
          editingUser={editingUser}
          handleClosePopup={handleClosePopup}
          selectedRole={selectedRole}
          setRefresh={setRefresh}
          setEditingUser={setEditingUser}
        />
      )}

      {/* 充值弹窗 */}
      {chargingMember && (
        <ChargeMember
          chargingMember={chargingMember}
          setChargingMember={setChargingMember}
          setRefresh={setRefresh}
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
                  setViewCoachCourse((v) =>
                    v ? { ...v, year: Number(e.target.value) } : v
                  )
                }
              >
                {/* 只展示近3年，可根据需要扩展 */}
                {[2023, 2024, 2025].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                className={popupStyle["select-year-month"]}
                value={viewCoachCourse.month}
                onChange={(e) =>
                  setViewCoachCourse((v) =>
                    v ? { ...v, month: Number(e.target.value) } : v
                  )
                }
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} 月
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={clsx(popupStyle.btn, popupStyle.confirm)}
                onClick={() => {
                  // 触发 useEffect
                  setViewCoachCourse((v) => (v ? { ...v } : v));
                }}
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
                        <td>
                          {c.start_time &&
                            c.start_time.slice(0, 16).replace("T", " ")}
                        </td>
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
