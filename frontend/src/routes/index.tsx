// src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import CourseDetail from "../pages/CourseDetail";
import Account from "../pages/Account";
import Schedule from "../pages/Schedule";
import Construction from "../pages/Construction";
import CoachSchedule from "../pages/coach/CoachSchedule";
import CoachCourseDetail from "../pages/coach/CoachCourseDetail";
import CoachAccount from "../pages/coach/CoachAccount";
// import CoachSite from "../pages/coach/CoachSite";
import AdminAccount from "../pages/admin/AdminAccount";
import AdminMember from "../pages/admin/AdminMember";
import AdminHome from "../pages/admin/AdminHome";
import AdminTransaction from "../pages/admin/AdminTransaction";
// import AdminSite from "../pages/admin/AdminSite";
// import Events from "../pages/Events";
import EventDetail from "../pages/EventDetail";
import AdminCourse from "../pages/admin/AdminCourse";
import Register from "../pages/auth/Register";
import ForgetPassword from "../pages/auth/ForgetPassword";
import GlobalWrapper from "../layouts/GlobalWrapper";

export const router = createBrowserRouter([
  {
    element: <GlobalWrapper />,
    children: [
      { path: "/construction", element: <Construction /> },
      { path: "/coursedetail", element: <CourseDetail /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forget_password", element: <ForgetPassword /> },
      { path: "/coach_coursedetail", element: <CoachCourseDetail /> },
      { path: "/eventdetail", element: <EventDetail /> },
      {
        element: <DefaultLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/home", element: <Home /> },
          { path: "/schedule", element: <Schedule /> },
          { path: "/account", element: <Account /> },
          // { path: "/event", element: <Events /> },
          { path: "/coach_schedule", element: <CoachSchedule /> },
          // { path: "/coach_site", element: <CoachSite /> },
          { path: "/coach_account", element: <CoachAccount /> },
          { path: "/admin_account", element: <AdminAccount /> },
          { path: "/admin_home", element: <AdminHome /> },
          { path: "/admin_member", element: <AdminMember /> },
          { path: "/admin_transaction", element: <AdminTransaction /> },
          // { path: "/admin_site", element: <AdminSite /> },
          { path: "/admin_course", element: <AdminCourse /> },
        ],
      },
    ],
  },
]);
