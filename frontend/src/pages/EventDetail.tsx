import "./EventDetail.css";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";

const EventDetail = () => {
  const navigate = useNavigate();
  const { selectedEvent } = useAppContext();
  const handleBackButtonClick = () => {
    navigate("/event");
  };

  const handleDetailButtonClick = () => {
    window.open(selectedEvent?.link); // 替换成你要跳转的网址
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button
          className="back-button"
          onClick={() => {
            handleBackButtonClick();
          }}
        >
          <MdArrowBack className="back-icon" />
        </button>
        <div className="event-detail-header-text">课程详情</div>
      </div>
      <img
        className="event-detail-image"
        src={selectedEvent?.image}        
        alt="Event"
      />
      <div className="event-detail-content">
        <h1 className="event-detail-title">活动标题</h1>
        <p className="event-detail-description">
          这里是活动的详细介绍内容。可以描述活动时间、地点、内容亮点等信息，让用户了解并产生兴趣。
        </p>
        <button className="event-detail-button" onClick={() => {handleDetailButtonClick();}}>立即报名</button>
      </div>
    </div>
  );
};

export default EventDetail;
