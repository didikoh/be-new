export interface User {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  role: "student" | "coach" | "admin";
  profile_pic?: string;
  birthday?: string;
  is_member?: number;
  point?: number;
  balance?: number;
  frozen_balance?: number;
  valid_to?: string;
  valid_balance_to?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  birthday: string;
  password: string;
  profile_pic?: File;
}

export interface AuthCheckResponse {
  success: boolean;
  profile?: User;
}

export interface LoginResponse {
  success: boolean;
  profile?: User;
  message?: string;
}
