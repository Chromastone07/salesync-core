"use client";

import { useTheme } from "../ThemeProvider";
import { Moon, Sun, ArrowLeft, Download, FileJson } from "lucide-react";
import Link from "next/link";

export default function Downloads() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <nav style={{ padding: "20px 0", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg-primary)", zIndex: 100 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
              S
            </div>
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>SaleSync</span>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button 
              onClick={toggleTheme}
              style={{ padding: "10px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} color="var(--text-primary)" /> : <Sun size={20} color="var(--text-primary)" />}
            </button>
            <Link href="/" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeft size={20} />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container" style={{ padding: "60px 24px", maxWidth: "800px", margin: "0 auto", flex: 1 }}>
        <h1 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px" }}>Download SaleSync</h1>
        <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "40px", lineHeight: 1.6 }}>
          Get the latest version of SaleSync for your Android device. We recommend always staying up to date to get the best performance and newest features.
        </p>

        {/* Latest Version Card */}
        <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)", marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(249,115,22,0.1)", color: "var(--accent)", padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
                Latest Release
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>Version 1.0.0</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Released: July 2026</p>
              
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>What's new:</h3>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-primary)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div> Offline-first core architecture</li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div> High-performance bulk inventory import</li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div> Integrated Khata (Pay Later) tracking</li>
              </ul>
            </div>
            
            <a href="https://github.com/Chromastone07/salesync-core/releases/download/v1.0.0/salesync-real.apk" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 32px", fontSize: "1.1rem" }}>
              <Download size={24} />
              Download APK
            </a>
          </div>
        </div>

        {/* Resources */}
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", marginTop: "60px" }}>Helpful Resources</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <a href="/downloads/inventory_template.csv" download className="glass-panel" style={{ padding: "20px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s ease" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              <FileJson size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>Inventory CSV Template</div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Download format for bulk upload</div>
            </div>
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: "40px 0", borderTop: "1px solid var(--border)", background: "var(--bg-primary)" }}>
        <div className="container" style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
          &copy; {new Date().getFullYear()} SaleSync. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
