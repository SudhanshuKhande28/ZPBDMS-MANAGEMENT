import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Management Portal Runtime Error:", error, errorInfo);
  }
  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#08090d",
            color: "#ffffff",
            fontFamily: "'Inter', sans-serif",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 460,
              background: "rgba(18, 22, 34, 0.95)",
              border: "1px solid rgba(255, 51, 75, 0.4)",
              borderRadius: 14,
              padding: 36,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 51, 75, 0.2)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(255, 51, 75, 0.15)",
                border: "1px solid rgba(255, 51, 75, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#ff334b",
                fontSize: 24,
              }}
            >
              ⚠
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontFamily: "'Outfit', sans-serif" }}>
              Session State Recovered
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              The application encountered an outdated local session cache. Click below to refresh your environment and open the portal.
            </p>
            {this.state.error && (
              <div
                style={{
                  background: "rgba(255, 51, 75, 0.08)",
                  border: "1px solid rgba(255, 51, 75, 0.25)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  marginBottom: 20,
                  textAlign: "left",
                  fontSize: 11,
                  color: "#ff8093",
                  wordBreak: "break-all",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
                border: "none",
                color: "#ffffff",
                padding: "12px 28px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255, 51, 75, 0.5)",
              }}
            >
              Reset Session & Open Management
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
