import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireRole } from "./guards/RequireRole";
import { RequireGuest } from "./guards/RequireGuest";
import { AuthLayout } from "./layouts/AuthLayout";
import { ParentLayout } from "./layouts/ParentLayout";
import { TeacherLayout } from "./layouts/TeacherLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { AddStudentPage } from "./pages/parent/AddStudentPage";
import { JoinClassPage } from "./pages/parent/JoinClassPage";
import { StudentGamePage } from "./pages/parent/StudentGamePage";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { CreateClassPage } from "./pages/teacher/CreateClassPage";
import { LeaderboardPage } from "./pages/shared/LeaderboardPage";
import App from "./App";

export const router = createBrowserRouter([
  // Public: standalone demo (original game, no auth)
  { path: "/demo", element: <App /> },

  // Guest-only auth pages
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
        ],
      },
    ],
  },

  // Parent routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole role="parent" />,
        children: [
          {
            element: <ParentLayout />,
            children: [
              { path: "/parent/dashboard", element: <ParentDashboard /> },
              { path: "/parent/add-student", element: <AddStudentPage /> },
              { path: "/parent/join-class", element: <JoinClassPage /> },
            ],
          },
          // Game page uses its own shell (no dashboard header)
          { path: "/parent/play/:studentId", element: <StudentGamePage /> },
        ],
      },
    ],
  },

  // Teacher routes
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole role="teacher" />,
        children: [
          {
            element: <TeacherLayout />,
            children: [
              { path: "/teacher/dashboard", element: <TeacherDashboard /> },
              { path: "/teacher/create-class", element: <CreateClassPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Shared authenticated routes
  {
    element: <RequireAuth />,
    children: [
      { path: "/leaderboard", element: <LeaderboardPage /> },
    ],
  },

  // Root redirect → login (auth state will bounce to dashboard if logged in)
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
