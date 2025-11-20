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
  token: string;
  user: User;
}

export interface RegisterResponse {
  userId: number;
  message: string;
}

