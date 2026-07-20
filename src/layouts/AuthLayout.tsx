import { Outlet } from "react-router-dom";
import { FloatingDecor } from "../components/FloatingDecor";
import { BirdMascot } from "../components/mascot/BirdMascot";
import { prefersReducedMotion } from "../motion";

export function AuthLayout() {
  return (
    <div className="app-shell auth-shell">
      <FloatingDecor />
      <div className="auth-layout">
        <div className="auth-mascot-col">
          <BirdMascot
            state="idle"
            message="Welcome to FunWidFunds!"
            size="large"
            reducedMotion={prefersReducedMotion()}
          />
        </div>
        <div className="auth-form-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
