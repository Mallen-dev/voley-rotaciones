import { useEffect, useState } from "react";
import Home from "./components/Home";
import Study from "./components/Study";
import RoleSelect from "./components/RoleSelect";
import Game from "./components/Game";
import HelpSheet from "./components/HelpSheet";
import Stats from "./components/Stats";
import CoachGate from "./components/CoachGate";
import Admin from "./components/Admin";
import { DEFAULT_ROTATIONS } from "./data/rotations";
import { coachUnlocked } from "./data/coachAccess";
import { loadCachedLineup, loadRemoteLineup, resetLineup, saveLineup } from "./data/lineupStore";

function targetFromHash() {
  if (window.location.hash === "#ajustar") return "admin";
  if (window.location.hash === "#entrenador") return "stats";
  return null;
}

export default function App() {
  const [screen, setScreen] = useState(() => {
    const target = targetFromHash();
    if (!target) return "home";
    return coachUnlocked() ? target : "coach";
  });
  const [afterCoach, setAfterCoach] = useState(() => targetFromHash() || "stats");
  const [help, setHelp] = useState(false);
  const [post, setPost] = useState("armador");
  const [rotations, setRotations] = useState(loadCachedLineup);
  const [lineupStamp, setLineupStamp] = useState(0);

  useEffect(() => {
    let alive = true;
    loadRemoteLineup()
      .then((next) => {
        if (alive && next) {
          setRotations(next);
          setLineupStamp((value) => value + 1);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function goHome() {
    if (window.location.hash === "#entrenador" || window.location.hash === "#ajustar") {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(null, "", url);
    }
    setScreen("home");
  }

  function openHidden(target) {
    const url = new URL(window.location.href);
    url.hash = target === "admin" ? "ajustar" : "entrenador";
    window.history.replaceState(null, "", url);
    setAfterCoach(target);
    setScreen(coachUnlocked() ? target : "coach");
  }

  useEffect(() => {
    const target = targetFromHash();
    if (target) openHidden(target);
  }, []);

  return (
    <div className="app">
      {screen === "home" ? (
        <Home
          rotation={rotations[0]}
          onTrain={() => setScreen("pick")}
          onHard={() => setScreen("hard")}
          onStudy={() => setScreen("study")}
          onCoach={() => openHidden("stats")}
          onHelp={() => setHelp(true)}
        />
      ) : null}
      {screen === "study" ? (
        <Study rotations={rotations} onBack={goHome} onHelp={() => setHelp(true)} />
      ) : null}
      {screen === "pick" ? (
        <RoleSelect
          onBack={goHome}
          onHelp={() => setHelp(true)}
          onChoose={(next) => {
            setPost(next);
            setScreen("train");
          }}
        />
      ) : null}
      {screen === "train" ? (
        <Game
          key={`${post}-${lineupStamp}`}
          mode="focus"
          post={post}
          rotations={rotations}
          onExit={goHome}
          onHelp={() => setHelp(true)}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {screen === "hard" ? (
        <Game
          key={`hard-${lineupStamp}`}
          mode="hard"
          rotations={rotations}
          onExit={goHome}
          onHelp={() => setHelp(true)}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {screen === "coach" ? (
        <CoachGate
          onBack={goHome}
          onHelp={() => setHelp(true)}
          onUnlock={() => setScreen(afterCoach)}
        />
      ) : null}
      {screen === "stats" ? (
        <Stats
          onBack={goHome}
          onHelp={() => setHelp(true)}
          onAdmin={() => openHidden("admin")}
        />
      ) : null}
      {screen === "admin" ? (
        <Admin
          rotations={rotations}
          onBack={() => openHidden("stats")}
          onHelp={() => setHelp(true)}
          onSave={async (next) => {
            await saveLineup(next);
            setRotations(next);
            setLineupStamp((value) => value + 1);
          }}
          onReset={async () => {
            await resetLineup();
            setRotations(DEFAULT_ROTATIONS);
            setLineupStamp((value) => value + 1);
            openHidden("stats");
          }}
        />
      ) : null}
      {help ? <HelpSheet onClose={() => setHelp(false)} /> : null}
    </div>
  );
}
