export interface User {
  id: number | string;
  email: string;
  name: string;
  role: 'trainer' | 'profesor' | 'professor';
  phone?: string;
  gender?: string;
  isVerified?: boolean;
  isBanned?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  token?: string;
  message?: string;
  requiresCode?: boolean;
  user: User;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  type: string;
  token: string;
  message: string;
  user: User;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
  expiresIn: string;
}

export interface RegisterResponse {
  userId: number;
  message: string;
}

