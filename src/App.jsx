import { useEffect, useState } from "react";
import Home from "./components/Home";
import Study from "./components/Study";
import RoleSelect from "./components/RoleSelect";
import Game from "./components/Game";
import HelpSheet from "./components/HelpSheet";
import Stats from "./components/Stats";
import CoachGate from "./components/CoachGate";
import { DEFAULT_ROTATIONS } from "./data/rotations";
import { coachUnlocked } from "./data/coachAccess";

export default function App() {
  const [screen, setScreen] = useState(() => {
    if (window.location.hash === "#entrenador") return coachUnlocked() ? "stats" : "coach";
    return "home";
  });
  const [help, setHelp] = useState(false);
  const [post, setPost] = useState("armador");
  const rotations = DEFAULT_ROTATIONS;

  function goHome() {
    if (window.location.hash === "#entrenador") {
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(null, "", url);
    }
    setScreen("home");
  }

  function openCoach() {
    const url = new URL(window.location.href);
    url.hash = "entrenador";
    window.history.replaceState(null, "", url);
    setScreen(coachUnlocked() ? "stats" : "coach");
  }

  useEffect(() => {
    if (window.location.hash === "#entrenador") openCoach();
  }, []);

  return (
    <div className="app">
      {screen === "home" ? (
        <Home
          rotation={rotations[0]}
          onTrain={() => setScreen("pick")}
          onHard={() => setScreen("hard")}
          onStudy={() => setScreen("study")}
          onCoach={openCoach}
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
          key={post}
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
          key="hard"
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
          onUnlock={() => setScreen("stats")}
        />
      ) : null}
      {screen === "stats" ? (
        <Stats onBack={goHome} onHelp={() => setHelp(true)} />
      ) : null}
      {help ? <HelpSheet onClose={() => setHelp(false)} /> : null}
    </div>
  );
}
