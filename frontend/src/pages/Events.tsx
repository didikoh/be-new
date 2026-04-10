import { useNavigate } from "react-router-dom";
import "./Events.css";
import { useAppContext } from "../contexts/AppContext";
import { mockEvents } from "../mocks/event";

const Events = () => {
  const {setSelectedEvent} = useAppContext();
  const navigate = useNavigate();

  const handleMore = (item:any) => {
    navigate("/eventdetail");
    setSelectedEvent(item);
  };

  return (
    <div className="event-container">
      <div className="event-header">
        <div className="event-header-text">最新消息&活动</div>
      </div>
      <div className="event-list">
        {mockEvents.map((item, index) => (
          <div className="event-card" key={index}>
            <img src={item.image} alt="课程背景" className="event-bg" />
            <div className="event-overlay">
              <div className="event-title">{item.title}</div>
              <div className="event-description">{item.description}</div>
              <button
                className="more-button"
                onClick={() => {
                  handleMore(item);
                }}
              >
                立即了解
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
