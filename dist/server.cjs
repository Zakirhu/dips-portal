var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express12 = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/routes/authRoutes.ts
var import_express = require("express");
var import_crypto3 = __toESM(require("crypto"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "dips_db.json");
function hashPassword(password) {
  return import_crypto.default.createHash("sha256").update(password).digest("hex");
}
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
var defaultBranches = [
  {
    id: "branch-begowal",
    name: "DIPS Begowal",
    code: "BEG",
    city: "Begowal, Kapurthala",
    address: "Near Main GT Road, Begowal, Punjab",
    phone: "+91 1822 245100",
    principalName: "Mrs. Jaswinder Kaur",
    establishedYear: 2004,
    totalStudents: 0,
    totalTeachers: 0
  },
  {
    id: "branch-jalandhar",
    name: "DIPS Urban Estate Jalandhar",
    code: "JAL",
    city: "Jalandhar",
    address: "Phase-I, Urban Estate, Jalandhar, Punjab",
    phone: "+91 181 2284900",
    principalName: "Dr. Gurveen Kaur",
    establishedYear: 2001,
    totalStudents: 0,
    totalTeachers: 0
  },
  {
    id: "branch-gilzian",
    name: "DIPS Gilzian",
    code: "GIL",
    city: "Gilzian, Hoshiarpur",
    address: "Tanda-Gilzian Highway, Punjab",
    phone: "+91 1886 271220",
    principalName: "Mr. Harvinder Singh",
    establishedYear: 2008,
    totalStudents: 0,
    totalTeachers: 0
  },
  {
    id: "branch-nurmahal",
    name: "DIPS Nurmahal",
    code: "NUR",
    city: "Nurmahal, Jalandhar",
    address: "Kot Badal Khan Road, Nurmahal, Punjab",
    phone: "+91 1826 244510",
    principalName: "Mrs. Ritu Pathak",
    establishedYear: 2011,
    totalStudents: 0,
    totalTeachers: 0
  },
  {
    id: "branch-tanda",
    name: "DIPS Tanda",
    code: "TAN",
    city: "Urmar Tanda",
    address: "Near Bus Stand, Urmar Tanda, Punjab",
    phone: "+91 1886 223400",
    principalName: "Mrs. Seema Sharma",
    establishedYear: 2014,
    totalStudents: 0,
    totalTeachers: 0
  }
];
var defaultClasses = [
  { id: "class-6", name: "Class VI", code: "VI", order: 6, sections: ["A", "B", "C"] },
  { id: "class-7", name: "Class VII", code: "VII", order: 7, sections: ["A", "B", "C"] },
  { id: "class-8", name: "Class VIII", code: "VIII", order: 8, sections: ["A", "B", "C"] },
  { id: "class-9", name: "Class IX", code: "IX", order: 9, sections: ["A", "B", "C", "D"] },
  { id: "class-10", name: "Class X", code: "X", order: 10, sections: ["A", "B", "C", "D"] },
  { id: "class-11", name: "Class XI", code: "XI", order: 11, sections: ["Medical", "Non-Medical", "Commerce", "Humanities"] },
  { id: "class-12", name: "Class XII", code: "XII", order: 12, sections: ["Medical", "Non-Medical", "Commerce", "Humanities"] }
];
var defaultSubjects = [
  {
    id: "sub-cs",
    name: "Computer Science & IT",
    code: "CS",
    department: "Information Technology",
    applicableClasses: ["class-6", "class-7", "class-8", "class-9", "class-10", "class-11", "class-12"],
    description: "Python, Programming Fundamentals, Data Structures, Web Technology, and CBSE IT curriculum."
  },
  {
    id: "sub-math",
    name: "Mathematics",
    code: "MATH",
    department: "Mathematics",
    applicableClasses: ["class-6", "class-7", "class-8", "class-9", "class-10", "class-11", "class-12"],
    description: "Algebra, Geometry, Calculus, Arithmetic, and Trigonometry."
  },
  {
    id: "sub-sci",
    name: "Science",
    code: "SCI",
    department: "Sciences",
    applicableClasses: ["class-6", "class-7", "class-8", "class-9", "class-10"],
    description: "General Science covering Physics, Chemistry, and Life Sciences."
  },
  {
    id: "sub-eng",
    name: "English",
    code: "ENG",
    department: "Languages",
    applicableClasses: ["class-6", "class-7", "class-8", "class-9", "class-10", "class-11", "class-12"],
    description: "English Literature, Grammar, Reading Comprehension, and Creative Writing."
  },
  {
    id: "sub-sst",
    name: "Social Science",
    code: "SST",
    department: "Social Studies",
    applicableClasses: ["class-6", "class-7", "class-8", "class-9", "class-10"],
    description: "History, Civics, Geography, Economics, and Disaster Management."
  },
  {
    id: "sub-phy",
    name: "Physics",
    code: "PHY",
    department: "Sciences",
    applicableClasses: ["class-11", "class-12"],
    description: "Mechanics, Optics, Thermodynamics, Electromagnetism, Modern Physics."
  },
  {
    id: "sub-chem",
    name: "Chemistry",
    code: "CHEM",
    department: "Sciences",
    applicableClasses: ["class-11", "class-12"],
    description: "Physical, Organic, and Inorganic Chemistry CBSE Curriculum."
  }
];
var defaultSessions = [
  { id: "sess-2026-27", name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: true },
  { id: "sess-2025-26", name: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31", isCurrent: false }
];
var defaultUsers = [
  // Super Admin: DIPS Begowal Central Directorate
  {
    id: "user-admin",
    username: "dipsbegowal@gmail.com",
    email: "dipsbegowal@gmail.com",
    fullName: "DIPS Begowal Administration",
    role: "admin",
    branchId: "branch-begowal",
    branchName: "DIPS Begowal",
    isActive: true,
    createdAt: "2026-09-19T00:00:00.000Z",
    phone: "+91 1822 245100",
    passwordHash: hashPassword("dips@1630502")
  }
];
var defaultResources = [];
var defaultAnnouncements = [];
var defaultActivityLogs = [];
var defaultSettings = {
  directPublishing: true,
  // Teachers can directly publish or toggle to require review
  maxUploadSizeMB: 50,
  allowedExtensions: ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "jpg", "jpeg", "png", "zip", "mp4", "mp3"],
  activeSession: "2026-27",
  organizationName: "DIPS Institutions",
  portalSubtitle: "Centralized Learning & Resource Portal"
};
var Database = class {
  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }
  ensureDataDir() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = import_path.default.join(process.cwd(), "public", "uploads");
    if (!import_fs.default.existsSync(uploadsDir)) {
      import_fs.default.mkdirSync(uploadsDir, { recursive: true });
    }
  }
  loadData() {
    if (import_fs.default.existsSync(DB_FILE)) {
      try {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to read database file, initializing with defaults:", err);
      }
    }
    const initial = {
      branches: defaultBranches,
      classes: defaultClasses,
      subjects: defaultSubjects,
      academicSessions: defaultSessions,
      users: defaultUsers,
      resources: defaultResources,
      announcements: defaultAnnouncements,
      notifications: [],
      activityLogs: defaultActivityLogs,
      settings: defaultSettings
    };
    this.saveData(initial);
    return initial;
  }
  saveData(dataToSave) {
    try {
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database:", err);
    }
  }
  getRawData() {
    return this.data;
  }
  persist() {
    this.saveData();
  }
  // --- Auth & Users ---
  findUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  findUserByLogin(identifier) {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find((u) => {
      if (u.username.toLowerCase() === clean) return true;
      if (u.email.toLowerCase() === clean) return true;
      if (u.employeeId && u.employeeId.toLowerCase() === clean) return true;
      if (u.admissionNo && u.admissionNo.toLowerCase() === clean) return true;
      return false;
    });
  }
  addUser(user) {
    this.data.users.push(user);
    this.persist();
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.persist();
      return this.data.users[idx];
    }
    return null;
  }
  deleteUser(id) {
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.persist();
  }
  // --- Branches ---
  getBranches() {
    return this.data.branches;
  }
  addBranch(branch) {
    this.data.branches.push(branch);
    this.persist();
  }
  updateBranch(id, updates) {
    const idx = this.data.branches.findIndex((b) => b.id === id);
    if (idx !== -1) {
      this.data.branches[idx] = { ...this.data.branches[idx], ...updates };
      this.persist();
      return this.data.branches[idx];
    }
    return null;
  }
  deleteBranch(id) {
    this.data.branches = this.data.branches.filter((b) => b.id !== id);
    this.persist();
  }
  // --- Classes & Subjects ---
  getClasses() {
    return this.data.classes;
  }
  addClass(cls) {
    this.data.classes.push(cls);
    this.persist();
  }
  updateClass(id, updates) {
    const idx = this.data.classes.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.classes[idx] = { ...this.data.classes[idx], ...updates };
      this.persist();
      return this.data.classes[idx];
    }
    return null;
  }
  deleteClass(id) {
    this.data.classes = this.data.classes.filter((c) => c.id !== id);
    this.persist();
  }
  getSubjects() {
    return this.data.subjects;
  }
  addSubject(sub) {
    this.data.subjects.push(sub);
    this.persist();
  }
  updateSubject(id, updates) {
    const idx = this.data.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.subjects[idx] = { ...this.data.subjects[idx], ...updates };
      this.persist();
      return this.data.subjects[idx];
    }
    return null;
  }
  deleteSubject(id) {
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    this.persist();
  }
  // --- Academic Sessions ---
  getSessions() {
    return this.data.academicSessions;
  }
  // --- Resources ---
  getResources() {
    return this.data.resources;
  }
  findResourceById(id) {
    return this.data.resources.find((r) => r.id === id);
  }
  addResource(resource) {
    this.data.resources.unshift(resource);
    this.persist();
  }
  updateResource(id, updates) {
    const idx = this.data.resources.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.resources[idx] = { ...this.data.resources[idx], ...updates };
      this.persist();
      return this.data.resources[idx];
    }
    return null;
  }
  deleteResource(id) {
    this.data.resources = this.data.resources.filter((r) => r.id !== id);
    this.persist();
  }
  // --- Announcements ---
  getAnnouncements() {
    return this.data.announcements;
  }
  addAnnouncement(announcement) {
    this.data.announcements.unshift(announcement);
    this.persist();
  }
  deleteAnnouncement(id) {
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    this.persist();
  }
  // --- Notifications ---
  getNotifications(userId) {
    return this.data.notifications.filter((n) => n.userId === userId);
  }
  addNotification(notification) {
    this.data.notifications.unshift(notification);
    this.persist();
  }
  markNotificationRead(id) {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }
  markAllNotificationsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }
  // --- Activity Logs ---
  getActivityLogs() {
    return this.data.activityLogs;
  }
  logActivity(log) {
    const entry = {
      ...log,
      id: "act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.activityLogs.unshift(entry);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.persist();
    return entry;
  }
  // --- Settings ---
  getSettings() {
    return this.data.settings;
  }
  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }
};
var db = new Database();

