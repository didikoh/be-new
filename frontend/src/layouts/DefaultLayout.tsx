import { Outlet } from "react-router-dom";
import Footer from "../components/BottomNavBar";
import "./DefaultLayout.css";

const DefaultLayout = () => {
  return (
    <div className="default-layout-container">
      <main className="default-layout-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
