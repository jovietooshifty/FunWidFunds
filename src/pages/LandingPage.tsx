import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BirdMascot } from "../components/mascot/BirdMascot";
import { FloatingDecor } from "../components/FloatingDecor";
import { GameScreen } from "../screens/GameScreen";
import { LEVELS } from "../data/levels";
import { prefersReducedMotion } from "../motion";
import { sounds } from "../audio/sound";

const DEMO_KEY = "funwidfunds-demo-played";

const FEATURES: { icon: string; title: string; text: string }[] = [
  { icon: "💵", title: "Real TT Money", text: "Learn with real Trinidad & Tobago dollars." },
  { icon: "🖐️", title: "Drag & Drop", text: "Grab the bills and pay — no reading needed." },
  { icon: "🔊", title: "Reads Aloud", text: "Every question is spoken out loud." },
  { icon: "🏆", title: "Earn Stars", text: "Climb the leaderboard with your friends." },
  { icon: "👩‍🏫", title: "For Classrooms", text: "Teachers track the whole class at a glance." },
  { icon: "👨‍👧", title: "For Families", text: "Parents add each child and follow along." },
];

export function LandingPage() {
  const navigate = useNavigate();
  const demoRef = useRef<HTMLDivElement>(null);
  const reduced = prefersReducedMotion();

  const [rolePicker, setRolePicker] = useState<"signup" | "login" | null>(null);
  const [demoDone, setDemoDone] = useState(() => {
    try {
      return localStorage.getItem(DEMO_KEY) === "yes";
    } catch {
      return false;
    }
  });

  function go(kind: "signup" | "login", role: "parent" | "teacher") {
    sounds.click();
    navigate(`/${kind}?role=${role}`);
  }

  function finishDemo() {
    try {
      localStorage.setItem(DEMO_KEY, "yes");
    } catch {
      /* noop */
    }
    setDemoDone(true);
  }

  return (
    <div className="landing">
      <FloatingDecor />

      {/* Sticky header — sign-up / log-in always reachable */}
      <header className="landing-bar">
        <span className="landing-logo">
          <span className="logo-fun">Fun</span>
          <span className="logo-wid">Wid</span>
          <span className="logo-funds">Funds</span>
        </span>
        <nav className="landing-bar-actions">
          <button type="button" className="landing-login" onClick={() => setRolePicker("login")}>
            Log In
          </button>
          <button type="button" className="landing-cta" onClick={() => setRolePicker("signup")}>
            Create Account
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <motion.div
          className="hero-mascot"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <BirdMascot
            state="idle"
            message="Hi! I'm Quarter Action!"
            size="large"
            reducedMotion={reduced}
          />
        </motion.div>

        <div className="hero-copy">
          <motion.h1
            className="hero-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Learn money the <span className="hero-pop">fun</span> way!
          </motion.h1>
          <p className="hero-tagline">
            Meet <strong>Quarter Action</strong> 🦜 — your guide to counting, paying and saving
            with real Trinidad &amp; Tobago dollars. Made for little hands and big smiles.
          </p>

          <div className="hero-buttons">
            <motion.button
              type="button"
              className="big-button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setRolePicker("signup")}
            >
              Create Account 🎉
            </motion.button>
            <motion.button
              type="button"
              className="secondary-button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.click();
                demoRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              🎮 Try it free
            </motion.button>
          </div>

          <p className="hero-note">No download • Free to try • Kindergarten friendly</p>
        </div>
      </section>

      {/* Feature icons */}
      <section className="landing-features">
        {FEATURES.map((f, i) => (
          <motion.div
            className="feature-card"
            key={f.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.06, 0.4) }}
            whileHover={{ scale: 1.04, rotate: i % 2 ? 1 : -1 }}
          >
            <span className="feature-icon" aria-hidden="true">{f.icon}</span>
            <span className="feature-title">{f.title}</span>
            <span className="feature-text">{f.text}</span>
          </motion.div>
        ))}
      </section>

      {/* Playable demo (bottom half) */}
      <section className="landing-demo" ref={demoRef}>
        <h2 className="demo-heading">
          <span aria-hidden="true">🎮</span> Try the Fruit Stand!
        </h2>
        <p className="demo-sub">
          {demoDone
            ? "You finished the free demo — make an account to keep playing!"
            : "Tap the right bill to pay. This one's on us!"}
        </p>

        {demoDone ? (
          <motion.div
            className="demo-cta-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.45 }}
          >
            <span className="demo-cta-emoji" aria-hidden="true">🌟</span>
            <h3 className="demo-cta-title">Great job!</h3>
            <p className="demo-cta-text">
              There are 4 more shops, stars to collect and a leaderboard to climb. Create a free
              account to unlock them all.
            </p>
            <motion.button
              type="button"
              className="big-button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setRolePicker("signup")}
            >
              Create Account 🎉
            </motion.button>
            <button type="button" className="link-button" onClick={() => setRolePicker("login")}>
              I already have an account
            </button>
          </motion.div>
        ) : (
          <div className="demo-frame">
            <GameScreen
              level={LEVELS[0]}
              onComplete={finishDemo}
              onQuit={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </div>
        )}
      </section>

      <footer className="landing-footer">
        <span>🇹🇹 Made in Trinidad &amp; Tobago for young learners</span>
      </footer>

      {/* Role picker */}
      {rolePicker && (
        <motion.div
          className="role-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setRolePicker(null)}
          role="dialog"
          aria-label="Choose your role"
        >
          <motion.div
            className="role-card"
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="role-title">
              {rolePicker === "signup" ? "I am a…" : "Log in as…"}
            </h3>
            <p className="role-sub">Pick one to continue</p>

            <div className="role-options">
              <motion.button
                type="button"
                className="role-option"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => go(rolePicker, "parent")}
              >
                <span className="role-emoji" aria-hidden="true">👨‍👧</span>
                <span className="role-name">Parent</span>
                <span className="role-desc">Add your children and play at home</span>
              </motion.button>

              <motion.button
                type="button"
                className="role-option"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => go(rolePicker, "teacher")}
              >
                <span className="role-emoji" aria-hidden="true">👩‍🏫</span>
                <span className="role-name">Teacher</span>
                <span className="role-desc">Create a class and track your students</span>
              </motion.button>
            </div>

            <button type="button" className="link-button" onClick={() => setRolePicker(null)}>
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
