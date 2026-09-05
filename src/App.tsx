import { useEffect } from "react";
import Background from "./components/Background";
import Book from "./components/Book";
import Admin from "./components/Admin";

export default function App() {
  /**
   * Mobile browsers shrink the visual viewport when the keyboard opens, but
   * `100dvh` doesn't always follow on iOS. Track it manually so the book —
   * and the wish form inside it — always stay fully visible.
   */
  useEffect(() => {
    const vv = window.visualViewport;
    const apply = () => {
      const h = vv?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-h", `${h}px`);
    };
    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  if (window.location.pathname.endsWith("/admin") || window.location.search === "?admin") {
    return <Admin />;
  }

  return (
    <div
      id="top"
      className="relative overflow-hidden"
      style={{ height: "var(--app-h, 100dvh)" }}
    >
      <Background />
      <Book />
    </div>
  );
}