// server/auth.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var SECRET_KEY = process.env.SESSION_SECRET || "dips-centralized-portal-secret-key-2026";
function generateToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = import_crypto2.default.createHmac("sha256", SECRET_KEY).update(str).digest("base64url");
  return `${str}.${sig}`;
}
function parseToken(token) {
  try {
    const [payloadStr, sig] = token.split(".");
    if (!payloadStr || !sig) return null;
    const expectedSig = import_crypto2.default.createHmac("sha256", SECRET_KEY).update(payloadStr).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Missing token." });
  }
  const token = authHeader.split(" ")[1];
  const payload = parseToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
  const user = db.findUserById(payload.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "User account not found or deactivated." });
  }
  const { passwordHash, ...safeUser } = user;
  req.user = safeUser;
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }
  next();
}
function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || req.user.role !== "teacher" && req.user.role !== "coordinator" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Teacher or Admin privileges required." });
  }
  next();
}
function canTeacherAccessSubject(user, subjectId) {
  if (user.role === "admin") return true;
  if (user.role === "teacher" || user.role === "coordinator") {
    return user.assignedSubjectIds?.includes(subjectId) || false;
  }
  return false;
}
function canEditResource(user, resource) {
  if (user.role === "admin") return true;
  if (user.role === "teacher" || user.role === "coordinator") {
    return canTeacherAccessSubject(user, resource.subjectId);
  }
  return false;
}

