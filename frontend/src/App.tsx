import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SearchProvider } from "./context/SearchContext";

// Макеты (Layouts)
import MainLayout from "./layouts/MainLayout";
import ClientLayout from "./layouts/ClientLayout";

// Авторизация и уведомления
import Auth from "./pages/Auth";
import Notification from "./pages/Notification";

// Страницы Администратора
import TaskList from "./pages/TaskList";
import CreateTask from "./pages/CreateTask";
import Clients from "./pages/Clients";
import AddClient from "./pages/AddClient";
import ClientDetail from "./pages/ClientDetail";
import Schedule from "./pages/Schedule";
import AddEvent from "./pages/AddEvent";
import Managers from "./pages/Managers";
import AddManager from "./pages/AddManager";
import ManagerDetail from "./pages/ManagerDetail";
import Settings from "./pages/Settings";

// Страницы Менеджера
import ClientTaskList from "./pages/client/ClientTaskList";
import ClientCreateTask from "./pages/client/ClientCreateTask";
import ClientClients from "./pages/client/ClientClients";
import ClientAddClient from "./pages/client/ClientAddClient";
import ClientClientDetail from "./pages/client/ClientClientDetail";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientAddEvent from "./pages/client/ClientAddEvent";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "manager" | "client")[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("userRole") || "manager") as "admin" | "manager" | "client";

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === "admin" ? "/" : "/client"} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/notification" element={<Notification />} />

          {/* ================= КАБИНЕТ АДМИНИСТРАТОРА (/) ================= */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<TaskList />} />
            <Route path="/create-task" element={<CreateTask />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/add" element={<AddClient />} />
            <Route path="/clients/detail" element={<ClientDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/add" element={<AddEvent />} />
            <Route path="/managers" element={<Managers />} />
            <Route path="/managers/add" element={<AddManager />} />
            <Route path="/managers/detail" element={<ManagerDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* ================= КАБИНЕТ МЕНЕДЖЕРА (/client) ================= */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["manager", "client"]}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientTaskList />} />
            <Route path="create-task" element={<ClientCreateTask />} />
            <Route path="clients" element={<ClientClients />} />
            <Route path="clients/add" element={<ClientAddClient />} />
            <Route path="clients/detail" element={<ClientClientDetail />} />
            <Route path="schedule" element={<ClientSchedule />} />
            <Route path="schedule/add" element={<ClientAddEvent />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}