import api from "./api";

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

export const getCurrentUser = async () => {
  const response = await api.get("/user/me");

  return response.data;
};
