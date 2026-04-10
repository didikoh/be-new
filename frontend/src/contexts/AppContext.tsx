import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../api/services/authService";

const AppContext = createContext<any>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState("home");
  const [prevPage, setPrevPage] = useState("/home");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [promptMessage, setPromptMessage] = useState("");

  useEffect(() => {
    authService
      .check()
      .then((res) => setUser(res.profile ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        setSelectedCourseId,
        selectedCourseId,
        user,
        setUser,
        selectedPage,
        setSelectedPage,
        prevPage,
        setPrevPage,
        selectedEvent,
        setSelectedEvent,
        logout,
        loading,
        setLoading,
        setRefreshKey,
        promptMessage,
        setPromptMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
