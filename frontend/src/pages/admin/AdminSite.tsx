// src/pages/AdminSite.tsx
import React, { useState } from "react";
import "./AdminSite.css";

interface BookingRequest {
  id: number;
  userName: string;
  date: string;
  time: string;
  reason: string;
  site:string;
  status: "待处理" | "已接受" | "已拒绝";
}

const mockRequests: BookingRequest[] = [
  {
    id: 1,
    userName: "李小美",
    date: "2025/04/22",
    time: "14:00 - 15:00",
    reason: "希望练习舞蹈",
    site: "舞蹈室1",
    status: "待处理",
  },
  {
    id: 2,
    userName: "陈大强",
    date: "2025/04/23",
    time: "10:00 - 11:00",
    reason: "准备比赛训练",
    site: "舞蹈室2",
    status: "待处理",
  },
];

const AdminSite: React.FC = () => {
  const [requests, setRequests] = useState<BookingRequest[]>(mockRequests);

  const updateStatus = (id: number, status: "已接受" | "已拒绝") => {
    const updated = requests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    setRequests(updated);
  };

  return (
    <div className="admin-site-container">
      <h2>预约审核</h2>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>会员</th>
            <th>日期</th>
            <th>时间</th>
            <th>理由</th>
            <th>场地</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.userName}</td>
              <td>{req.date}</td>
              <td>{req.time}</td>
              <td>{req.reason}</td>
              <td>{req.site}</td>
              <td>
                <span
                  className={`status ${
                    req.status === "待处理"
                      ? "pending"
                      : req.status === "已接受"
                      ? "accepted"
                      : "rejected"
                  }`}
                >
                  {req.status}
                </span>
              </td>
              <td>
                {req.status === "待处理" ? (
                  <>
                    <button
                      className="btn accept"
                      onClick={() => updateStatus(req.id, "已接受")}
                    >
                      同意
                    </button>
                    <button
                      className="btn reject"
                      onClick={() => updateStatus(req.id, "已拒绝")}
                    >
                      拒绝
                    </button>
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSite;
