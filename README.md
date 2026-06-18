# 🛒 SaleSync

**SaleSync** is a modern, beautifully designed, offline-first Point-of-Sale (POS) application built for local merchants, shopkeepers, and small businesses. It makes ringing up customers, tracking inventory, and sharing receipts easier and faster than ever before.

Gone are the days of manual ledgers and complex, clunky POS software. With SaleSync, shop owners can scan barcodes, quickly record sales, and generate premium digital receipts to share instantly with customers via WhatsApp—all straight from their smartphone.

## ✨ Key Features

- **📶 100% Offline-First:** Your data is yours. Sales and inventory are stored locally on the device, meaning the app works instantly without waiting on a slow internet connection.
- **📸 Smart Barcode Scanning:** Integrated camera scanner allows for lightning-fast checkouts.
- **🌐 Intelligent FMCG Lookup:** When scanning a completely new barcode, you have the option to fetch the product details automatically from the online Open Food Facts database, or simply enter it manually.
- **🧾 Beautiful Digital Receipts:** Automatically generates a professional, fully-branded digital receipt image (featuring your custom shop name) that can be shared instantly via WhatsApp or any other messaging app.
- **🌍 Multi-Language Support:** Easily switch between English, Hindi, and Marathi to use the app in your preferred language.
- **⚡ Quick Sale Mode:** Don't have time to add an item to the catalog? Just enter the amount and hit confirm to keep the line moving.

---

## 🛠 Tech Stack & Why We Chose It

We built SaleSync with a modern, robust, and mobile-first technology stack:

- **React Native & Expo:** 
  *What it does:* The core framework of the app.
  *Why we use it:* It allows us to write code once and deploy a blazing-fast, native-feeling app for both Android and iOS devices. Expo provides excellent built-in libraries for accessing device hardware.
- **Expo Router:**
  *What it does:* Handles the navigation between different screens (Today, Sale, Items, History, Settings).
  *Why we use it:* It uses a file-based routing system (similar to Next.js) which makes the app's structure incredibly easy to understand and maintain.
- **React Context + AsyncStorage:**
  *What it does:* Manages the app's data (inventory items, past sales, chosen language, shop name).
  *Why we use it:* Instead of relying on heavy, complex external databases (like Firebase or PostgreSQL) that require internet, we use Context and AsyncStorage to save everything directly to the phone's local storage. This guarantees the app is lightning fast and works 100% offline.
- **Expo Camera:**
  *What it does:* Powers the barcode scanner on the "Sale" screen.
  *Why we use it:* Provides a seamless, native camera view directly inside the app for instant barcode recognition.
- **React Native View Shot & Expo Sharing:**
  *What it does:* Generates the digital receipt and handles the sharing process.
  *Why we use it:* `view-shot` takes our custom, beautifully styled React Native receipt component and converts it into a high-quality JPEG image in the background. `expo-sharing` then pops up the phone's native share menu so the shopkeeper can send it straight to the customer's WhatsApp.

---

## 🚀 How to Run the Project Locally

Follow these steps to get SaleSync running on your own computer and mobile device:

### Prerequisites
1. **Node.js** installed on your computer.
2. **pnpm** (Package Manager) installed (`npm install -g pnpm`).
3. **Expo Go** app installed on your physical Android or iOS device.

### Installation & Running

1. **Clone or Download the Repository:**
   Open your terminal and navigate to the project directory.
   ```bash
   cd Shop-Register-Pro
   ```

2. **Install Dependencies:**
   We use `pnpm` as our package manager. Run the following command to install all necessary packages:
   ```bash
   pnpm install
   ```

3. **Start the Development Server:**
   Launch the Expo development server. Since the app is located in a specific workspace directory, use the following command:
   ```bash
   pnpm --filter @workspace/dukaan run dev
   ```

4. **Open the App:**
   - Once the server starts, you will see a large **QR Code** in your terminal.
   - Make sure your mobile device is connected to the **same Wi-Fi network** as your computer.
   - **On Android:** Open the "Expo Go" app and tap "Scan QR Code".
   - **On iOS:** Open your default Camera app, point it at the QR code, and tap the Expo Go prompt that appears.

The app will bundle the JavaScript and launch SaleSync right on your phone! 

---

## 📦 Deploying to Production (APK)

When you are ready to distribute your app to real users, you can generate a standalone Android APK using EAS (Expo Application Services).

1. **Create an Expo Account:**
   If you don't have one, sign up for a free account at [expo.dev/signup](https://expo.dev/signup).

2. **Login to EAS CLI:**
   In your terminal, log into your Expo account by running:
   ```bash
   pnpm dlx eas-cli login
   ```

3. **Trigger the Cloud Build:**
   Once logged in, run the following command to securely send your code to Expo's cloud servers, where it will be compiled into a `.apk` file:
   ```bash
   pnpm dlx eas-cli build -p android --profile preview
   ```

4. **Download your App:**
   The terminal will provide you with a dashboard URL. You can close your laptop or track the progress live on that webpage. Once the build finishes, a "Download APK" button will appear.

---
*Built to empower small businesses and local shopkeepers.*