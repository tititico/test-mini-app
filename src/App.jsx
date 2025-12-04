import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const main = async () => {
      try {
        // Step 1: 初始化 LIFF
        await liff.init({
          liffId: import.meta.env.VITE_LIFF_ID
        });

        setMessage("LIFF init succeeded.");

        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        // 🧪 情况一：本地开发环境（http://localhost:5173 之类）
        // → 不用 login、不用 getProfile，直接跳到 menu.aio-server.com
        if (isLocalhost) {
          console.log(
            "Running on localhost, skip login/profile, redirect to menu.aio-server.com"
          );
          setMessage("Localhost: redirecting to menu.aio-server.com...");
          // 用浏览器普通跳转就可以
          window.location.href = "https://menu.aio-server.com";
          return;
        }

        // 🟢 情况二：在正式 LIFF 环境 / Mini App 里（https / liff.line.me/...）
        // 先确保已经登录
        if (!liff.isLoggedIn()) {
          // 不传 redirectUri，LINE 会使用当前 LIFF URL，避免 localhost 报错
          liff.login();
          return;
        }

        // 等 ready（虽然通常 init 之后就 ready 了，但这样写更稳）
        await liff.ready;

        // 可选：获取用户资料（你以后如果要用，可以留着）
        try {
          const profile = await liff.getProfile();
          console.log("LINE Profile:", profile);
        } catch (e) {
          console.warn("Failed to get profile, but will still redirect:", e);
        }

        // 最终：不带任何 query 参数，直接跳到 menu.aio-server.com
        liff.openWindow({
          url: "https://menu.aio-server.com",
          external: false // 在 LINE 内嵌浏览器打开
        });
      } catch (err) {
        console.error("LIFF Error:", err);
        setMessage("LIFF init failed.");
        setError(String(err));
      }
    };

    main();
  }, []);

  return (
    <div className="App">
      <div className="card">
        <h1>AIOServer Mini App</h1>

        <div className="loader"></div>

        {message && <p className="status-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <a
          href="https://developers.line.biz/ja/docs/liff/"
          target="_blank"
          rel="noreferrer"
          className="doc-link"
        >
          LIFF Documentation
        </a>
      </div>
    </div>
  );

}

export default App;
