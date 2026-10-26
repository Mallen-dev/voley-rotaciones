import { useState } from "react";
import Home from "./components/Home";
import Study from "./components/Study";
import RoleSelect from "./components/RoleSelect";
import Game from "./components/Game";
import HelpSheet from "./components/HelpSheet";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [help, setHelp] = useState(false);
  const [role, setRole] = useState("A1");

  function openHelp() {
    setHelp(true);
  }

  return (
    <div className="app">
      {screen === "home" ? (
        <Home
          onTrain={() => setScreen("pick")}
          onHard={() => setScreen("hard")}
          onStudy={() => setScreen("study")}
          onHelp={openHelp}
        />
      ) : null}
      {screen === "study" ? (
        <Study onBack={() => setScreen("home")} onHelp={openHelp} />
      ) : null}
      {screen === "pick" ? (
        <RoleSelect
          onBack={() => setScreen("home")}
          onHelp={openHelp}
          onChoose={(next) => {
            setRole(next);
            setScreen("train");
          }}
        />
      ) : null}
      {screen === "train" ? (
        <Game
          key={role}
          mode="focus"
          role={role}
          onExit={() => setScreen("home")}
          onHelp={openHelp}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {screen === "hard" ? (
        <Game
          key="hard"
          mode="hard"
          onExit={() => setScreen("home")}
          onHelp={openHelp}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {help ? <HelpSheet onClose={() => setHelp(false)} /> : null}
    </div>
  );
}
