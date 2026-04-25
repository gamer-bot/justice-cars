import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("jc-cookies-accepted");
    if (!accepted) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-border bg-background/80 backdrop-blur-md shadow-xl">
        <p className="text-sm text-muted-foreground flex-1">
          This site uses cookies to enhance your experience. By continuing, you agree to our use of cookies.{" "}
          <a href="/info" className="text-primary underline underline-offset-2">Learn more</a>
        </p>
        <button
          onClick={() => {
            localStorage.setItem("jc-cookies-accepted", "1");
            setShow(false);
          }}
          className="shrink-0 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
