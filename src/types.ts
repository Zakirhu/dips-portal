export type UserRole = 'admin' | 'teacher' | 'student' | 'coordinator';

export type ContentCategory = 'Study Material' | 'Assessment' | 'Practical' | 'Teaching Resources';

export type ContentType =
  | 'PDF'
  | 'DOC'
  | 'DOCX'
  | 'PPT'
  | 'PPTX'
  | 'Presentation'
  | 'XLS'
  | 'XLSX'
  | 'Images'
  | 'ZIP'
  | 'Video'
  | 'Audio'
  | 'Link'
  | 'YouTube Link'
  | 'Google Drive Link'
  | 'Notes'
  | 'Assignment'
  | 'Worksheet'
  | 'Question Paper'
  | 'Sample Paper'
  | 'Practical File'
  | 'Project'
  | 'Lesson Plan';

export type ResourceStatus = 'published' | 'pending_approval' | 'rejected';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  principalName: string;
  establishedYear: number;
  totalStudents?: number;
  totalTeachers?: number;
}

export interface AcademicClass {
  id: string;
  name: string; // e.g. "Class VII"
  code: string; // "VII"
  order: number;
  sections: string[]; // ["A", "B", "C"]
}

export interface Subject {
  id: string;
  name: string;
  code: string; // "CS", "MATH", "SCI", "ENG"
  department: string;
  applicableClasses: string[]; // class IDs
  description?: string;
}

export interface AcademicSession {
  id: string;
  name: string; // "2026-27"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Chapter {
  id: string;
  subjectId: string;
  classId: string;
  name: string;
  order: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: string;
  branchName?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  phone?: string;
  
  // Teacher specific
  employeeId?: string;
  designation?: string;
  assignedSubjectIds?: string[];
  assignedClassIds?: string[];
  assignedSubjects?: Subject[];
  assignedClasses?: AcademicClass[];
  
  // Student specific
  admissionNo?: string;
  classId?: string;
  className?: string;
  section?: string;
  rollNo?: string;
  academicSessionId?: string;
}

export interface ResourceVersion {
  versionNumber: number;
  versionTitle?: string;
  changelog?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedByUserBranch: string;
  uploadedAt: string;
  contentSnippet?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  branchId: string;
  branchName: string;
  chapter: string;
  topic: string;
  category: ContentCategory;
  contentType: ContentType;
  academicSession: string;
  status: ResourceStatus;
  
  // Versioning
  currentVersion: number;
  versions: ResourceVersion[];
  
  // Current file info (synced with latest version)
  fileName: string;
  fileUrl: string;
  fileSize: number;
  externalLink?: string;
  
  // Creator
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedByBranch: string;
  uploadedByEmployeeId?: string;
  
  // Last editor
  lastUpdatedByUserId: string;
  lastUpdatedByName: string;
  lastUpdatedByBranch: string;
  
  createdAt: string;
  updatedAt: string;
  downloadsCount: number;
  viewsCount: number;
  approvalRemarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetBranchId?: string; // empty means all branches
  targetRole?: UserRole | 'all';
  targetClassId?: string;
  targetSubjectId?: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  expiresAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'resource_upload' | 'resource_updated' | 'announcement' | 'approval' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  branchName: string;
  action: 'UPLOAD' | 'UPDATE' | 'DOWNLOAD' | 'DELETE' | 'APPROVE' | 'REJECT' | 'RESTORE' | 'LOGIN';
  resourceTitle?: string;
  subjectName?: string;
  details: string;
  ipAddress?: string;
  device?: string;
  timestamp: string;
}

export interface SystemSettings {
  directPublishing: boolean; // true = publish immediately, false = requires approval
  maxUploadSizeMB: number;
  allowedExtensions: string[];
  activeSession: string;
  organizationName: string;
  portalSubtitle: string;
}

export interface AdminStats {
  totalBranches: number;
  totalTeachers: number;
  totalStudents: number;
  totalSubjects: number;
  totalClasses: number;
  totalResources: number;
  pendingApprovals: number;
  storageUsageBytes: number;
  activeUsersCount: number;
  recentlyUploaded: Resource[];
  recentlyUpdated: Resource[];
}
