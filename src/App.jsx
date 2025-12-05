import { useEffect, useState } from "react";
import liff from "@line/liff";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

// 初始化 Supabase 客户端
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [message, setMessage] = useState("");

  // 保存用户资料到 Supabase
  async function saveUserToSupabase() {
    try {
      const profile = await liff.getProfile();
      const idToken = liff.getDecodedIDToken(); // 包含 userId（sub）、email 等

      const { data, error } = await supabase.from("line_users").upsert(
        {
          user_id: idToken.sub, // 唯一 ID
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          email: idToken.email ?? null,
          last_login: new Date().toISOString()
        },
        {
          onConflict: "user_id" // user_id 重复时改为更新
        }
      );

      if (error) {
        console.error("Supabase upsert error:", error);
      }
    } catch (err) {
      console.error("saveUserToSupabase error:", err);
    }
  }

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

        // 🧪 本地开发：不走 LIFF 登录，不访问 Supabase，直接跳 menu.aio-server.com
        if (isLocalhost) {
          setMessage("Localhost detected → redirecting...");
          window.location.replace("https://menu.aio-server.com");
          return;
        }

        // --- 真正的 LINE / Mini App 环境 ---
        if (!liff.isLoggedIn()) {
          console.log("User not logged in → redirect to LINE Login");
          liff.login({
            redirectUri: window.location.href
          });
          return;
        }

        // 登录完成 / 重定向回来之后
        await liff.ready;
        console.log("LIFF ready");

        // 先尝试获取 profile（可选，主要是为了调试日志）
        try {
          const profile = await liff.getProfile();
          console.log("LINE Profile:", profile);
        } catch (err) {
          console.warn("getProfile failed:", err);
        }

        // ⭐ 在这里保存用户资料到 Supabase
        await saveUserToSupabase();

        // 保存结束后再跳转
        console.log("Redirecting to menu.aio-server.com ...");
        window.location.replace("https://menu.aio-server.com");
      } catch (error) {
        console.error("LIFF Error:", error);
        setMessage("LIFF init failed: " + String(error));
      }
    }

    init();
  }, []); // 只执行一次

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
