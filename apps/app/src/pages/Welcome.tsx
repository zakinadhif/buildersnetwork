export default function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen" style={{ display: "flex", alignItems: "center" }}>
      <div className="wrap" style={{ paddingTop: 0 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Kamu masuk.
        </h1>
        <p className="sub" style={{ marginBottom: 48, maxWidth: 360 }}>
          Orang-orang di sini lagi ngerjain sesuatu yang nyata. Kenalan dulu.
        </p>
        <button className="btn btn-dark" onClick={onStart}>
          Mulai →
        </button>
      </div>
    </div>
  );
}
