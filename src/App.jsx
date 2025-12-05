import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      try {
        setMessage("Initializing LIFF...");

        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID
        });

        console.log("LIFF initialized");
        setMessage("LIFF initialized.");

        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        // ⬇️⬇️ LOCALHOST MODE — do NOT run LIFF login ⬇️⬇️
        if (isLocalhost) {
          setMessage("Localhost detected → redirecting...");
          window.location.replace("https://menu.aio-server.com");
          return;
        }

        // --- Real LIFF environment (inside LINE Mini App) ---
        // 仅在未登录时触发 login，防止 Infinite Loop
        if (!liff.isLoggedIn()) {
          console.log("User not logged in → redirect to LINE Login");
          liff.login({
            redirectUri: window.location.href
          });
          return;
        }

        // 登录后（或 redirect 回来）才会执行这段
        await liff.ready;
        console.log("LIFF ready");

        // （可选）获取用户信息，不过不影响跳转
        try {
          const profile = await liff.getProfile();
          console.log("LINE Profile:", profile);
        } catch (err) {
          console.warn("getProfile failed:", err);
        }

        // ⬇️⬇️ 只触发一次，不会弹两个窗口 ⬇️⬇️
        console.log("Redirecting to menu.aio-server.com ...");
        window.location.replace("https://menu.aio-server.com");

      } catch (error) {
        console.error("LIFF Error:", error);
        setMessage("LIFF init failed: " + String(error));
      }
    }

    init();
  }, []); // 关键：确保 effect 只执行一次

  return (
    <div className="App">
      <div className="card">
        <h1>AIOServer Mini App</h1>
        <div className="loader"></div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default App;