// server/routes/authRoutes.ts
var authRouter = (0, import_express.Router)();
authRouter.get("/demo-accounts", (req, res) => {
  const users = db.getRawData().users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    fullName: u.fullName,
    branchName: u.branchName,
    employeeId: u.employeeId,
    admissionNo: u.admissionNo,
    designation: u.designation,
    className: u.className,
    section: u.section
  }));
  res.json({ accounts: users });
});
authRouter.post("/register-teacher", (req, res) => {
  const {
    fullName,
    email,
    employeeId: customEmployeeId,
    password,
    branchId,
    phone,
    designation,
    assignedSubjectIds,
    assignedClassIds
  } = req.body;
  if (!fullName || !email || !password || !branchId) {
    return res.status(400).json({ error: "Full name, email, password, and branch campus are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const existingByEmail = db.findUserByLogin(cleanEmail);
  if (existingByEmail) {
    return res.status(400).json({ error: `An account with email "${cleanEmail}" already exists. Please login instead.` });
  }
  const branch = db.getBranches().find((b) => b.id === branchId);
  if (!branch) {
    return res.status(400).json({ error: "Selected DIPS branch campus was not found." });
  }
  const branchCode = branch.code || "DIPS";
  const employeeId = customEmployeeId && customEmployeeId.trim() ? customEmployeeId.trim().toUpperCase() : `EMP-${branchCode}-${Math.floor(100 + Math.random() * 900)}`;
  const existingByEmpId = db.findUserByLogin(employeeId);
  if (existingByEmpId) {
    return res.status(400).json({ error: `An account with Employee ID "${employeeId}" already exists.` });
  }
  const username = employeeId.toLowerCase().replace(/[^a-z0-9]/g, "") || cleanEmail.split("@")[0];
  const passwordHash = import_crypto3.default.createHash("sha256").update(password).digest("hex");
  const newTeacher = {
    id: "user-tea-" + Date.now().toString().slice(-6),
    username,
    email: cleanEmail,
    fullName: fullName.trim(),
    role: "teacher",
    branchId: branch.id,
    branchName: branch.name,
    employeeId,
    designation: designation || "TGT Teacher",
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
    assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
    phone: phone ? phone.trim() : "",
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    passwordHash
  };
  db.addUser(newTeacher);
  if (typeof branch.totalTeachers === "number") {
    db.updateBranch(branch.id, { totalTeachers: branch.totalTeachers + 1 });
  }
  db.logActivity({
    userId: newTeacher.id,
    userName: newTeacher.fullName,
    userRole: newTeacher.role,
    branchName: branch.name,
    action: "LOGIN",
    details: `Teacher self-registered institutional account (${newTeacher.fullName}, ${employeeId}) at ${branch.name}.`,
    ipAddress: req.ip
  });
  const { passwordHash: _, ...safeUser } = newTeacher;
  const token = generateToken(safeUser);
  return res.status(201).json({
    token,
    user: safeUser,
    message: "Faculty account registered successfully! You can now access your teacher workspace or log in anytime using your Employee ID or Email."
  });
});
authRouter.post("/login", (req, res) => {
  const { username, password, expectedRole } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username/ID and password are required." });
  }
  const user = db.findUserByLogin(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. User not found." });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: "Your account has been deactivated by the DIPS administration." });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials. Incorrect password." });
  }
  if (expectedRole && user.role !== "admin" && user.role !== expectedRole) {
    return res.status(403).json({
      error: `You are trying to log in via the ${expectedRole} portal, but your account role is "${user.role}". Please select the correct login tab.`
    });
  }
  const { passwordHash, ...safeUser } = user;
  const token = generateToken(safeUser);
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || "DIPS Central",
    action: "LOGIN",
    details: `User logged into DIPS portal from ${user.branchName || "central system"}.`,
    ipAddress: req.ip
  });
  return res.json({
    token,
    user: safeUser
  });
});
authRouter.get("/me", authMiddleware, (req, res) => {
  const user = req.user;
  const allSubjects = db.getSubjects();
  const allClasses = db.getClasses();
  const allBranches = db.getBranches();
  const branch = allBranches.find((b) => b.id === user.branchId);
  let enrichedUser = {
    ...user,
    branchName: branch?.name || user.branchName
  };
  if (user.role === "teacher" || user.role === "coordinator") {
    enrichedUser = {
      ...enrichedUser,
      assignedSubjects: allSubjects.filter((s) => user.assignedSubjectIds?.includes(s.id)),
      assignedClasses: allClasses.filter((c) => user.assignedClassIds?.includes(c.id))
    };
  }
  return res.json({ user: enrichedUser });
});
authRouter.post("/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }
  const userWithHash = db.findUserById(req.user.id);
  if (!userWithHash) return res.status(404).json({ error: "User not found" });
  if (!verifyPassword(currentPassword, userWithHash.passwordHash)) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }
  const newHash = import_crypto3.default.createHash("sha256").update(newPassword).digest("hex");
  db.updateUser(req.user.id, { passwordHash: newHash });
  return res.json({ success: true, message: "Password successfully updated." });
});

// server/routes/branchRoutes.ts
var import_express2 = require("express");
var branchRouter = (0, import_express2.Router)();
branchRouter.get("/", (req, res) => {
  const branches = db.getBranches();
  const allUsers = db.getRawData().users;
  const enriched = branches.map((b) => {
    const totalTeachers = allUsers.filter((u) => u.branchId === b.id && (u.role === "teacher" || u.role === "coordinator")).length;
    const totalStudents = allUsers.filter((u) => u.branchId === b.id && u.role === "student").length;
    return {
      ...b,
      totalTeachers: totalTeachers || b.totalTeachers,
      totalStudents: totalStudents || b.totalStudents
    };
  });
  res.json({ branches: enriched });
});
branchRouter.post("/", authMiddleware, requireAdmin, (req, res) => {
  const { name, code, city, address, phone, principalName, establishedYear } = req.body;
  if (!name || !code || !city) {
    return res.status(400).json({ error: "Branch name, code, and city are required." });
  }
  const newBranch = {
    id: "branch-" + code.toLowerCase().replace(/[^a-z0-9]/g, "") + "-" + Date.now().toString().slice(-4),
    name,
    code: code.toUpperCase(),
    city,
    address: address || "",
    phone: phone || "",
    principalName: principalName || "",
    establishedYear: Number(establishedYear) || (/* @__PURE__ */ new Date()).getFullYear(),
    totalStudents: 0,
    totalTeachers: 0
  };
  db.addBranch(newBranch);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPLOAD",
    details: `Added new DIPS branch: "${name}" (${code}).`
  });
  return res.status(201).json({ branch: newBranch });
});
branchRouter.put("/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateBranch(id, req.body);
  if (!updated) return res.status(404).json({ error: "Branch not found" });
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPDATE",
    details: `Updated details for DIPS branch: "${updated.name}".`
  });
  return res.json({ branch: updated });
});
branchRouter.delete("/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const branch = db.getBranches().find((b) => b.id === id);
  if (!branch) return res.status(404).json({ error: "Branch not found" });
  db.deleteBranch(id);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "DELETE",
    details: `Deleted DIPS branch: "${branch.name}".`
  });
  return res.json({ success: true, message: "Branch removed successfully." });
});

// server/routes/academicRoutes.ts
var import_express3 = require("express");
var academicRouter = (0, import_express3.Router)();
academicRouter.get("/classes", (req, res) => {
  res.json({ classes: db.getClasses() });
});
academicRouter.post("/classes", authMiddleware, requireAdmin, (req, res) => {
  const { name, code, order, sections } = req.body;
  if (!name || !code) return res.status(400).json({ error: "Class name and code are required." });
  const newClass = {
    id: "class-" + code.toLowerCase().replace(/[^a-z0-9]/g, "") + "-" + Date.now().toString().slice(-4),
    name,
    code,
    order: Number(order) || 1,
    sections: Array.isArray(sections) && sections.length > 0 ? sections : ["A", "B"]
  };
  db.addClass(newClass);
  return res.status(201).json({ class: newClass });
});
academicRouter.put("/classes/:id", authMiddleware, requireAdmin, (req, res) => {
  const updated = db.updateClass(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Class not found" });
  return res.json({ class: updated });
});
academicRouter.delete("/classes/:id", authMiddleware, requireAdmin, (req, res) => {
  db.deleteClass(req.params.id);
  return res.json({ success: true });
});
academicRouter.get("/subjects", (req, res) => {
  res.json({ subjects: db.getSubjects() });
});
academicRouter.post("/subjects", authMiddleware, requireAdmin, (req, res) => {
  const { name, code, department, applicableClasses, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: "Subject name and code are required." });
  const newSubject = {
    id: "sub-" + code.toLowerCase().replace(/[^a-z0-9]/g, "") + "-" + Date.now().toString().slice(-4),
    name,
    code,
    department: department || "General",
    applicableClasses: Array.isArray(applicableClasses) ? applicableClasses : [],
    description: description || ""
  };
  db.addSubject(newSubject);
  return res.status(201).json({ subject: newSubject });
});
academicRouter.put("/subjects/:id", authMiddleware, requireAdmin, (req, res) => {
  const updated = db.updateSubject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Subject not found" });
  return res.json({ subject: updated });
});
academicRouter.delete("/subjects/:id", authMiddleware, requireAdmin, (req, res) => {
  db.deleteSubject(req.params.id);
  return res.json({ success: true });
});
academicRouter.get("/sessions", (req, res) => {
  res.json({ sessions: db.getSessions() });
});

