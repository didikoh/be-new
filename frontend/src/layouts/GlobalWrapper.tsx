import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import PopupMessage from "../components/PopupMessage";

const GlobalWrapper = () => {
  const { i18n } = useTranslation();
  const { loading, user, setSelectedPage, promptMessage } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
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
      {promptMessage != "" && <PopupMessage />}
      <Outlet />
    </>
  );
};

export default GlobalWrapper;
