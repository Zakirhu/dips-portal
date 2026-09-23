import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  Branch,
  AcademicClass,
  Subject,
  AcademicSession,
  Resource,
  Announcement,
  AppNotification,
  ActivityLog,
  SystemSettings,
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'dips_db.json');

export interface DatabaseSchema {
  branches: Branch[];
  classes: AcademicClass[];
  subjects: Subject[];
  academicSessions: AcademicSession[];
  users: (User & { passwordHash: string })[];
  resources: Resource[];
  announcements: Announcement[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const defaultBranches: Branch[] = [
  {
    id: 'branch-begowal',
    name: 'DIPS Begowal',
    code: 'BEG',
    city: 'Begowal, Kapurthala',
    address: 'Near Main GT Road, Begowal, Punjab',
    phone: '+91 1822 245100',
    principalName: 'Mrs. Jaswinder Kaur',
    establishedYear: 2004,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-jalandhar',
    name: 'DIPS Urban Estate Jalandhar',
    code: 'JAL',
    city: 'Jalandhar',
    address: 'Phase-I, Urban Estate, Jalandhar, Punjab',
    phone: '+91 181 2284900',
    principalName: 'Dr. Gurveen Kaur',
    establishedYear: 2001,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-gilzian',
    name: 'DIPS Gilzian',
    code: 'GIL',
    city: 'Gilzian, Hoshiarpur',
    address: 'Tanda-Gilzian Highway, Punjab',
    phone: '+91 1886 271220',
    principalName: 'Mr. Harvinder Singh',
    establishedYear: 2008,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-nurmahal',
    name: 'DIPS Nurmahal',
    code: 'NUR',
    city: 'Nurmahal, Jalandhar',
    address: 'Kot Badal Khan Road, Nurmahal, Punjab',
    phone: '+91 1826 244510',
    principalName: 'Mrs. Ritu Pathak',
    establishedYear: 2011,
    totalStudents: 0,
    totalTeachers: 0,
  },
  {
    id: 'branch-tanda',
    name: 'DIPS Tanda',
    code: 'TAN',
    city: 'Urmar Tanda',
    address: 'Near Bus Stand, Urmar Tanda, Punjab',
    phone: '+91 1886 223400',
    principalName: 'Mrs. Seema Sharma',
    establishedYear: 2014,
    totalStudents: 0,
    totalTeachers: 0,
  },
];

const defaultClasses: AcademicClass[] = [
  { id: 'class-6', name: 'Class VI', code: 'VI', order: 6, sections: ['A', 'B', 'C'] },
  { id: 'class-7', name: 'Class VII', code: 'VII', order: 7, sections: ['A', 'B', 'C'] },
  { id: 'class-8', name: 'Class VIII', code: 'VIII', order: 8, sections: ['A', 'B', 'C'] },
  { id: 'class-9', name: 'Class IX', code: 'IX', order: 9, sections: ['A', 'B', 'C', 'D'] },
  { id: 'class-10', name: 'Class X', code: 'X', order: 10, sections: ['A', 'B', 'C', 'D'] },
  { id: 'class-11', name: 'Class XI', code: 'XI', order: 11, sections: ['Medical', 'Non-Medical', 'Commerce', 'Humanities'] },
  { id: 'class-12', name: 'Class XII', code: 'XII', order: 12, sections: ['Medical', 'Non-Medical', 'Commerce', 'Humanities'] },
];

const defaultSubjects: Subject[] = [
  {
    id: 'sub-cs',
    name: 'Computer Science & IT',
    code: 'CS',
    department: 'Information Technology',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'Python, Programming Fundamentals, Data Structures, Web Technology, and CBSE IT curriculum.',
  },
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MATH',
    department: 'Mathematics',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'Algebra, Geometry, Calculus, Arithmetic, and Trigonometry.',
  },
  {
    id: 'sub-sci',
    name: 'Science',
    code: 'SCI',
    department: 'Sciences',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    description: 'General Science covering Physics, Chemistry, and Life Sciences.',
  },
  {
    id: 'sub-eng',
    name: 'English',
    code: 'ENG',
    department: 'Languages',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10', 'class-11', 'class-12'],
    description: 'English Literature, Grammar, Reading Comprehension, and Creative Writing.',
  },
  {
    id: 'sub-sst',
    name: 'Social Science',
    code: 'SST',
    department: 'Social Studies',
    applicableClasses: ['class-6', 'class-7', 'class-8', 'class-9', 'class-10'],
    description: 'History, Civics, Geography, Economics, and Disaster Management.',
  },
  {
    id: 'sub-phy',
    name: 'Physics',
    code: 'PHY',
    department: 'Sciences',
    applicableClasses: ['class-11', 'class-12'],
    description: 'Mechanics, Optics, Thermodynamics, Electromagnetism, Modern Physics.',
  },
  {
    id: 'sub-chem',
    name: 'Chemistry',
    code: 'CHEM',
    department: 'Sciences',
    applicableClasses: ['class-11', 'class-12'],
    description: 'Physical, Organic, and Inorganic Chemistry CBSE Curriculum.',
  },
];

const defaultSessions: AcademicSession[] = [
  { id: 'sess-2026-27', name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', isCurrent: true },
  { id: 'sess-2025-26', name: '2025-26', startDate: '2025-04-01', endDate: '2026-03-31', isCurrent: false },
];

const defaultUsers: (User & { passwordHash: string })[] = [
  // Super Admin: DIPS Begowal Central Directorate
  {
    id: 'user-admin',
    username: 'dipsbegowal@gmail.com',
    email: 'dipsbegowal@gmail.com',
    fullName: 'DIPS Begowal Administration',
    role: 'admin',
    branchId: 'branch-begowal',
    branchName: 'DIPS Begowal',
    isActive: true,
    createdAt: '2026-09-19T00:00:00.000Z',
    phone: '+91 1822 245100',
    passwordHash: hashPassword('dips@1630502'),
  },
];

const defaultResources: Resource[] = [];

const defaultAnnouncements: Announcement[] = [];

const defaultActivityLogs: ActivityLog[] = [];

const defaultSettings: SystemSettings = {
  directPublishing: true, // Teachers can directly publish or toggle to require review
  maxUploadSizeMB: 50,
  allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip', 'mp4', 'mp3'],
  activeSession: '2026-27',
  organizationName: 'DIPS Institutions',
  portalSubtitle: 'Centralized Learning & Resource Portal',
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to read database file, initializing with defaults:', err);
      }
    }
    const initial: DatabaseSchema = {
      branches: defaultBranches,
      classes: defaultClasses,
      subjects: defaultSubjects,
      academicSessions: defaultSessions,
      users: defaultUsers,
      resources: defaultResources,
      announcements: defaultAnnouncements,
      notifications: [],
      activityLogs: defaultActivityLogs,
      settings: defaultSettings,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public persist() {
    this.saveData();
  }

  // --- Auth & Users ---
  public findUserById(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByLogin(identifier: string): (User & { passwordHash: string }) | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find((u) => {
      if (u.username.toLowerCase() === clean) return true;
      if (u.email.toLowerCase() === clean) return true;
      if (u.employeeId && u.employeeId.toLowerCase() === clean) return true;
      if (u.admissionNo && u.admissionNo.toLowerCase() === clean) return true;
      return false;
    });
  }

  public addUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.persist();
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash?: string }>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.persist();
      return this.data.users[idx];
    }
    return null;
  }

  public deleteUser(id: string) {
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.persist();
  }

  // --- Branches ---
  public getBranches(): Branch[] {
    return this.data.branches;
  }

  public addBranch(branch: Branch) {
    this.data.branches.push(branch);
    this.persist();
  }

  public updateBranch(id: string, updates: Partial<Branch>) {
    const idx = this.data.branches.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.branches[idx] = { ...this.data.branches[idx], ...updates };
      this.persist();
      return this.data.branches[idx];
    }
    return null;
  }

  public deleteBranch(id: string) {
    this.data.branches = this.data.branches.filter((b) => b.id !== id);
    this.persist();
  }

  // --- Classes & Subjects ---
  public getClasses(): AcademicClass[] {
    return this.data.classes;
  }

  public addClass(cls: AcademicClass) {
    this.data.classes.push(cls);
    this.persist();
  }

  public updateClass(id: string, updates: Partial<AcademicClass>) {
    const idx = this.data.classes.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.classes[idx] = { ...this.data.classes[idx], ...updates };
      this.persist();
      return this.data.classes[idx];
    }
    return null;
  }

  public deleteClass(id: string) {
    this.data.classes = this.data.classes.filter((c) => c.id !== id);
    this.persist();
  }

  public getSubjects(): Subject[] {
    return this.data.subjects;
  }

  public addSubject(sub: Subject) {
    this.data.subjects.push(sub);
    this.persist();
  }

  public updateSubject(id: string, updates: Partial<Subject>) {
    const idx = this.data.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.subjects[idx] = { ...this.data.subjects[idx], ...updates };
      this.persist();
      return this.data.subjects[idx];
    }
    return null;
  }

  public deleteSubject(id: string) {
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    this.persist();
  }

  // --- Academic Sessions ---
  public getSessions(): AcademicSession[] {
    return this.data.academicSessions;
  }

  // --- Resources ---
  public getResources(): Resource[] {
    return this.data.resources;
  }

  public findResourceById(id: string): Resource | undefined {
    return this.data.resources.find((r) => r.id === id);
  }

  public addResource(resource: Resource) {
    this.data.resources.unshift(resource);
    this.persist();
  }

  public updateResource(id: string, updates: Partial<Resource>) {
    const idx = this.data.resources.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.resources[idx] = { ...this.data.resources[idx], ...updates };
      this.persist();
      return this.data.resources[idx];
    }
    return null;
  }

  public deleteResource(id: string) {
    this.data.resources = this.data.resources.filter((r) => r.id !== id);
    this.persist();
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    return this.data.announcements;
  }

  public addAnnouncement(announcement: Announcement) {
    this.data.announcements.unshift(announcement);
    this.persist();
  }

  public deleteAnnouncement(id: string) {
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    this.persist();
  }

  // --- Notifications ---
  public getNotifications(userId: string): AppNotification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(notification: AppNotification) {
    this.data.notifications.unshift(notification);
    this.persist();
  }

  public markNotificationRead(id: string) {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const entry: ActivityLog = {
      ...log,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(entry);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.persist();
    return entry;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }
}

export const db = new Database();
