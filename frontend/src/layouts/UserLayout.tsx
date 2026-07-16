import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}
