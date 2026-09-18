export interface ConnectedServices {
  github: boolean;
  google: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  connectedServices: ConnectedServices;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}
