import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useDataStore } from "../stores/useDataStore";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import PopupMessage from "../components/PopupMessage";

const GlobalWrapper = () => {
  const { i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const loading = useUIStore((s) => s.loading);
  const setLoading = useUIStore((s) => s.setLoading);
  const setSelectedPage = useUIStore((s) => s.setSelectedPage);
  const promptMessage = useUIStore((s) => s.promptMessage);
  const setPromptMessage = useUIStore((s) => s.setPromptMessage);
  const fetchUserData = useDataStore((s) => s.fetchUserData);
  const navigate = useNavigate();
  const handlePromptClose = useCallback(() => setPromptMessage(null), [setPromptMessage]);

  // Initial auth check — runs once on mount
  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, []);

  // Navigate based on user role whenever the user state changes
  useEffect(() => {
    console.log("User state changed:", user);
    if (user != null) {
      switch (user.role) {
        case "admin":
          setSelectedPage("admin_home");
          navigate("/admin_home");
          break;
        case "coach":
          setSelectedPage("coach_schedule");
          navigate("/coach_schedule");
          break;
        case "student":
          setSelectedPage("account");
          navigate("/account");
          break;
      }
    } else {
      setSelectedPage("home");
      navigate("/home");
    }
  }, [user]);

  // Fetch courses / bookings / cards whenever user changes
  useEffect(() => {
    fetchUserData(user);
  }, [user]);

  const changeLanguage = () => {
    if (i18n.language === "zh") {
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("zh");
    }
  };

  return (
    <>
      <button
        style={{ position: "fixed", zIndex: 100, display: "none" }}
        onClick={() => changeLanguage()}
      >
        Language
      </button>
      {loading && <Loading />}
      {promptMessage != null && (
        <PopupMessage
          message={promptMessage.message}
          type={promptMessage.type}
          onClose={handlePromptClose}
        />
      )}
      <Outlet />
    </>
  );
};

export default GlobalWrapper;