// server/routes/userRoutes.ts
var import_express4 = require("express");
var import_crypto4 = __toESM(require("crypto"), 1);
var userRouter = (0, import_express4.Router)();
userRouter.get("/teachers", authMiddleware, (req, res) => {
  const allUsers = db.getRawData().users;
  const teachers = allUsers.filter((u) => u.role === "teacher" || u.role === "coordinator").map(({ passwordHash, ...safeUser }) => safeUser);
  res.json({ teachers });
});
userRouter.post("/teachers", authMiddleware, requireAdmin, (req, res) => {
  const {
    fullName,
    employeeId,
    email,
    phone,
    branchId,
    designation,
    assignedSubjectIds,
    assignedClassIds,
    initialPassword,
    role
  } = req.body;
  if (!fullName || !employeeId || !branchId) {
    return res.status(400).json({ error: "Full name, Employee ID, and Branch are required." });
  }
  if (db.findUserByLogin(employeeId)) {
    return res.status(400).json({ error: `An account with Employee ID/Username "${employeeId}" already exists.` });
  }
  const branch = db.getBranches().find((b) => b.id === branchId);
  const password = initialPassword || "teacher123";
  const passwordHash = import_crypto4.default.createHash("sha256").update(password).digest("hex");
  const newTeacher = {
    id: "user-tea-" + Date.now().toString().slice(-5),
    username: employeeId.toLowerCase().replace(/[^a-z0-9]/g, ""),
    email: email || `${employeeId.toLowerCase()}@dips.edu.in`,
    fullName,
    role: role === "coordinator" ? "coordinator" : "teacher",
    branchId,
    branchName: branch?.name || "DIPS Branch",
    employeeId,
    designation: designation || "TGT Teacher",
    assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
    assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
    phone: phone || "",
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    passwordHash
  };
  db.addUser(newTeacher);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPLOAD",
    details: `Added new faculty member: ${fullName} (${employeeId}) at ${branch?.name}.`
  });
  const { passwordHash: _, ...safe } = newTeacher;
  return res.status(201).json({ teacher: safe });
});
userRouter.put("/teachers/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const teacher = db.findUserById(id);
  if (!teacher || teacher.role !== "teacher" && teacher.role !== "coordinator") {
    return res.status(404).json({ error: "Teacher not found" });
  }
  const {
    fullName,
    employeeId,
    email,
    phone,
    branchId,
    designation,
    assignedSubjectIds,
    assignedClassIds,
    isActive,
    role
  } = req.body;
  let branchName = teacher.branchName;
  if (branchId) {
    const b = db.getBranches().find((item) => item.id === branchId);
    if (b) branchName = b.name;
  }
  const updated = db.updateUser(id, {
    fullName: fullName ?? teacher.fullName,
    employeeId: employeeId ?? teacher.employeeId,
    email: email ?? teacher.email,
    phone: phone ?? teacher.phone,
    branchId: branchId ?? teacher.branchId,
    branchName,
    designation: designation ?? teacher.designation,
    assignedSubjectIds: assignedSubjectIds ?? teacher.assignedSubjectIds,
    assignedClassIds: assignedClassIds ?? teacher.assignedClassIds,
    isActive: typeof isActive === "boolean" ? isActive : teacher.isActive,
    role: role ?? teacher.role
  });
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPDATE",
    details: `Updated teacher profile & assignments for ${teacher.fullName}.`
  });
  const { passwordHash: _, ...safe } = updated;
  return res.json({ teacher: safe });
});
userRouter.delete("/teachers/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const teacher = db.findUserById(id);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });
  db.deleteUser(id);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "DELETE",
    details: `Removed teacher account: ${teacher.fullName} (${teacher.employeeId}).`
  });
  return res.json({ success: true });
});
userRouter.get("/students", authMiddleware, (req, res) => {
  const allUsers = db.getRawData().users;
  const students = allUsers.filter((u) => u.role === "student").map(({ passwordHash, ...safeUser }) => safeUser);
  res.json({ students });
});
userRouter.post("/students", authMiddleware, requireAdmin, (req, res) => {
  const {
    fullName,
    admissionNo,
    email,
    phone,
    branchId,
    classId,
    section,
    rollNo,
    academicSessionId,
    initialPassword
  } = req.body;
  if (!fullName || !admissionNo || !branchId || !classId) {
    return res.status(400).json({ error: "Full name, Admission No, Branch, and Class are required." });
  }
  if (db.findUserByLogin(admissionNo)) {
    return res.status(400).json({ error: `A student with Admission No "${admissionNo}" already exists.` });
  }
  const branch = db.getBranches().find((b) => b.id === branchId);
  const cls = db.getClasses().find((c) => c.id === classId);
  const password = initialPassword || "student123";
  const passwordHash = import_crypto4.default.createHash("sha256").update(password).digest("hex");
  const newStudent = {
    id: "user-stu-" + Date.now().toString().slice(-5),
    username: admissionNo,
    email: email || `${admissionNo.toLowerCase()}@student.dips.edu.in`,
    fullName,
    role: "student",
    branchId,
    branchName: branch?.name || "DIPS Branch",
    admissionNo,
    classId,
    className: cls?.name || "Class VII",
    section: section || "A",
    rollNo: rollNo || "01",
    academicSessionId: academicSessionId || "sess-2026-27",
    phone: phone || "",
    isActive: true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    passwordHash
  };
  db.addUser(newStudent);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPLOAD",
    details: `Enrolled new student: ${fullName} (${admissionNo}) in ${cls?.name}-${section} at ${branch?.name}.`
  });
  const { passwordHash: _, ...safe } = newStudent;
  return res.status(201).json({ student: safe });
});
userRouter.put("/students/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const student = db.findUserById(id);
  if (!student || student.role !== "student") {
    return res.status(404).json({ error: "Student not found" });
  }
  const {
    fullName,
    admissionNo,
    email,
    phone,
    branchId,
    classId,
    section,
    rollNo,
    academicSessionId,
    isActive
  } = req.body;
  let branchName = student.branchName;
  if (branchId) {
    const b = db.getBranches().find((item) => item.id === branchId);
    if (b) branchName = b.name;
  }
  let className = student.className;
  if (classId) {
    const c = db.getClasses().find((item) => item.id === classId);
    if (c) className = c.name;
  }
  const updated = db.updateUser(id, {
    fullName: fullName ?? student.fullName,
    admissionNo: admissionNo ?? student.admissionNo,
    email: email ?? student.email,
    phone: phone ?? student.phone,
    branchId: branchId ?? student.branchId,
    branchName,
    classId: classId ?? student.classId,
    className,
    section: section ?? student.section,
    rollNo: rollNo ?? student.rollNo,
    academicSessionId: academicSessionId ?? student.academicSessionId,
    isActive: typeof isActive === "boolean" ? isActive : student.isActive
  });
  const { passwordHash: _, ...safe } = updated;
  return res.json({ student: safe });
});
userRouter.delete("/students/:id", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const student = db.findUserById(id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  db.deleteUser(id);
  return res.json({ success: true });
});
userRouter.post("/:id/reset-password", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const user = db.findUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const targetPassword = newPassword || (user.role === "student" ? "student123" : "teacher123");
  const newHash = import_crypto4.default.createHash("sha256").update(targetPassword).digest("hex");
  db.updateUser(id, { passwordHash: newHash });
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPDATE",
    details: `Reset password for ${user.fullName} (${user.username}).`
  });
  return res.json({ success: true, message: `Password reset to "${targetPassword}".` });
});
userRouter.post("/:id/toggle-status", authMiddleware, requireAdmin, (req, res) => {
  const { id } = req.params;
  const user = db.findUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const updated = db.updateUser(id, { isActive: !user.isActive });
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "Central Admin",
    action: "UPDATE",
    details: `${updated?.isActive ? "Activated" : "Deactivated"} account for ${user.fullName}.`
  });
  return res.json({ success: true, isActive: updated?.isActive });
});

