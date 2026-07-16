import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import Landing from "../pages/Landing";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Home from "../pages/Home";

import Quiz from "../pages/quiz/Quiz";
import Result from "../pages/quiz/Result";
import History from "../pages/quiz/History";

import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Questions from "../pages/admin/Questions";
import Results from "../pages/admin/Results";
import Stats from "../pages/admin/Stats";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected User Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>

            <Route
              path="/home"
              element={<Home />}
            />

            <Route
              path="/quiz"
              element={<Quiz />}
            />

            <Route
              path="/result/:id"
              element={<Result />}
            />

            <Route
              path="/history"
              element={<History />}
            />

          </Route>
        </Route>

        {/* Protected Admin Routes */}

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>

            <Route
              path="/admin"
              element={<Dashboard />}
            />

            <Route
              path="/admin/users"
              element={<Users />}
            />

            <Route
              path="/admin/questions"
              element={<Questions />}
            />

            <Route
              path="/admin/results"
              element={<Results />}
            />

            <Route
              path="/admin/stats"
              element={<Stats />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
