import api from "./axios";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", credentials);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
    }
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    window.location.href = "/auth";
  },
};

export const clientsApi = {
  getAll: async (params?: { type?: string; status?: string; search?: string; isActive?: boolean; wantsToLearn?: boolean }) => {
    const { data } = await api.get("/clients", { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },
  create: async (clientData: any) => {
    const { data } = await api.post("/clients", clientData);
    return data;
  },
  update: async (id: string, clientData: any) => {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },
  toggleActive: async (id: string) => {
    const { data } = await api.patch(`/clients/${id}/toggle-active`);
    return data;
  },
  addNote: async (clientId: string, text: string) => {
    const { data } = await api.post(`/clients/${clientId}/notes`, { text });
    return data;
  },
  transfer: async (clientId: string, newManagerId: string) => {
    const { data } = await api.post(`/clients/${clientId}/transfer`, { newManagerId });
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },
};

export const tasksApi = {
  getAll: async (params?: { status?: string; managerId?: string }) => {
    const { data } = await api.get("/tasks", { params });
    return data;
  },
  create: async (taskData: any) => {
    const { data } = await api.post("/tasks", taskData);
    return data;
  },
  complete: async (id: string) => {
    const { data } = await api.patch(`/tasks/${id}/complete`);
    return data;
  },
  postpone: async (id: string, payload: { endDate: string; postponeReason?: string }) => {
    const { data } = await api.patch(`/tasks/${id}/postpone`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

export const managersApi = {
  getAll: async () => {
    const { data } = await api.get("/managers");
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/managers/${id}`);
    return data;
  },
  create: async (managerData: any) => {
    const { data } = await api.post("/managers", managerData);
    return data;
  },
  update: async (id: string, managerData: any) => {
    const { data } = await api.put(`/managers/${id}`, managerData);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/managers/${id}`);
    return data;
  },
};

export const scheduleApi = {
  getAll: async (params?: { isArchived?: boolean }) => {
    const { data } = await api.get("/schedule", { params });
    return data;
  },
  create: async (eventData: any) => {
    const { data } = await api.post("/schedule", eventData);
    return data;
  },
  update: async (id: string, eventData: any) => {
    const { data } = await api.put(`/schedule/${id}`, eventData);
    return data;
  },
  toggleArchive: async (id: string) => {
    const { data } = await api.patch(`/schedule/${id}/toggle-archive`);
    return data;
  },
  addStudent: async (eventId: string, payload: { clientId: string; paymentStatus?: string }) => {
    const { data } = await api.post(`/schedule/${eventId}/students`, payload);
    return data;
  },
  updateStudentStatus: async (eventId: string, studentId: string, paymentStatus: string) => {
    const { data } = await api.patch(`/schedule/${eventId}/students/${studentId}/status`, { paymentStatus });
    return data;
  },
  removeStudent: async (eventId: string, studentId: string) => {
    const { data } = await api.delete(`/schedule/${eventId}/students/${studentId}`);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/schedule/${id}`);
    return data;
  },
};

export const settingsApi = {
  getAll: async (type?: "tag" | "specialty" | "course_type") => {
    const { data } = await api.get("/settings", { params: { type } });
    return data;
  },
  create: async (payload: { type: "tag" | "specialty" | "course_type"; name: string; maxStudents?: number }) => {
    const { data } = await api.post("/settings", payload);
    return data;
  },
  update: async (id: string, payload: { name?: string; maxStudents?: number }) => {
    const { data } = await api.put(`/settings/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/settings/${id}`);
    return data;
  },
};

export const statsApi = {
  get: async (managerId?: string) => {
    const { data } = await api.get("/stats", { params: { managerId } });
    return data;
  },
};