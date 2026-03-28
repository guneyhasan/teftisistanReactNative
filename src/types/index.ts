export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  profilePhoto: string | null;
  signatureUrl: string | null;
  companyId: number | null;
  branchId: number | null;
  createdAt?: string;
}

export type UserRole =
  | 'admin'
  | 'field'
  | 'planlamacı'
  | 'gözden_geçiren'
  | 'firma_sahibi'
  | 'sube_kullanici';

export interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  ownerId: string | null;
  owner?: User | null;
  regions?: Region[];
  branches?: Branch[];
  _count?: { regions: number; branches: number };
}

export interface Region {
  id: number;
  name: string;
  companyId: number;
  company?: Company;
  branches?: Branch[];
  _count?: { branches: number };
}

export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  companyId: number;
  regionId: number | null;
  company?: Company;
  region?: Region | null;
}

export interface Category {
  id: number;
  title: string;
  questions?: Question[];
}

export interface Question {
  id: number;
  text: string;
  description: string | null;
  points: number;
  noteRequired: boolean;
  imageUrl: string | null;
  categoryId: number;
  companyId: number | null;
  parentQuestionId: number | null;
  triggerValue: string | null;
}

export type AuditStatus =
  | 'pending'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'revision_requested';

export type AnswerValue = 'U' | 'YP' | 'UD' | 'DD';

export interface Audit {
  id: string;
  userId: string;
  reviewerId: string | null;
  assignedById: string | null;
  status: AuditStatus;
  scheduledDate: string | null;
  title: string | null;
  authorizedPerson: string | null;
  clientSignatureUrl: string | null;
  auditorSignatureUrl: string | null;
  revisionNote: string | null;
  latitude: number | null;
  longitude: number | null;
  companyId: number | null;
  branchId: number | null;
  nextAuditDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  submittedAt?: string | null;
  revisionRequestedAt?: string | null;
  approvedAt?: string | null;
  user?: User;
  reviewer?: User | null;
  branch?: Branch | null;
  company?: Company | null;
  answers?: Answer[];
  photos?: Photo[];
  correctiveActions?: CorrectiveAction[];
  /** Score from API (GET /audits returns this) */
  score?: { percent: number; totalPoints?: number; earnedPoints?: number; byCategory?: unknown[] };
}

export interface Answer {
  id: number;
  auditId: string;
  questionId: number;
  value: AnswerValue;
  note: string | null;
  question?: Question;
}

export interface Photo {
  id: number;
  auditId: string;
  questionId: number | null;
  url: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CorrectiveAction {
  id: number;
  auditId: string;
  questionId: number | null;
  description: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  status: 'open' | 'in_progress' | 'closed';
  closedAt: string | null;
  closedNote: string | null;
}

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  auditId: string | null;
  createdAt: string;
}

export interface StatsOverview {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  revision: number;
  completionRate: number;
}

export interface AnnualStat {
  month: number;
  averageScore: number;
  auditCount: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
