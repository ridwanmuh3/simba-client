export interface UserLoginRequest {
  username?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  fullname: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | undefined | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    req: UserLoginRequest,
    onError?: (msg: string) => void,
  ) => Promise<void>;
  logout: () => Promise<void>;
}
