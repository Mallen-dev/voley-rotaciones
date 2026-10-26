import { useState } from "react";
import Home from "./components/Home";
import Study from "./components/Study";
import RoleSelect from "./components/RoleSelect";
import Game from "./components/Game";
import Admin from "./components/Admin";
import HelpSheet from "./components/HelpSheet";
import { clearLineup, loadLineup, saveLineup } from "./data/lineupStore";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [help, setHelp] = useState(false);
  const [role, setRole] = useState("AD");
  const [pack, setPack] = useState(() => ({ ...loadLineup(), stamp: 0 }));

  function openHelp() {
    setHelp(true);
  }

  function save(rotations) {
    saveLineup(rotations);
    setPack({ rotations, custom: true, stamp: Date.now() });
  }

  function resetLineup() {
    clearLineup();
    const fresh = loadLineup();
    setPack({ ...fresh, stamp: Date.now() });
    setScreen("home");
  }

  return (
    <div className="app">
      {screen === "home" ? (
        <Home
          rotation={pack.rotations[0]}
          custom={pack.custom}
          onTrain={() => setScreen("pick")}
          onHard={() => setScreen("hard")}
          onStudy={() => setScreen("study")}
          onAdmin={() => setScreen("admin")}
          onHelp={openHelp}
        />
      ) : null}
      {screen === "study" ? (
        <Study rotations={pack.rotations} onBack={() => setScreen("home")} onHelp={openHelp} />
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
          key={`${role}-${pack.stamp}`}
          mode="focus"
          role={role}
          rotations={pack.rotations}
          onExit={() => setScreen("home")}
          onHelp={openHelp}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {screen === "hard" ? (
        <Game
          key={`hard-${pack.stamp}`}
          mode="hard"
          rotations={pack.rotations}
          onExit={() => setScreen("home")}
          onHelp={openHelp}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {screen === "admin" ? (
        <Admin
          rotations={pack.rotations}
          onBack={() => setScreen("home")}
          onHelp={openHelp}
          onSave={save}
          onReset={pack.custom ? resetLineup : null}
        />
      ) : null}
      {help ? <HelpSheet onClose={() => setHelp(false)} /> : null}
    </div>
  );
}