// server/routes/resourceRoutes.ts
var import_express5 = require("express");
var import_multer = __toESM(require("multer"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var resourceRouter = (0, import_express5.Router)();
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = import_path2.default.join(process.cwd(), "public", "uploads");
    if (!import_fs2.default.existsSync(uploadPath)) {
      import_fs2.default.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e4);
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50 MB
});
resourceRouter.get("/", authMiddleware, (req, res) => {
  const user = req.user;
  const {
    subjectId,
    classId,
    branchId,
    category,
    contentType,
    academicSession,
    status,
    search,
    mine,
    mySubjectsOnly
  } = req.query;
  let resources = db.getResources();
  if (user.role === "student") {
    resources = resources.filter((r) => {
      if (user.classId && r.classId !== user.classId) return false;
      return r.status === "published";
    });
  }
  if ((user.role === "teacher" || user.role === "coordinator") && mySubjectsOnly === "true") {
    resources = resources.filter((r) => user.assignedSubjectIds?.includes(r.subjectId));
  }
  if (mine === "true") {
    resources = resources.filter((r) => r.uploadedByUserId === user.id || r.lastUpdatedByUserId === user.id);
  }
  if (subjectId && subjectId !== "all") {
    resources = resources.filter((r) => r.subjectId === subjectId);
  }
  if (classId && classId !== "all") {
    resources = resources.filter((r) => r.classId === classId);
  }
  if (branchId && branchId !== "all") {
    resources = resources.filter((r) => r.branchId === branchId);
  }
  if (category && category !== "all") {
    resources = resources.filter((r) => r.category === category);
  }
  if (contentType && contentType !== "all") {
    resources = resources.filter((r) => r.contentType === contentType);
  }
  if (academicSession && academicSession !== "all") {
    resources = resources.filter((r) => r.academicSession === academicSession);
  }
  if (status && status !== "all") {
    resources = resources.filter((r) => r.status === status);
  }
  if (search) {
    const q = search.toLowerCase().trim();
    resources = resources.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.chapter.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q) || r.subjectName.toLowerCase().includes(q) || r.className.toLowerCase().includes(q) || r.uploadedByName.toLowerCase().includes(q) || r.branchName.toLowerCase().includes(q) || r.fileName.toLowerCase().includes(q)
    );
  }
  res.json({ resources });
});
resourceRouter.get("/:id", authMiddleware, (req, res) => {
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  if (req.user.role === "student" && req.user.classId && resource.classId !== req.user.classId) {
    return res.status(403).json({ error: "You are not authorized to view content from another class." });
  }
  resource.viewsCount = (resource.viewsCount || 0) + 1;
  db.persist();
  res.json({ resource });
});
resourceRouter.post(
  "/",
  authMiddleware,
  requireTeacherOrAdmin,
  upload.single("file"),
  (req, res) => {
    const user = req.user;
    const {
      title,
      description,
      subjectId,
      classId,
      branchId,
      chapter,
      topic,
      category,
      contentType,
      academicSession,
      externalLink,
      contentSnippet
    } = req.body;
    if (!title || !subjectId || !classId || !chapter) {
      return res.status(400).json({ error: "Title, Subject, Class, and Chapter are required." });
    }
    if (!canTeacherAccessSubject(user, subjectId)) {
      return res.status(403).json({
        error: "You can only upload content for subjects assigned to your teaching profile."
      });
    }
    const subject = db.getSubjects().find((s) => s.id === subjectId);
    const cls = db.getClasses().find((c) => c.id === classId);
    const branch = db.getBranches().find((b) => b.id === (branchId || user.branchId));
    let fileUrl = "";
    let fileName = "";
    let fileSize = 0;
    let fileType = "";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    } else if (externalLink) {
      fileUrl = externalLink;
      fileName = title + (contentType ? ` (${contentType})` : "");
      fileSize = 0;
      fileType = "link";
    } else {
      fileUrl = "/uploads/sample-cs-looping-notes.pdf";
      fileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      fileSize = 1024 * 100;
      fileType = "application/pdf";
    }
    const settings = db.getSettings();
    const initialStatus = user.role === "admin" || settings.directPublishing ? "published" : "pending_approval";
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const resourceId = "res-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const initialVersion = {
      versionNumber: 1,
      versionTitle: "Initial Release",
      changelog: "Initial upload of resource to DIPS portal.",
      fileUrl,
      fileName,
      fileSize,
      fileType,
      uploadedByUserId: user.id,
      uploadedByUserName: user.fullName,
      uploadedByUserBranch: branch?.name || user.branchName || "DIPS Branch",
      uploadedAt: now,
      contentSnippet: contentSnippet || description
    };
    const newResource = {
      id: resourceId,
      title,
      description: description || "",
      subjectId,
      subjectName: subject?.name || "Subject",
      classId,
      className: cls?.name || "Class",
      branchId: branch?.id || user.branchId,
      branchName: branch?.name || user.branchName || "DIPS Branch",
      chapter,
      topic: topic || "General",
      category: category || "Study Material",
      contentType: contentType || "PDF",
      academicSession: academicSession || settings.activeSession || "2026-27",
      status: initialStatus,
      currentVersion: 1,
      versions: [initialVersion],
      fileName,
      fileUrl,
      fileSize,
      externalLink: externalLink || void 0,
      uploadedByUserId: user.id,
      uploadedByName: user.fullName,
      uploadedByBranch: branch?.name || user.branchName || "DIPS Branch",
      uploadedByEmployeeId: user.employeeId,
      lastUpdatedByUserId: user.id,
      lastUpdatedByName: user.fullName,
      lastUpdatedByBranch: branch?.name || user.branchName || "DIPS Branch",
      createdAt: now,
      updatedAt: now,
      downloadsCount: 0,
      viewsCount: 0
    };
    db.addResource(newResource);
    db.logActivity({
      userId: user.id,
      userName: `${user.fullName} (${user.employeeId || user.role})`,
      userRole: user.role,
      branchName: branch?.name || user.branchName || "DIPS Branch",
      action: "UPLOAD",
      resourceTitle: title,
      subjectName: subject?.name,
      details: `Uploaded new ${contentType} resource for ${cls?.name} ${subject?.name} (${initialStatus}).`
    });
    const allTeachers = db.getRawData().users.filter(
      (u) => (u.role === "teacher" || u.role === "coordinator") && u.id !== user.id && u.assignedSubjectIds?.includes(subjectId)
    );
    allTeachers.forEach((t) => {
      db.addNotification({
        id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        userId: t.id,
        title: `New Resource: ${subject?.name}`,
        message: `${user.fullName} (${branch?.name}) shared "${title}" for ${cls?.name}.`,
        type: "resource_upload",
        link: `/resources?subjectId=${subjectId}`,
        isRead: false,
        createdAt: now
      });
    });
    if (initialStatus === "published") {
      const studentsOfClass = db.getRawData().users.filter(
        (u) => u.role === "student" && u.classId === classId
      );
      studentsOfClass.forEach((st) => {
        db.addNotification({
          id: "notif-st-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          userId: st.id,
          title: `New Study Material in ${subject?.name}`,
          message: `New ${contentType} uploaded for ${chapter}: "${title}".`,
          type: "resource_upload",
          link: `/student/study-material`,
          isRead: false,
          createdAt: now
        });
      });
    }
    return res.status(201).json({ resource: newResource });
  }
);
resourceRouter.post(
  "/:id/versions",
  authMiddleware,
  requireTeacherOrAdmin,
  upload.single("file"),
  (req, res) => {
    const user = req.user;
    const resource = db.findResourceById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    if (!canEditResource(user, resource)) {
      return res.status(403).json({
        error: `Permission denied. You can only collaborate on and update resources for subjects assigned to you (${resource.subjectName}).`
      });
    }
    const { versionTitle, changelog, externalLink, contentSnippet } = req.body;
    let fileUrl = resource.fileUrl;
    let fileName = resource.fileName;
    let fileSize = resource.fileSize;
    let fileType = "application/pdf";
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    } else if (externalLink) {
      fileUrl = externalLink;
      fileName = `${resource.title} (Updated Link)`;
      fileSize = 0;
      fileType = "link";
    }
    const nextVersionNumber = resource.currentVersion + 1;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const userBranch = db.getBranches().find((b) => b.id === user.branchId);
    const newVersion = {
      versionNumber: nextVersionNumber,
      versionTitle: versionTitle || `Version ${nextVersionNumber} Update`,
      changelog: changelog || `Collaborative update by ${user.fullName} (${userBranch?.name || user.branchName}).`,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      uploadedByUserId: user.id,
      uploadedByUserName: user.fullName,
      uploadedByUserBranch: userBranch?.name || user.branchName || "DIPS Branch",
      uploadedAt: now,
      contentSnippet: contentSnippet || void 0
    };
    resource.versions.unshift(newVersion);
    resource.currentVersion = nextVersionNumber;
    resource.fileUrl = fileUrl;
    resource.fileName = fileName;
    resource.fileSize = fileSize;
    resource.lastUpdatedByUserId = user.id;
    resource.lastUpdatedByName = user.fullName;
    resource.lastUpdatedByBranch = userBranch?.name || user.branchName || "DIPS Branch";
    resource.updatedAt = now;
    db.persist();
    db.logActivity({
      userId: user.id,
      userName: `${user.fullName} (${user.employeeId || user.role})`,
      userRole: user.role,
      branchName: userBranch?.name || user.branchName || "DIPS Branch",
      action: "UPDATE",
      resourceTitle: resource.title,
      subjectName: resource.subjectName,
      details: `Teacher collaboration: Updated "${resource.title}" to Version ${nextVersionNumber} (${changelog || "Material updated"}).`
    });
    if (resource.uploadedByUserId !== user.id) {
      db.addNotification({
        id: "notif-" + Date.now(),
        userId: resource.uploadedByUserId,
        title: "Resource Enhanced by Colleague",
        message: `${user.fullName} (${userBranch?.name}) added Version ${nextVersionNumber} to your resource "${resource.title}".`,
        type: "resource_updated",
        isRead: false,
        createdAt: now
      });
    }
    return res.json({ resource, newVersion });
  }
);
resourceRouter.post("/:id/restore-version", authMiddleware, requireTeacherOrAdmin, (req, res) => {
  const user = req.user;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  if (!canEditResource(user, resource)) {
    return res.status(403).json({ error: "Unauthorized to modify this resource" });
  }
  const { versionNumber } = req.body;
  const targetVersion = resource.versions.find((v) => v.versionNumber === Number(versionNumber));
  if (!targetVersion) return res.status(404).json({ error: "Specified version not found" });
  resource.fileUrl = targetVersion.fileUrl;
  resource.fileName = targetVersion.fileName;
  resource.fileSize = targetVersion.fileSize;
  resource.currentVersion = targetVersion.versionNumber;
  resource.lastUpdatedByUserId = user.id;
  resource.lastUpdatedByName = user.fullName;
  resource.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.persist();
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || "DIPS Central",
    action: "RESTORE",
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Restored version ${targetVersion.versionNumber} ("${targetVersion.versionTitle}") for "${resource.title}".`
  });
  return res.json({ resource, restoredVersion: targetVersion });
});
resourceRouter.post("/:id/status", authMiddleware, (req, res) => {
  const user = req.user;
  if (user.role !== "admin" && user.role !== "coordinator") {
    return res.status(403).json({ error: "Only Administrators or Academic Coordinators can approve/reject content." });
  }
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  const { status, remarks } = req.body;
  if (!["published", "rejected", "pending_approval"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  resource.status = status;
  resource.approvalRemarks = remarks || "";
  resource.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  db.persist();
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || "DIPS Central",
    action: status === "published" ? "APPROVE" : "REJECT",
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `${status === "published" ? "Approved" : "Rejected"} content "${resource.title}". Remarks: ${remarks || "None"}.`
  });
  db.addNotification({
    id: "notif-" + Date.now(),
    userId: resource.uploadedByUserId,
    title: `Resource ${status === "published" ? "Approved" : "Status Updated"}`,
    message: `Your resource "${resource.title}" was marked as ${status} by ${user.fullName}. ${remarks ? `Remarks: ${remarks}` : ""}`,
    type: "approval",
    isRead: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return res.json({ resource });
});
resourceRouter.post("/:id/download", authMiddleware, (req, res) => {
  const user = req.user;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  resource.downloadsCount = (resource.downloadsCount || 0) + 1;
  db.persist();
  db.logActivity({
    userId: user.id,
    userName: `${user.fullName} (${user.admissionNo || user.employeeId || user.role})`,
    userRole: user.role,
    branchName: user.branchName || "DIPS Branch",
    action: "DOWNLOAD",
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Downloaded "${resource.fileName}" (Version ${resource.currentVersion}).`
  });
  res.json({ success: true, downloadsCount: resource.downloadsCount, fileUrl: resource.fileUrl });
});
resourceRouter.delete("/:id", authMiddleware, requireTeacherOrAdmin, (req, res) => {
  const user = req.user;
  const resource = db.findResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  if (user.role !== "admin" && resource.uploadedByUserId !== user.id) {
    return res.status(403).json({ error: "You can only delete resources uploaded by yourself." });
  }
  db.deleteResource(resource.id);
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: user.branchName || "DIPS Central",
    action: "DELETE",
    resourceTitle: resource.title,
    subjectName: resource.subjectName,
    details: `Deleted educational resource: "${resource.title}".`
  });
  return res.json({ success: true });
});

