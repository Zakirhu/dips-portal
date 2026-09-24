import type {
  User,
  Branch,
  AcademicClass,
  Subject,
  AcademicSession,
  Resource,
  ResourceRating,
  Announcement,
  AppNotification,
  ActivityLog,
  AdminStats,
  SystemSettings,
  ResourceVersion,
  ResourceComment,
} from '../types.js';

const TOKEN_KEY = 'dips_portal_token';
const USER_KEY = 'dips_portal_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set Content-Type if not FormData (FormData sets its own boundary)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string; expectedRole?: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  registerTeacher: (data: {
    fullName: string;
    email: string;
    employeeId?: string;
    password: string;
    branchId: string;
    designation?: string;
    phone?: string;
    assignedSubjectIds?: string[];
    assignedClassIds?: string[];
  }) =>
    request<{ token: string; user: User; message: string }>('/api/auth/register-teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => request<{ user: User }>('/api/auth/me'),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  getDemoAccounts: () =>
    request<{ accounts: Partial<User>[] }>('/api/auth/demo-accounts'),

  // Branches
  getBranches: () => request<{ branches: Branch[] }>('/api/branches'),
  createBranch: (data: Partial<Branch>) =>
    request<{ branch: Branch }>('/api/branches', { method: 'POST', body: JSON.stringify(data) }),
  updateBranch: (id: string, data: Partial<Branch>) =>
    request<{ branch: Branch }>(`/api/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id: string) =>
    request<{ success: boolean }>(`/api/branches/${id}`, { method: 'DELETE' }),

  // Academic
  getClasses: () => request<{ classes: AcademicClass[] }>('/api/academic/classes'),
  createClass: (data: Partial<AcademicClass>) =>
    request<{ class: AcademicClass }>('/api/academic/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id: string, data: Partial<AcademicClass>) =>
    request<{ class: AcademicClass }>(`/api/academic/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id: string) =>
    request<{ success: boolean }>(`/api/academic/classes/${id}`, { method: 'DELETE' }),

  getSubjects: () => request<{ subjects: Subject[] }>('/api/academic/subjects'),
  createSubject: (data: Partial<Subject>) =>
    request<{ subject: Subject }>('/api/academic/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: string, data: Partial<Subject>) =>
    request<{ subject: Subject }>(`/api/academic/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject: (id: string) =>
    request<{ success: boolean }>(`/api/academic/subjects/${id}`, { method: 'DELETE' }),

  getSessions: () => request<{ sessions: AcademicSession[] }>('/api/academic/sessions'),

  // Users (Teachers & Students)
  getTeachers: () => request<{ teachers: User[] }>('/api/users/teachers'),
  createTeacher: (data: any) =>
    request<{ teacher: User }>('/api/users/teachers', { method: 'POST', body: JSON.stringify(data) }),
  updateTeacher: (id: string, data: any) =>
    request<{ teacher: User }>(`/api/users/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeacher: (id: string) =>
    request<{ success: boolean }>(`/api/users/teachers/${id}`, { method: 'DELETE' }),

  getStudents: () => request<{ students: User[] }>('/api/users/students'),
  createStudent: (data: any) =>
    request<{ student: User }>('/api/users/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) =>
    request<{ student: User }>(`/api/users/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: string) =>
    request<{ success: boolean }>(`/api/users/students/${id}`, { method: 'DELETE' }),

  toggleUserStatus: (id: string) =>
    request<{ success: boolean; isActive: boolean }>(`/api/users/${id}/toggle-status`, { method: 'POST' }),
  resetUserPassword: (id: string, newPassword?: string) =>
    request<{ success: boolean; message: string }>(`/api/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
  updateProfile: (data: any) =>
    request<{ success: boolean; user: User }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Resources
  getResources: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ resources: Resource[] }>(`/api/resources${query ? `?${query}` : ''}`);
  },

  getResourceById: (id: string) =>
    request<{ resource: Resource }>(`/api/resources/${id}`),

  createResource: (formData: FormData) =>
    request<{ resource: Resource }>('/api/resources', {
      method: 'POST',
      body: formData,
    }),

  addResourceVersion: (id: string, formData: FormData) =>
    request<{ resource: Resource; newVersion: ResourceVersion }>(`/api/resources/${id}/versions`, {
      method: 'POST',
      body: formData,
    }),

  restoreResourceVersion: (id: string, versionNumber: number) =>
    request<{ resource: Resource; restoredVersion: ResourceVersion }>(`/api/resources/${id}/restore-version`, {
      method: 'POST',
      body: JSON.stringify({ versionNumber }),
    }),

  updateResourceStatus: (id: string, status: 'published' | 'pending_approval' | 'rejected', remarks?: string) =>
    request<{ resource: Resource }>(`/api/resources/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks }),
    }),

  trackDownload: (id: string) =>
    request<{ success: boolean; downloadsCount: number; fileUrl: string }>(`/api/resources/${id}/download`, {
      method: 'POST',
    }),

  deleteResource: (id: string) =>
    request<{ success: boolean }>(`/api/resources/${id}`, { method: 'DELETE' }),

  rateResource: (id: string, data: { rating: number; feedback?: string }) =>
    request<{
      success: boolean;
      resource: Resource;
      rating: ResourceRating;
      averageRating: number;
      ratingsCount: number;
    }>(`/api/resources/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getResourceRatings: (id: string) =>
    request<{
      ratings: ResourceRating[];
      averageRating: number;
      ratingsCount: number;
    }>(`/api/resources/${id}/ratings`),

  addComment: (id: string, content: string) =>
    request<{ success: boolean; resource: Resource; comment: ResourceComment }>(
      `/api/resources/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    ),

  // Announcements
  getAnnouncements: () => request<{ announcements: Announcement[] }>('/api/announcements'),
  createAnnouncement: (data: Partial<Announcement>) =>
    request<{ announcement: Announcement }>('/api/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) =>
    request<{ success: boolean }>(`/api/announcements/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: AppNotification[]; unreadCount: number }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),

  // Activity Logs
  getActivityLogs: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ logs: ActivityLog[] }>(`/api/activity-logs${query ? `?${query}` : ''}`);
  },

  // Dashboards
  getAdminStats: () => request<{ stats: AdminStats }>('/api/dashboard/admin'),
  getTeacherStats: () => request<any>('/api/dashboard/teacher'),
  getStudentStats: () => request<any>('/api/dashboard/student'),

  // Settings
  getSettings: () => request<{ settings: SystemSettings }>('/api/settings'),
  updateSettings: (data: Partial<SystemSettings>) =>
    request<{ settings: SystemSettings }>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Supabase Backend Integration
  getSupabaseStatus: () =>
    request<{
      connected: boolean;
      status: number | string;
      projectId: string;
      url: string;
      latencyMs: number;
      message: string;
      tablesDetected: string[];
      maskedKey: string;
      sqlSchema: string;
    }>('/api/supabase/status'),

  syncSupabase: () =>
    request<{
      success: boolean;
      message: string;
      results: Record<string, { attempted: number; successful: number; error?: string }>;
      projectId: string;
    }>('/api/supabase/sync', { method: 'POST' }),
};
