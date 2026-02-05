import { AuthContextType, UserLoginRequest } from "@/types/auth";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async (req: UserLoginRequest, onError?: (msg: string) => void) => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
};
