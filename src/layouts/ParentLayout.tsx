import { Outlet, useNavigate } from "react-router-dom";
import { FloatingDecor } from "../components/FloatingDecor";
import { useAuth } from "../contexts/AuthContext";
import { sounds } from "../audio/sound";

export function ParentLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell dashboard-shell">
      <FloatingDecor />
      <header className="dashboard-header">
        <h1 className="dashboard-logo" onClick={() => navigate("/parent/dashboard")}>
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
            onClick={async () => {
              sounds.click();
              // Navigate to the public landing page BEFORE clearing the session,
              // otherwise RequireAuth sees the empty session first and bounces
              // the user to /login. Land them at the top of the page, not in
              // the demo section further down.
              navigate("/", { replace: true });
              window.scrollTo(0, 0);
              await signOut();
            }}
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
