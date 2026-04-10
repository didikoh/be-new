// src/pages/BookingVenue.tsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CoachSite.css";
import { useAppContext } from "../../contexts/AppContext";

const mockAvailableTimes = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "14:00 - 15:00",
  "16:00 - 17:00",
  "18:00 - 19:00",
];

const mockSite = ["舞蹈室 1", "舞蹈室 2", "舞蹈室 3", "舞蹈室 4"];

const CoachSite = () => {
  const { user } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [reason, setReason] = useState("");

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    // setPopupVisible(true);
  };

  const handleSiteClick = (site: string) => {
    setSelectedSite(site);
    // setPopupVisible(true);
  };

  const handleConfirm = () => {
    alert(
      `✅ ${user} 成功预约了 ${selectedDate?.toLocaleDateString()} ${selectedTime}。\n理由: ${reason}`
    );
    setPopupVisible(false);
    setReason("");
  };

  const handleCancel = () => {
    setPopupVisible(false);
    setReason("");
  };

  return (
    <div className="booking-venue-container">
      <div className="event-header">
        <div className="event-header-text">预约场地</div>
      </div>

      <div className="calendar-section">
        <h3>选择日期：</h3>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date as Date)}
          dateFormat="yyyy/MM/dd"
          inline
        />
      </div>

      <div className="calendar-section">
        <h3>可预约时间：</h3>
        <div className="time-list">
          {mockAvailableTimes.map((time) => (
            <button
              key={time}
              className={`time-slot ${selectedTime === time ? "selected" : ""}`}
              onClick={() => handleTimeClick(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-section">
        <h3>可预约时间：</h3>
        <div className="time-list">
          {mockSite.map((site) => (
            <button
              key={site}
              className={`time-slot ${selectedSite === site ? "selected" : ""}`}
              onClick={() => handleSiteClick(site)}
            >
              {site}
            </button>
          ))}
        </div>
      </div>

      <div className="site-book-btn-container">
        <button
          className="site-book-btn"
          onClick={() => setPopupVisible(true)}
          disabled={!selectedDate || !selectedTime || !selectedSite}
        >
          预约
        </button>
      </div>

      {popupVisible && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>填写预约信息</h3>
            <p>
              <strong>姓名：</strong>
              {user.name}
            </p>
            <p>
              <strong>时间：</strong>
              {selectedDate?.toLocaleDateString()} {selectedTime}
            </p>
            <textarea
              placeholder="请输入预约理由"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="popup-actions">
              <button className="confirm-btn" onClick={handleConfirm}>
                确认预约
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachSite;
