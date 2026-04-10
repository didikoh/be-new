import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useAppContext } from "./AppContext";

const UserContext = createContext<any>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContext();
  const [courses, setCourses] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === "admin") {
      return;
    }
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}get-all-course.php`)
      .then((res) => {
        if (res.data.success) {
          setCourses(res.data.courses);
        }
      })
      .catch((err) => {
        console.error("获取课程失败", err);
      });

    if (user && user.role != "admin") {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}get-all-booking.php`)
        .then((res) => {
          if (res.data.success) {
            setAllBookings(res.data.bookings);
          }
        });
    }

    if (user && user.role == "student") {
      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}get-student-card.php`, {
          student_id: user.id,
        })
        .then((res) => {
          if (res.data.success) {
            setCards(res.data.cards);
          }
        });
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        courses,
        setCourses,
        allBookings,
        setAllBookings,
        cards,
        setCards,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
