export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.35:3636'
  : 'https://your-production-url.com';

export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user_data';
export const CSRF_TOKEN_KEY = 'csrf_token';
export const THEME_STORAGE_KEY = 'theme_preference';

export const ANSWER_VALUES = {
  U: { label: 'Uygun', short: 'U', color: '#22c55e' },
  YP: { label: 'Yarım Puan', short: 'YP', color: '#f59e0b' },
  UD: { label: 'Uygun Değil', short: 'UD', color: '#ef4444' },
  DD: { label: 'Değerlendirme Dışı', short: 'DD', color: '#94a3b8' },
} as const;

export const AUDIT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Bekleyen', color: '#f59e0b', bg: '#fef3c7' },
  draft: { label: 'Taslak', color: '#6366f1', bg: '#e0e7ff' },
  submitted: { label: 'Gönderildi', color: '#3b82f6', bg: '#dbeafe' },
  approved: { label: 'Onaylandı', color: '#22c55e', bg: '#dcfce7' },
  revision_requested: { label: 'Revizyon', color: '#ef4444', bg: '#fee2e2' },
};

export const USER_ROLES: Record<string, string> = {
  admin: 'Admin',
  field: 'Saha Denetçisi',
  planlamacı: 'Planlamacı',
  'gözden_geçiren': 'Gözden Geçiren',
  firma_sahibi: 'Firma Sahibi',
  sube_kullanici: 'Şube Kullanıcısı',
};

/** Test users for development - tap to auto-fill login form. Matches seed data. */
export const TEST_USERS = [
  { name: 'Ali Yılmaz', email: 'admin@admin.com', password: '!Admin123456', role: 'admin' },
  { name: 'Ayşe Demir', email: 'planlama@demo.local', password: '!Plan12345!!', role: 'planlamacı' },
  { name: 'Mehmet Kaya', email: 'saha@demo.local', password: '!Field1234!!', role: 'field' },
  { name: 'Fatma Özkan', email: 'onay@demo.local', password: '!Onay12345!!', role: 'gözden_geçiren' },
  { name: 'Mustafa Çelik', email: 'firma@demo.local', password: '!Firma1234!!', role: 'firma_sahibi' },
  { name: 'Hasan Demir', email: 'firma@hdiskender.local', password: '!Firma1234!!', role: 'firma_sahibi' },
  { name: 'Zeynep Arslan', email: 'sube@hdiskender.local', password: '!Sube12345!!', role: 'sube_kullanici' },
] as const;

export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Kontrol Paneli', icon: 'home', route: '/(main)/dashboard', roles: ['admin', 'field', 'planlamacı', 'gözden_geçiren', 'firma_sahibi', 'sube_kullanici'] },
  { key: 'audits', label: 'Denetimler', icon: 'clipboard-list', route: '/(main)/audits', roles: ['admin', 'field', 'planlamacı', 'gözden_geçiren', 'firma_sahibi', 'sube_kullanici'] },
  { key: 'reports', label: 'Raporlar', icon: 'chart-bar', route: '/(main)/reports', roles: ['admin', 'planlamacı', 'gözden_geçiren', 'firma_sahibi'] },
  { key: 'companies', label: 'Şirketler', icon: 'building', route: '/(main)/admin/companies', roles: ['admin'] },
  { key: 'regions', label: 'Bölgeler', icon: 'map', route: '/(main)/admin/regions', roles: ['admin'] },
  { key: 'branches', label: 'Şubeler', icon: 'store', route: '/(main)/admin/branches', roles: ['admin'] },
  { key: 'categories', label: 'Kategoriler', icon: 'tag', route: '/(main)/admin/categories', roles: ['admin', 'planlamacı'] },
  { key: 'users', label: 'Kullanıcılar', icon: 'users', route: '/(main)/admin/users', roles: ['admin'] },
] as const;
