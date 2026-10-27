import { useState } from "react";
import Home from "./components/Home";
import Study from "./components/Study";
import RoleSelect from "./components/RoleSelect";
import Game from "./components/Game";
import HelpSheet from "./components/HelpSheet";
import { DEFAULT_ROTATIONS } from "./data/rotations";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [help, setHelp] = useState(false);
  const [post, setPost] = useState("armador");
  const rotations = DEFAULT_ROTATIONS;

  return (
    <div className="app">
      {screen === "home" ? (
        <Home
          rotation={rotations[0]}
          onTrain={() => setScreen("pick")}
          onHard={() => setScreen("hard")}
          onStudy={() => setScreen("study")}
          onHelp={() => setHelp(true)}
        />
      ) : null}
      {screen === "study" ? (
        <Study rotations={rotations} onBack={() => setScreen("home")} onHelp={() => setHelp(true)} />
      ) : null}
      {screen === "pick" ? (
        <RoleSelect
          onBack={() => setScreen("home")}
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
          onExit={() => setScreen("home")}
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
          onExit={() => setScreen("home")}
          onHelp={() => setHelp(true)}
          onHard={() => setScreen("hard")}
          onPick={() => setScreen("pick")}
        />
      ) : null}
      {help ? <HelpSheet onClose={() => setHelp(false)} /> : null}
    </div>
  );
}
