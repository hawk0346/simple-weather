type HeaderProps = {
  scheme: "light" | "dark";
  onToggleScheme: () => void;
};

export default function Header({ scheme, onToggleScheme }: HeaderProps) {
  return (
    <header className="app-header">
      <h1 className="app-title">Weather App</h1>
      <button
        type="button"
        className="dark-mode-btn"
        onClick={onToggleScheme}
        aria-label={
          scheme === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"
        }
      >
        {scheme === "dark" ? "☀️" : "🌙"}
      </button>
    </header>
  );
}
