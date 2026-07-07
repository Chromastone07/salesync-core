"use client";

import { useTheme } from "../ThemeProvider";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
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
        <h1 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "24px" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "16px", color: "var(--text-primary)", lineHeight: 1.8 }}>
          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using SaleSync (the "App"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of SaleSync for personal or business use. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>3. Disclaimer</h2>
            <p>
              The materials within SaleSync are provided on an 'as is' basis. SaleSync makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>4. Limitations</h2>
            <p>
              In no event shall SaleSync or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use SaleSync.
            </p>
          </section>
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
