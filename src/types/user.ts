import { ModalType } from "./modal";

export interface CreateUserRequest {
  fullname?: string;
  username?: string;
  role?: string;
  password?: string;
}

export interface EditUserRequest {
  id?: number;
  fullname?: string;
  password?: string;
}

export interface DeleteUserRequest {
  id?: number;
}

export interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
}

export interface UsersStats {
  usersTotal: number;
  usersSuperAdminTotal: number;
  usersAdminTotal: number;
  usersActiveTotal: number;
}

export interface UserModalStore {
  isOpen: boolean;
  type: ModalType | null;
  data: User | null;
  onOpen: (type: ModalType, data?: User) => void;
  onClose: () => void;
}
