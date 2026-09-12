export interface User {
  name: string;
  email: string;
  role: "admin" | "user";
  can_take_test: boolean;
  can_retake_test: boolean;
  is_first_login: boolean;
}
