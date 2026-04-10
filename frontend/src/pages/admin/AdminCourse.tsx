import { useEffect, useState } from "react";
import styles from "./AdminCourse.module.css";
import clsx from "clsx";
import { useAppContext } from "../../contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { course_pics } from "../../assets/course/course";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WalkIn from "../../components/admin/WalkIn";
import { toLocalYMD } from "../../ultis/timeCheck";
import { adminService } from "../../api/services/adminService";

const filter = [{ name: "课程", value: "course" }];

const formatStartTime = (start_time: string) => {
  const dateObj = new Date(start_time); // 自动解析 "2025-05-15 06:23:00"

  // 获取日期
  const day = dateObj.getDate(); // 15
  const month = dateObj.getMonth() + 1; // 月份从 0 开始，所以要 +1

  // 获取时间（格式为 12 小时制）
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12; // 0 点变成 12 点
  const timeStr = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;

  const dateStr = `${day}/${month}`; // 不需要年份

  return { dateStr, timeStr };
};

const AdminCourse = () => {
  const navigate = useNavigate();
  const {
    user,
    setPrevPage,
    setSelectedCourseId,
    setLoading,
    setSelectedPage,
  } = useAppContext();
  const [courses, setCourses] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({
    name: "",
    course_pic: "",
    price: 0,
    price_m: 0,
    min_book: 0,
    coach_id: "",
    start_time: "",
    location: "Level 2",
    duration: 0,
  });

  const [coachList, setCoachList] = useState<any>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState("coach"); // 默认老师
  const [selectedTable, _setSelectedTable] = useState("dynamic");
  const [staticCourse, setStaticCourse] = useState<any>(null);
  const [selectedStaticCourse, setSelectedStaticCourse] = useState<any>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInCourse, setWalkInCourse] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/home");
    }
  }, []);

  useEffect(() => {
    setLoading(true);

    adminService
      .getCourseTypes()
      .then((data) => {
        if (data) {
          setStaticCourse(data);
        }
      })
      .finally(() => setLoading(false));

    adminService
      .getCoaches()
      .then((data) => {
        setCoachList(data);
        if (data.length > 0) {
          setCourseForm((prev) => ({
            ...prev,
            coach_id: String(data[0].id),
          }));
        } else {
          alert("请先添加教练");
          navigate("/admin_member");
          setSelectedPage("admin_member");
        }
      })
      .finally(() => setLoading(false));
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error("获取课程失败", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedStaticCourse && selectedStaticCourse != "") {
      setCourseForm({
        name: selectedStaticCourse.name,
        course_pic: selectedStaticCourse.course_pic || "",
        price: selectedStaticCourse.price,
        price_m: selectedStaticCourse.price_m,
        min_book: selectedStaticCourse.min_book,
        coach_id: selectedStaticCourse.coach_id,
        start_time: courseForm.start_time,
        location: courseForm.location,
        duration: courseForm.duration,
      });
    }
  }, [selectedStaticCourse]);

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setCourseForm({
      name: course.name,
      course_pic: course.course_pic,
      price: course.price,
      price_m: course.price_m,
      min_book: course.min_book,
      coach_id: course.coach_id,
      start_time: course.start_time,
      location: course.location,
      duration: course.duration,
    });
  };

  const handleClosePopup = () => {
    setEditingId(null);
  };

  const handleAddNew = () => {
    setEditingId(-1); // 用 null 表示是新增
    setCourseForm({
      name: "",
      course_pic: "",
      price: 0,
      price_m: 0,
      min_book: 0,
      coach_id: coachList[0]?.id ?? "",
      start_time: "",
      location: "Level 2",
      duration: 0,
    });
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setLoading(true);
    await adminService
      .deleteCourse(editingId)
      .then((res) => {
        if (res.success) {
          fetchCourses();
          setDeleteConfirm(false);
          handleClosePopup();
        } else {
          alert(res.message);
        }
      });
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCourseForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let res;
    if (editingId !== -1 && editingId) {
      res = await adminService.updateCourse(editingId, {
        id: editingId,
        ...courseForm,
      });
    } else {
      res = await adminService.createCourse(courseForm);
    }
    if (res.success) {
      fetchCourses();
      handleClosePopup();
    }
    setLoading(false);
  };

  const handleView = (course: any) => {
    setPrevPage("/admin_course");
    setSelectedCourseId(course.id);
    navigate("/coach_coursedetail");
  };

  return (
    <div className={styles["container"]}>
      <div className={styles["header"]}>
        <h2>课程管理</h2>
        <div className={styles["header-btns"]}>
          {/* <button
            className={selectedTable === "dynamic" ? styles["active"] : ""}
            onClick={() => setSelectedTable("dynamic")}
          >
            时间表
          </button>
          <button
            className={selectedTable === "static" ? styles["active"] : ""}
            onClick={() => setSelectedTable("static")}
          >
            课程
          </button> */}
        </div>
      </div>

      <div className={styles["filter"]}>
        <div className={styles["filter-left"]}>
          <select
            className={styles["member-type-dropdown"]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {filter.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <DatePicker
            selected={filterDate}
            onChange={(date: Date | null) => setFilterDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="选择日期"
            className={styles["form-input"]}
          />
        </div>

        <button
          className={styles["add-new-btn"]}
          onClick={() => handleAddNew()}
        >
          新增
        </button>
      </div>

      <table className={styles["table"]}>
        {selectedTable === "dynamic" ? (
          <>
            <thead>
              <tr>
                <th>课名</th>
                <th>价格</th>
                <th>开课人数</th>
                <th>预约人数</th>
                <th>老师</th>
                <th>日期</th>
                <th>时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {courses &&
                courses
                  .filter((c: any) => {
                    // 日期过滤
                    const matchDate = filterDate
                      ? c.start_time.startsWith(
                          toLocalYMD(filterDate)
                        )
                      : true;

                    // 关键字过滤，区分老师/课程
                    let matchKeyword = true;
                    if (keyword.trim()) {
                      if (filterType === "coach") {
                        matchKeyword = c.coach
                          ?.toLowerCase()
                          .includes(keyword.toLowerCase());
                      } else if (filterType === "course") {
                        matchKeyword = c.name
                          ?.toLowerCase()
                          .includes(keyword.toLowerCase());
                      }
                    }

                    return matchKeyword && matchDate;
                  })
                  .map((c: any) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>
                        {c.price}/{c.price_m}
                      </td>
                      <td>{c.min_book}</td>
                      <td>{c.booking_count}</td>
                      <td>{c.coach_name}</td>
                      <td>{formatStartTime(c.start_time).dateStr}</td>
                      <td>{formatStartTime(c.start_time).timeStr}</td>
                      <td
                        style={{
                          color: (() => {
                            switch (c.state) {
                              case -1:
                                return "#dc3545";
                              case 0:
                                return "#28a745";
                              case 1:
                                return "#ffc107";
                              case 2:
                                return "#6c757d";
                              default:
                                return "#000";
                            }
                          })(),
                        }}
                      >
                        {(() => {
                          switch (c.state) {
                            case -1:
                              return "已取消";
                            case 0:
                              return "已排程";
                            case 1:
                              return "已开始";
                            case 2:
                              return "已结束";
                            default:
                              return "Unknown";
                          }
                        })()}
                      </td>
                      <td className={styles["action-buttons"]}>
                        <button
                          className={clsx(styles.btn, styles.edit)}
                          onClick={() => handleEdit(c)}
                        >
                          编辑
                        </button>
                        <button
                          className={clsx(styles.btn, styles.edit)}
                          onClick={() => handleView(c)}
                        >
                          查看
                        </button>
                        <button
                          className={clsx(styles.btn, styles.edit)}
                          onClick={() => {
                            setWalkInCourse(c);
                            setWalkInOpen(true);
                          }}
                        >
                          报名
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
                <th>课名</th>
                <th>价格</th>
                <th>开课人数</th>
                <th>评分</th>
                <th>老师</th>
                <th>星期</th>
                <th>时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {staticCourse &&
                staticCourse.map((c: any) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      {c.price}/{c.price_m}
                    </td>
                    <td>{c.min_book}</td>
                    <td>{c.rating}</td>
                    <td>{c.coach_name}</td>
                    <td>{formatStartTime(c.start_time).dateStr}</td>
                    <td>{formatStartTime(c.start_time).timeStr}</td>
                    <td
                      style={{
                        color: (() => {
                          switch (c.state) {
                            case -1:
                              return "#dc3545";
                            case 0:
                              return "#28a745";
                            case 1:
                              return "#ffc107";
                            case 2:
                              return "#6c757d";
                            default:
                              return "#000";
                          }
                        })(),
                      }}
                    >
                      {(() => {
                        switch (c.state) {
                          case -1:
                            return "已取消";
                          case 0:
                            return "已排程";
                          case 1:
                            return "已开始";
                          case 2:
                            return "已结束";
                          default:
                            return "Unknown";
                        }
                      })()}
                    </td>
                    <td className={styles["action-buttons"]}>
                      <button
                        className={clsx(styles.btn, styles.edit)}
                        onClick={() => handleEdit(c)}
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </>
        )}
      </table>

      {editingId && (
        <div className={styles["popup-overlay"]}>
          <div className={styles["popup-card"]}>
            <h3>编辑课程资料</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className={styles["edit-row"]}>
                <label>课程:</label>
                <select
                  name="static_course_id"
                  className={styles["form-input"]}
                  value={
                    selectedStaticCourse ? selectedStaticCourse.name : "请选择"
                  }
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    const selected = staticCourse.find(
                      (sc: any) => sc.id === selectedId
                    );
                    setSelectedStaticCourse(selected);
                  }}
                >
                  <option value="">请选择</option>
                  {staticCourse.map((sc: any) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles["edit-row"]}>
                <label>课名:</label>
                <input
                  name="name"
                  className={styles["form-input"]}
                  type="text"
                  value={courseForm.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles["edit-row"]}>
                <label>图片:</label>
                <select
                  name="course_pic"
                  className={styles["form-input"]}
                  value={courseForm.course_pic}
                  onChange={handleChange}
                >
                  <option value="">请选择图片</option>
                  {course_pics.map((pic) => (
                    <option key={pic} value={pic}>
                      {pic}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles["edit-row"]}>
                <label>价格:</label>
                <input
                  name="price"
                  className={styles["form-input"]}
                  type="number"
                  step="0.01"
                  value={courseForm.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles["edit-row"]}>
                <label>会员价:</label>
                <input
                  name="price_m"
                  className={styles["form-input"]}
                  type="number"
                  step="0.01"
                  value={courseForm.price_m}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles["edit-row"]}>
                <label>开课人数:</label>
                <input
                  name="min_book"
                  className={styles["form-input"]}
                  type="number"
                  value={courseForm.min_book}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles["edit-row"]}>
                <label>教练:</label>
                <select
                  name="coach_id"
                  className={styles["form-input"]}
                  value={courseForm.coach_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">请选择教练</option>
                  {coachList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["edit-row"]}>
                <label>开课时间:</label>
                <input
                  name="start_time"
                  className={styles["form-input"]}
                  type="datetime-local"
                  value={courseForm.start_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles["edit-row"]}>
                <label>场地:</label>
                <select
                  name="location"
                  className={styles["form-input"]}
                  value={courseForm.location}
                  onChange={handleChange}
                  required
                >
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                </select>
              </div>

              <div className={styles["edit-row"]}>
                <label>时长（分钟）:</label>
                <input
                  name="duration"
                  className={styles["form-input"]}
                  type="number"
                  value={courseForm.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles["popup-actions"]}>
                {editingId !== -1 && (
                  <button
                    type="button"
                    className={clsx(styles.btn, styles.delete)}
                    onClick={() => setDeleteConfirm(true)}
                  >
                    删除课程
                  </button>
                )}
                <button
                  className={clsx(styles.btn, styles.confirm)}
                  type="submit"
                >
                  保存
                </button>
                <button
                  type="button"
                  className={clsx(styles.btn, styles["close-btn"])}
                  onClick={handleClosePopup}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles["popup-overlay"]}>
          <div className={clsx(styles["popup-card"], styles["delete-confirm"])}>
            <h3>确认删除该课程?</h3>
            <div className={styles["popup-actions"]}>
              <button
                className={clsx(styles.btn, styles.delete)}
                onClick={handleDelete}
              >
                确定
              </button>
              <button
                type="button"
                className={clsx(styles.btn, styles["close-btn"])}
                onClick={() => setDeleteConfirm(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {walkInOpen && (
        <WalkIn
          selectedCourse={walkInCourse}
          setWalkInOpen={setWalkInOpen}
          fetchCourses={fetchCourses}
        />
      )}
    </div>
  );
};

export default AdminCourse;
