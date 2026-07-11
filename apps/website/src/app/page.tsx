"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Smartphone, Zap, WifiOff, Download, ChevronRight, BarChart3, Database, FileSpreadsheet, Users, Wrench, FlaskConical, Sprout, Hammer, Droplets, Pipette } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation */}
      <nav style={{ padding: "20px 0", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg-primary)", zIndex: 100 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
              S
            </div>
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>SaleSync</span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button 
              onClick={toggleTheme}
              style={{ padding: "10px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} color="var(--text-primary)" /> : <Sun size={20} color="var(--text-primary)" />}
            </button>
            <Link href="/downloads" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              Get the App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "100px 0", textAlign: "center", overflow: "hidden", position: "relative" }}>
        {/* Glow effect for dark mode */}
        {theme === 'dark' && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" }} />
        )}
        
        <div className="container animate-fade-in-up" style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-1.5px" }}>
            The Ultimate <br/>
            <span style={{ color: "var(--accent)" }}>Point of Sale</span> Experience.
          </h1>
          <p style={{ fontSize: "20px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: 1.6 }}>
            Manage inventory, process sales instantly, and scale infinitely. 
            All completely offline and serverless. No internet? No problem.
          </p>
          
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/downloads" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.1rem" }}>
              <Download size={20} />
              Download APK
            </Link>
            <a href="#learn-more" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 32px", fontSize: "1.1rem" }}>
              Learn More
              <ChevronRight size={20} />
            </a>
          </div>

          {/* App Mockup UI */}
          <div style={{ marginTop: "60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ background: "var(--accent)", color: "#fff", padding: "8px 24px", borderRadius: "24px 24px 0 0", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "-1px", position: "relative", zIndex: 2, boxShadow: "0 -4px 10px rgba(249,115,22,0.2)" }}>
              Live App Interface Preview
            </div>
            <div className="glass-panel" style={{ 
              padding: "20px", 
              display: "inline-block", 
              width: "100%", 
              maxWidth: "800px", 
              height: "400px", 
              position: "relative",
              overflow: "hidden",
              zIndex: 1
            }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "12px", background: "var(--bg-primary)", position: "relative", overflow: "hidden", border: "1px solid var(--border)", display: "flex", flexDirection: "column", textAlign: "left" }}>
               <div style={{ height: "60px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between", background: "var(--bg-secondary)" }}>
                  <span style={{ fontWeight: 700, fontSize: "18px" }}>New Sale</span>
                  <div style={{ background: "var(--bg-primary)", padding: "6px 12px", borderRadius: "12px", fontSize: "14px", color: "var(--accent)", fontWeight: 600, border: "1px solid var(--border)" }}>Scan Barcode</div>
               </div>
               <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
                 {[
                   { name: "Hardware Tool", price: "₹450", stock: "24", icon: <Wrench size={24} color="var(--text-secondary)" /> },
                   { name: "Pesticide 1L", price: "₹1200", stock: "8", icon: <FlaskConical size={24} color="var(--text-secondary)" /> },
                   { name: "Fertilizer 5kg", price: "₹850", stock: "45", icon: <Sprout size={24} color="var(--text-secondary)" /> },
                   { name: "Nails Box", price: "₹120", stock: "105", icon: <Hammer size={24} color="var(--text-secondary)" /> },
                   { name: "Water Pump", price: "₹3500", stock: "2", icon: <Droplets size={24} color="var(--text-secondary)" /> },
                   { name: "PVC Pipe 10m", price: "₹250", stock: "60", icon: <Pipette size={24} color="var(--text-secondary)" /> }
                 ].map((item, i) => (
                   <div key={i} style={{ height: "100px", background: "var(--bg-primary)", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                        {item.icon}
                     </div>
                     <div style={{ fontSize: "14px", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{item.name}</div>
                     <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>{item.price} <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "10px" }}>({item.stock} left)</span></div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "100px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>Built for modern stores.</h2>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)" }}>Everything you need to run your business smoothly.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            
            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)" }}>
                <WifiOff size={24} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>100% Offline First</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Your data lives entirely on your device. so loading screens, no internet dependency, and zero latency.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)" }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Infinite Scale</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Thousands of items in your inventory? No problem. The serverless architecture ensures instantaneous search and checkout.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)" }}>
                <Smartphone size={24} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Mobile Native</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Use your device's camera to scan barcodes instantly. Print receipts directly to thermal printers via Bluetooth.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" style={{ padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>How it empowers your business</h2>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
              SaleSync is packed with advanced features designed specifically for large inventories and fast-paced retail environments.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
            
            {/* Feature 1 */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "40px" }}>
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)", border: "1px solid var(--border)" }}>
                  <FileSpreadsheet size={24} />
                </div>
                <h3 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.5px" }}>Bulk Inventory Management</h3>
                <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                  For large stores, manually adding thousands of items is impossible. With our powerful bulk import tool, you can upload your entire store's inventory instantly via CSV files.
                </p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div>Downloadable CSV templates</li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div>Error-free automated parsing</li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }}></div>Real-time stock quantity tracking</li>
                </ul>
              </div>
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "40px", border: "1px solid var(--border)", position: "relative" }}>
                 <div className="glass-panel" style={{ padding: "24px", background: "var(--card-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                       <span style={{ fontWeight: 600 }}>inventory_list.csv</span>
                       <span style={{ color: "var(--accent)", fontWeight: 600 }}>Import Success</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                       <div style={{ height: "30px", background: "var(--bg-secondary)", borderRadius: "6px", width: "100%" }}></div>
                       <div style={{ height: "30px", background: "var(--bg-secondary)", borderRadius: "6px", width: "90%" }}></div>
                       <div style={{ height: "30px", background: "var(--bg-secondary)", borderRadius: "6px", width: "95%" }}></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: "flex", flexWrap: "wrap-reverse", alignItems: "center", gap: "40px" }}>
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "40px", border: "1px solid var(--border)" }}>
                 <div className="glass-panel" style={{ padding: "24px", background: "var(--card-bg)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                       <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={20} color="var(--text-secondary)" /></div>
                       <div>
                         <div style={{ fontWeight: 600 }}>Rahul Sharma</div>
                         <div style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>Khata (Unpaid)</div>
                       </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                       <div>
                         <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Outstanding Balance</div>
                         <div style={{ fontSize: "24px", fontWeight: 800 }}>₹4,500</div>
                       </div>
                       <div style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>Receive Payment</div>
                    </div>
                 </div>
              </div>
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)", border: "1px solid var(--border)" }}>
                  <Database size={24} />
                </div>
                <h3 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.5px" }}>Khata & Customer Credit</h3>
                <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                  Many retail stores run on trust. Keep track of customer credits seamlessly with our built-in 'Khata' system. Record unpaid bills, track outstanding balances, and settle payments later without missing a beat.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "40px" }}>
              <div style={{ flex: "1 1 400px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--accent)", border: "1px solid var(--border)" }}>
                  <BarChart3 size={24} />
                </div>
                <h3 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.5px" }}>Intelligent Stock Tracking</h3>
                <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                  Say goodbye to manual stock checks. SaleSync automatically tracks your inventory as sales happen, actively prevents negative stock scanning, and highlights low-stock items in striking red so you always know when to restock.
                </p>
              </div>
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "40px", border: "1px solid var(--border)", position: "relative" }}>
                 <div className="glass-panel" style={{ padding: "24px", background: "var(--card-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "12px", border: "1px solid var(--border)", borderRadius: "12px" }}>
                       <span style={{ fontWeight: 600 }}>Hardware Tool (A1)</span>
                       <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>24 in stock</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #ef4444", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px" }}>
                       <span style={{ fontWeight: 600 }}>Pesticide 500ml</span>
                       <span style={{ color: "#ef4444", fontWeight: 700 }}>2 in stock</span>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" style={{ padding: "100px 0", background: "var(--bg-secondary)", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-1px" }}>Ready to upgrade your store?</h2>
          <p style={{ fontSize: "20px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: 1.6 }}>
            Download the APK today and experience the fastest, most reliable POS system ever built for mobile.
          </p>
          <Link href="/downloads" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "20px 40px", fontSize: "1.2rem" }}>
            <Download size={24} />
            Download Latest APK (v1.0.0)
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "60px 0", borderTop: "1px solid var(--border)", background: "var(--bg-primary)", marginTop: "auto" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
              S
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>SaleSync</span>
          </div>
          
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/privacy" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Terms of Service</Link>
          </div>
          
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            &copy; {new Date().getFullYear()} SaleSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
