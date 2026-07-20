import { Outlet, useNavigate } from "react-router-dom";
import { FloatingDecor } from "../components/FloatingDecor";
import { useAuth } from "../contexts/AuthContext";
import { sounds } from "../audio/sound";

export function TeacherLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell dashboard-shell">
      <FloatingDecor />
      <header className="dashboard-header">
        <h1 className="dashboard-logo" onClick={() => navigate("/teacher/dashboard")}>
          FunWidFunds
        </h1>
        <nav className="dashboard-nav">
          <button
            type="button"
            className="nav-link"
            onClick={() => { sounds.click(); navigate("/leaderboard"); }}
          >
            Leaderboard
          </button>
          <span className="nav-user">{profile?.name}</span>
          <button
            type="button"
            className="nav-link nav-logout"
            onClick={() => { sounds.click(); signOut(); }}
          >
            Log out
          </button>
        </nav>
      </header>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