// server/routes/announcementRoutes.ts
var import_express6 = require("express");
var announcementRouter = (0, import_express6.Router)();
announcementRouter.get("/", authMiddleware, (req, res) => {
  const user = req.user;
  const all = db.getAnnouncements();
  const filtered = all.filter((a) => {
    if (a.targetBranchId && a.targetBranchId !== user.branchId && user.role !== "admin") {
      return false;
    }
    if (a.targetRole && a.targetRole !== "all" && a.targetRole !== user.role && user.role !== "admin") {
      return false;
    }
    if (a.targetClassId && user.role === "student" && a.targetClassId !== user.classId) {
      return false;
    }
    return true;
  });
  res.json({ announcements: filtered });
});
announcementRouter.post("/", authMiddleware, requireAdmin, (req, res) => {
  const user = req.user;
  const { title, content, priority, targetBranchId, targetRole, targetClassId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  const newAnnouncement = {
    id: "anc-" + Date.now(),
    title,
    content,
    priority: priority || "normal",
    targetBranchId: targetBranchId || void 0,
    targetRole: targetRole || "all",
    targetClassId: targetClassId || void 0,
    authorName: user.fullName,
    authorRole: "Administrator",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.addAnnouncement(newAnnouncement);
  db.logActivity({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    branchName: "DIPS Central",
    action: "UPLOAD",
    details: `Published organization announcement: "${title}".`
  });
  return res.status(201).json({ announcement: newAnnouncement });
});
announcementRouter.delete("/:id", authMiddleware, requireAdmin, (req, res) => {
  db.deleteAnnouncement(req.params.id);
  return res.json({ success: true });
});

// server/routes/notificationRoutes.ts
var import_express7 = require("express");
var notificationRouter = (0, import_express7.Router)();
notificationRouter.get("/", authMiddleware, (req, res) => {
  const user = req.user;
  const notifs = db.getNotifications(user.id);
  res.json({ notifications: notifs, unreadCount: notifs.filter((n) => !n.isRead).length });
});
notificationRouter.post("/:id/read", authMiddleware, (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});
notificationRouter.post("/read-all", authMiddleware, (req, res) => {
  db.markAllNotificationsRead(req.user.id);
  res.json({ success: true });
});

// server/routes/activityLogRoutes.ts
var import_express8 = require("express");
var activityLogRouter = (0, import_express8.Router)();
activityLogRouter.get("/", authMiddleware, requireAdmin, (req, res) => {
  const { userId, branchName, subjectName, action, search } = req.query;
  let logs = db.getActivityLogs();
  if (userId && userId !== "all") {
    logs = logs.filter((l) => l.userId === userId);
  }
  if (branchName && branchName !== "all") {
    logs = logs.filter((l) => l.branchName?.toLowerCase().includes(branchName.toLowerCase()));
  }
  if (subjectName && subjectName !== "all") {
    logs = logs.filter((l) => l.subjectName === subjectName);
  }
  if (action && action !== "all") {
    logs = logs.filter((l) => l.action === action);
  }
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) => l.userName.toLowerCase().includes(q) || l.details.toLowerCase().includes(q) || l.resourceTitle?.toLowerCase().includes(q) || l.branchName.toLowerCase().includes(q)
    );
  }
  res.json({ logs });
});

