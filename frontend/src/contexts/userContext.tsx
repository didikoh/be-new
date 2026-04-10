import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAppContext } from "./AppContext";
import { courseService } from "../api/services/courseService";
import { bookingService } from "../api/services/bookingService";
import { studentService } from "../api/services/studentService";

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

    courseService
      .getAll()
      .then((data) => setCourses(data))
      .catch((err) => console.error("获取课程失败", err));

    if (user && user.role !== "admin") {
      bookingService
        .getAll()
        .then((data) => setAllBookings(data))
        .catch((err) => console.error("获取预约失败", err));
    }

    if (user && user.role === "student") {
      studentService
        .getCards(user.id)
        .then((data) => setCards(data))
        .catch((err) => console.error("获取卡片失败", err));
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
