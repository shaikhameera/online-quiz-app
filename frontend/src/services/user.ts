import api from "./api";
import type { User } from "../types/user";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/user/register", {
    name,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post("/user/login", {
    email,
    password,
  });

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.get("/user/logout");

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/user/me");

  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.post("/user/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};
