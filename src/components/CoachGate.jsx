import { useState } from "react";
import TopBar from "./TopBar";
import { unlockCoach } from "../data/coachAccess";

export default function CoachGate({ onBack, onHelp, onUnlock }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (unlockCoach(value)) onUnlock();
    else setWrong(true);
  }

  return (
    <main className="screen">
      <TopBar title="Estadísticas" onBack={onBack} onHelp={onHelp} />
      <form className="coach-gate" onSubmit={submit}>
        <label htmlFor="coach-key">Clave</label>
        <input
          id="coach-key"
          type="password"
          value={value}
          autoFocus
          autoComplete="current-password"
          onChange={(event) => {
            setValue(event.target.value);
            setWrong(false);
          }}
        />
        {wrong ? <p>Clave incorrecta.</p> : null}
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
    </main>
  );
}