// server/routes/dashboardRoutes.ts
var import_express9 = require("express");
var dashboardRouter = (0, import_express9.Router)();
dashboardRouter.get("/admin", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const raw = db.getRawData();
  const teachers = raw.users.filter((u) => u.role === "teacher" || u.role === "coordinator");
  const students = raw.users.filter((u) => u.role === "student");
  const activeUsers = raw.users.filter((u) => u.isActive);
  let totalStorageBytes = 0;
  raw.resources.forEach((r) => {
    r.versions.forEach((v) => {
      totalStorageBytes += v.fileSize || 0;
    });
  });
  const recentlyUploaded = [...raw.resources].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentlyUpdated = [...raw.resources].filter((r) => r.currentVersion > 1 || r.updatedAt !== r.createdAt).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const pendingApprovals = raw.resources.filter((r) => r.status === "pending_approval").length;
  const stats = {
    totalBranches: raw.branches.length,
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalSubjects: raw.subjects.length,
    totalClasses: raw.classes.length,
    totalResources: raw.resources.length,
    pendingApprovals,
    storageUsageBytes: totalStorageBytes,
    activeUsersCount: activeUsers.length,
    recentlyUploaded,
    recentlyUpdated
  };
  res.json({ stats });
});
dashboardRouter.get("/teacher", authMiddleware, (req, res) => {
  const user = req.user;
  const raw = db.getRawData();
  const mySubjects = raw.subjects.filter((s) => user.assignedSubjectIds?.includes(s.id));
  const myClasses = raw.classes.filter((c) => user.assignedClassIds?.includes(c.id));
  const myUploaded = raw.resources.filter((r) => r.uploadedByUserId === user.id);
  const mySubjectResources = raw.resources.filter((r) => user.assignedSubjectIds?.includes(r.subjectId));
  const recentSubjectResources = [...mySubjectResources].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  const unreadNotifs = raw.notifications.filter((n) => n.userId === user.id && !n.isRead).length;
  res.json({
    mySubjects,
    myClasses,
    myUploadedCount: myUploaded.length,
    totalSubjectResourcesCount: mySubjectResources.length,
    recentSubjectResources,
    unreadNotifs
  });
});
dashboardRouter.get("/student", authMiddleware, (req, res) => {
  const user = req.user;
  const raw = db.getRawData();
  const myClass = raw.classes.find((c) => c.id === user.classId);
  const classSubjects = raw.subjects.filter((s) => s.applicableClasses.includes(user.classId || ""));
  const availableResources = raw.resources.filter(
    (r) => r.classId === user.classId && r.status === "published"
  );
  const recentMaterials = [...availableResources].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  res.json({
    studentClass: myClass,
    classSubjects,
    totalResourcesCount: availableResources.length,
    recentMaterials
  });
});

// server/routes/settingRoutes.ts
var import_express10 = require("express");
var settingRouter = (0, import_express10.Router)();
settingRouter.get("/", (req, res) => {
  res.json({ settings: db.getSettings() });
});
settingRouter.put("/", authMiddleware, requireAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  db.logActivity({
    userId: req.user.id,
    userName: req.user.fullName,
    userRole: req.user.role,
    branchName: "DIPS Central",
    action: "UPDATE",
    details: `Updated platform settings (Direct Publishing: ${updated.directPublishing}).`
  });
  res.json({ settings: updated });
});

// server/routes/supabaseRoutes.ts
var import_express11 = require("express");

