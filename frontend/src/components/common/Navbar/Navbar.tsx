import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUserCircle,
} from "react-icons/hi2";

import { useAuth } from "../../../hooks/useAuth";
import type { NavbarProps } from "./types";

export default function Navbar({
  links = [],
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();

    await logout();

    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}

        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          🎓 QuizApp
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-700 hover:text-blue-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Section */}

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <HiOutlineUserCircle
                  size={28}
                  className="text-slate-600"
                />

                <span className="font-medium text-slate-700">
                  {user.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-blue-600 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Login
              </Link>

              {/* <Link
                to="/register"
                className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link> */}
            </>
          )}
        </div>

        {/* Mobile Toggle */}

        <button
          type="button"
          onClick={toggleMenu}
          className="text-slate-700 md:hidden"
        >
          {isOpen ? (
            <HiOutlineXMark size={30} />
          ) : (
            <HiOutlineBars3 size={30} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          isOpen ? "max-h-screen border-t" : "max-h-0"
        }`}
      >
        <div className="space-y-2 bg-white px-6 py-4">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <hr className="my-3" />

          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2">
                <HiOutlineUserCircle
                  size={24}
                  className="text-slate-600"
                />

                <span className="font-medium text-slate-700">
                  {user.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-lg border border-blue-600 px-4 py-2 text-center font-medium text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
