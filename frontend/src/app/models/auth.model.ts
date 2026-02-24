export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  exp: number;
  iat?: number;
}
