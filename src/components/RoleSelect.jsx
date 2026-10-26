import TopBar from "./TopBar";
import { POSTS } from "../data/rotations";

export default function RoleSelect({ onBack, onHelp, onChoose }) {
  return (
    <main className="screen">
      <TopBar title="Elige tu puesto" onBack={onBack} onHelp={onHelp} />
      <p className="lede pick-lede">
        Armador y receptor tienen delantero y trasero: en cada rotación hay que colocar los dos.
      </p>
      <div className="role-grid">
        {POSTS.map((post) => (
          <button key={post.id} type="button" className="role-card" onClick={() => onChoose(post.id)}>
            <span className="jersey-row">
              {post.roles.map((id) => (
                <span key={id} className={`jersey chip-${id}`}>{id}</span>
              ))}
            </span>
            <span className="role-copy">
              <strong>{post.name}</strong>
              <small>{post.hint}</small>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