// server/supabase.ts
var import_supabase_js = require("@supabase/supabase-js");
var SUPABASE_PROJECT_ID = "rqqjqflxbtfcrbywwtpc";
var DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
var DEFAULT_SUPABASE_KEY = "sb_publishable_Rpydb7voi4Ent3T2exz8qQ_TsaaTtH4";
var SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
var SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
var supabaseClient = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabaseClient;
}
var supabase = getSupabaseClient();
var SUPABASE_SQL_SCHEMA = `-- DIPS Central Portal Schema for Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql)

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  principal_name TEXT,
  established_year INT,
  total_students INT DEFAULT 0,
  total_teachers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INT DEFAULT 1,
  sections TEXT[] DEFAULT ARRAY['A', 'B'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL,
  applicable_classes TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resources / Learning Materials Table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  subject_id TEXT,
  subject_name TEXT,
  class_id TEXT,
  class_name TEXT,
  branch_id TEXT,
  branch_name TEXT,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  uploaded_by_role TEXT,
  status TEXT DEFAULT 'published',
  download_count INT DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  target_role TEXT DEFAULT 'all',
  author_name TEXT,
  author_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  branch_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and grant read access for anon
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Allow anon read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow anon read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow anon read resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow anon read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow anon read activity_logs" ON public.activity_logs FOR SELECT USING (true);

-- Allow authenticated/anon insert/update for demo portal
CREATE POLICY "Allow anon insert resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update resources" ON public.resources FOR UPDATE USING (true);
CREATE POLICY "Allow anon insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
`;
async function checkSupabaseHealth() {
  const start = Date.now();
  const tablesFound = [];
  try {
    const client = getSupabaseClient();
    const tableNames = ["branches", "resources", "classes", "subjects", "announcements", "activity_logs"];
    const probe = await client.from("branches").select("count", { count: "exact", head: true });
    const latencyMs = Date.now() - start;
    if (probe.error && (probe.error.code === "PGRST301" || probe.status === 401)) {
      return {
        connected: false,
        status: probe.status || 401,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        latencyMs,
        message: probe.error.message || "Supabase authentication failed. Please check publishable key.",
        tablesDetected: []
      };
    }
    for (const tbl of tableNames) {
      try {
        const { error, data } = await client.from(tbl).select("id").limit(1);
        if (!error && data !== null) {
          tablesFound.push(tbl);
        }
      } catch {
      }
    }
    const hasTables = tablesFound.length > 0;
    return {
      connected: true,
      status: probe.status || 200,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      message: hasTables ? `Successfully connected! Active tables detected: ${tablesFound.join(", ")}` : "Successfully connected to Supabase! Run the provided SQL schema in your Supabase SQL Editor to create portal tables.",
      tablesDetected: tablesFound
    };
  } catch (error) {
    return {
      connected: false,
      status: "error",
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs: Date.now() - start,
      message: error?.message || "Could not reach Supabase endpoint",
      tablesDetected: []
    };
  }
}

// server/routes/supabaseRoutes.ts
var supabaseRouter = (0, import_express11.Router)();
supabaseRouter.get("/status", async (req, res) => {
  try {
    const health = await checkSupabaseHealth();
    const maskedKey = SUPABASE_KEY.length > 18 ? `${SUPABASE_KEY.substring(0, 15)}...${SUPABASE_KEY.substring(SUPABASE_KEY.length - 4)}` : "***";
    res.json({
      ...health,
      maskedKey,
      sqlSchema: SUPABASE_SQL_SCHEMA
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: err.message,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL
    });
  }
});
supabaseRouter.post("/sync", async (req, res) => {
  try {
    const client = getSupabaseClient();
    const results = {};
    const branches = db.getBranches();
    try {
      const payload = branches.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        city: b.city,
        address: b.address,
        phone: b.phone,
        principal_name: b.principalName,
        established_year: b.establishedYear,
        total_students: b.totalStudents,
        total_teachers: b.totalTeachers
      }));
      const { error } = await client.from("branches").upsert(payload);
      results["branches"] = {
        attempted: branches.length,
        successful: error ? 0 : branches.length,
        error: error?.message
      };
    } catch (e) {
      results["branches"] = { attempted: branches.length, successful: 0, error: e.message };
    }
    const classes = db.getClasses();
    try {
      const payload = classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        sort_order: c.order,
        sections: c.sections
      }));
      const { error } = await client.from("classes").upsert(payload);
      results["classes"] = {
        attempted: classes.length,
        successful: error ? 0 : classes.length,
        error: error?.message
      };
    } catch (e) {
      results["classes"] = { attempted: classes.length, successful: 0, error: e.message };
    }
    const subjects = db.getSubjects();
    try {
      const payload = subjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        department: s.department,
        applicable_classes: s.applicableClasses,
        description: s.description
      }));
      const { error } = await client.from("subjects").upsert(payload);
      results["subjects"] = {
        attempted: subjects.length,
        successful: error ? 0 : subjects.length,
        error: error?.message
      };
    } catch (e) {
      results["subjects"] = { attempted: subjects.length, successful: 0, error: e.message };
    }
    const resources = db.getResources();
    try {
      const payload = resources.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resource_type: r.contentType,
        file_url: r.fileUrl,
        file_name: r.fileName,
        file_size_bytes: r.fileSize,
        subject_id: r.subjectId,
        subject_name: r.subjectName,
        class_id: r.classId,
        class_name: r.className,
        branch_id: r.branchId,
        branch_name: r.branchName,
        uploaded_by_id: r.uploadedByUserId,
        uploaded_by_name: r.uploadedByName,
        uploaded_by_role: "Teacher",
        status: r.status,
        download_count: r.downloadsCount,
        chapter: r.chapter,
        topic: r.topic,
        category: r.category
      }));
      const { error } = await client.from("resources").upsert(payload);
      results["resources"] = {
        attempted: resources.length,
        successful: error ? 0 : resources.length,
        error: error?.message
      };
    } catch (e) {
      results["resources"] = { attempted: resources.length, successful: 0, error: e.message };
    }
    const announcements = db.getAnnouncements();
    try {
      const payload = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        priority: a.priority,
        target_role: a.targetRole,
        author_name: a.authorName,
        author_role: a.authorRole
      }));
      const { error } = await client.from("announcements").upsert(payload);
      results["announcements"] = {
        attempted: announcements.length,
        successful: error ? 0 : announcements.length,
        error: error?.message
      };
    } catch (e) {
      results["announcements"] = { attempted: announcements.length, successful: 0, error: e.message };
    }
    res.json({
      success: true,
      message: "Supabase synchronization run finished.",
      results,
      projectId: SUPABASE_PROJECT_ID
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// server.ts
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express12.default)();
  const PORT = 3e3;
  app.use(import_express12.default.json({ limit: "50mb" }));
  app.use(import_express12.default.urlencoded({ extended: true, limit: "50mb" }));
  const uploadsDir = import_path3.default.join(process.cwd(), "public", "uploads");
  if (!import_fs3.default.existsSync(uploadsDir)) {
    import_fs3.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", import_express12.default.static(uploadsDir));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/branches", branchRouter);
  app.use("/api/academic", academicRouter);
  app.use("/api/users", userRouter);
  app.use("/api/resources", resourceRouter);
  app.use("/api/announcements", announcementRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/activity-logs", activityLogRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/settings", settingRouter);
  app.use("/api/supabase", supabaseRouter);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express12.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DIPS Centralized Portal server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
