import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AppProvider } from "./contexts/AppContext"; // 👈 记得导入
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <AppProvider>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </AppProvider>
  );
}

export default App;
