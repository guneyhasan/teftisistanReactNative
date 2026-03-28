export interface LoginFormData {
  firmaKodu: string;
  email: string;
  password: string;
}

export interface LoginFormErrors {
  firmaKodu?: string;
  email?: string;
  password?: string;
  general?: string;
}
