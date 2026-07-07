"use client";

import { useTheme } from "../ThemeProvider";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "24px" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontSize: "16px", color: "var(--text-primary)", lineHeight: 1.8 }}>
          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>1. Data Collection</h2>
            <p>
              SaleSync is an offline-first application. All your inventory, sales, and customer data are stored locally on your device. We do not transmit, collect, or store this data on external servers.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>2. Analytics</h2>
            <p>
              We may collect anonymized usage data (such as app crashes, performance metrics, and feature interactions) to improve the SaleSync experience. This data does not include personally identifiable information or your specific business data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>3. Third-Party Services</h2>
            <p>
              The App may contain links to third-party websites or services that are not owned or controlled by SaleSync. We assume no responsibility for the content, privacy policies, or practices of any third-party web sites or services.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "var(--accent)" }}>4. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
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
