"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Smartphone, Zap, WifiOff, Download, ChevronRight, BarChart3, Database, FileSpreadsheet, Users, Wrench, FlaskConical, Sprout, Hammer, Droplets, Pipette, BookX, CheckCircle2, Apple, Play, Star, MessageSquareQuote, HelpCircle, Scan, History, Smile } from "lucide-react";
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
            <Link href="#features" className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }}>
              Features
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
            <a href="#" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", fontSize: "1rem", background: "#000", color: "#fff", border: "1px solid #333" }}>
              <Apple size={28} />
              <div style={{ textAlign: "left", lineHeight: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 400, opacity: 0.8 }}>Download on the</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>App Store</div>
              </div>
            </a>
            <a href="#" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", fontSize: "1rem", background: "#000", color: "#fff", border: "1px solid #333" }}>
              <Play size={24} />
              <div style={{ textAlign: "left", lineHeight: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: 400, opacity: 0.8 }}>GET IT ON</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>Google Play</div>
              </div>
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
              maxWidth: "320px", 
              position: "relative",
              overflow: "hidden",
              zIndex: 1
            }}>
              <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", background: "#fff" }}>
                 <img src="/images/dashboard.png" alt="App Dashboard" style={{ width: "100%", height: "auto", display: "block", marginTop: "-9%" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section style={{ padding: "100px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>Still using a pen and notebook to manage your store?</h2>
            <p style={{ fontSize: "20px", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto", lineHeight: 1.6 }}>
              Most POS systems today promise you the moon in the beginning, but end up being too complicated, require constant high-speed internet, and hit you with hidden fees. As far as SaleSync is concerned, we stick to our promises and keep the expectations of our customers as our TOP PRIORITY.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", maxWidth: "1000px", margin: "0 auto" }}>
            {/* The Old Way */}
            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)", borderTop: "4px solid #ef4444" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "12px" }}>
                  <BookX size={32} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700 }}>The Traditional Way</h3>
              </div>
              <p style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.7 }}>
                With a traditional notebook, at least it never loses signal. But the problem is, keeping track of every single sale by hand takes up all your valuable time. Finding a customer's old credit (Khata) when they visit the store is a huge headache because you have to flip through hundreds of pages. You end up sitting late at night just calculating the day's earnings and figuring out what stock you need to buy for tomorrow. It gets exhausting very fast.
              </p>
            </div>

            {/* The New Way */}
            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)", borderTop: "4px solid #22c55e", position: "relative" }}>
              <div style={{ position: "absolute", top: "-14px", right: "20px", background: "#22c55e", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>SALE SYNC</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ padding: "12px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: "12px" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700 }}>The SaleSync Way</h3>
              </div>
              <p style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.7 }}>
                We are using technology at its best. We have developed a powerful offline-first system that works perfectly without any internet connection. Just scan the barcode, and the app instantly updates your stock and calculates the total. Your customer's Khata is available at your fingertips. We ensure your expectations are met by keeping the app completely free of complicated menus, so you can just focus on growing your business and go home on time.
              </p>
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
                Your data lives entirely on your device. Zero loading screens, zero internet dependency, and zero latency.
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
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "20px", border: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
                 <div style={{ width: "100%", maxWidth: "260px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "1px solid var(--border)", background: "#fff" }}>
                   <img src="/images/items.png" alt="Items Management" style={{ width: "100%", height: "auto", display: "block", marginTop: "-9%" }} />
                 </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{ display: "flex", flexWrap: "wrap-reverse", alignItems: "center", gap: "40px" }}>
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "20px", border: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
                 <div style={{ width: "100%", maxWidth: "260px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "1px solid var(--border)", background: "#fff" }}>
                   <img src="/images/history.png" alt="Khata History" style={{ width: "100%", height: "auto", display: "block", marginTop: "-9%" }} />
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
              <div style={{ flex: "1 1 400px", background: "var(--bg-secondary)", borderRadius: "24px", padding: "20px", border: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
                 <div style={{ width: "100%", maxWidth: "260px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", border: "1px solid var(--border)", background: "#fff" }}>
                   <img src="/images/receipt.png" alt="Sales Receipt" style={{ width: "100%", height: "auto", display: "block", marginTop: "-9%" }} />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: "100px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>How it works</h2>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
              Three simple steps to digitize your store and get your evenings back.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
             <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--accent)", color: "#fff", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", boxShadow: "0 10px 25px rgba(249,115,22,0.3)" }}>
                   <Scan size={36} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>1. Scan & Sell</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Point your phone camera at a barcode. SaleSync instantly identifies the item and adds it to the cart.</p>
             </div>
             <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--accent)", color: "#fff", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", boxShadow: "0 10px 25px rgba(249,115,22,0.3)" }}>
                   <History size={36} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>2. Record Khata</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Customer paying later? Add it to their digital Khata with one tap. Outstanding balances are automatically tracked.</p>
             </div>
             <div style={{ textAlign: "center", position: "relative" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--accent)", color: "#fff", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", boxShadow: "0 10px 25px rgba(249,115,22,0.3)" }}>
                   <Smile size={36} />
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>3. Go Home Early</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Close the shop. Your profits are calculated, inventory is updated, and reorder alerts are set. No math required.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: "100px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>Trusted by store owners like you</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", maxWidth: "900px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)" }}>
               <div style={{ display: "flex", gap: "4px", color: "#f59e0b", marginBottom: "20px" }}>
                 <Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} />
               </div>
               <p style={{ fontSize: "18px", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "24px", lineHeight: 1.6 }}>"I used to spend 2 hours every night matching my cash drawer with a huge pile of handwritten receipts. With SaleSync, I close the shop and I'm done in 5 minutes. It literally changed my life."</p>
               <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={24} color="var(--text-secondary)" /></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Rajesh Kumar</div>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Grocery Store Owner</div>
                  </div>
               </div>
            </div>
            <div className="glass-panel" style={{ padding: "40px", background: "var(--card-bg)" }}>
               <div style={{ display: "flex", gap: "4px", color: "#f59e0b", marginBottom: "20px" }}>
                 <Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} /><Star fill="#f59e0b" size={20} />
               </div>
               <p style={{ fontSize: "18px", color: "var(--text-primary)", fontStyle: "italic", marginBottom: "24px", lineHeight: 1.6 }}>"The Khata feature is magic. No more arguments with customers about old debts because I can show them exactly when they bought the items on my phone. Best app for business."</p>
               <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={24} color="var(--text-secondary)" /></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Vikram Singh</div>
                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Hardware Shop</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: "100px 0", background: "var(--bg-primary)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             <div style={{ padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Do I need internet to use SaleSync?</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Not at all. SaleSync is built with an offline-first architecture. It works perfectly in basements, remote areas, or during internet outages. All data is saved directly on your phone.</p>
             </div>
             <div style={{ padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>How much does it cost?</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>SaleSync is currently completely free with no hidden charges. We believe every shopkeeper deserves access to powerful digital tools without expensive subscriptions.</p>
             </div>
             <div style={{ padding: "24px", background: "var(--bg-secondary)", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Is my data safe if I lose my phone?</h4>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>Yes! While the app runs offline, you can enable daily automatic backups to your personal Google Drive or export your entire database as a CSV file to keep it safe.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "60px 0", borderTop: "1px solid var(--border)", background: "var(--bg-primary)", marginTop: "auto" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
                S
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700 }}>SaleSync</span>
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "300px", lineHeight: 1.6 }}>
              The ultimate offline-first serverless app for large stores to manage inventory and sales.
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "20px" }}>
              &copy; {new Date().getFullYear()} SaleSync. All rights reserved.
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
               <h4 style={{ fontWeight: 700 }}>Legal</h4>
               <Link href="/privacy" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, transition: "color 0.2s" }}>Privacy Policy</Link>
               <Link href="/terms" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, transition: "color 0.2s" }}>Terms of Service</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
               <h4 style={{ fontWeight: 700 }}>Downloads</h4>
               <Link href="/downloads" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, transition: "color 0.2s" }}>Download APK (v1.0.0)</Link>
               <Link href="/downloads" style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, transition: "color 0.2s" }}>Older Versions Archive</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
