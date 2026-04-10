import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

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
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}auth-check.php`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.profile);
        setLoading(false);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const logout = async () => {
    await axios.get(`${import.meta.env.VITE_API_BASE_URL}auth-logout.php`, {
      withCredentials: true,
    });
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
