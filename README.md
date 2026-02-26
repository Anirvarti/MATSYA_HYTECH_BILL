# SATYA_HYTECH ERP - Next-Gen POS System

![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

> **A lightning-fast, offline-first Point of Sale (POS) and Inventory Management native desktop application. Engineered for macOS and Windows using a highly optimized microservice architecture.**

## 🏗️ Engineering Motivation & Architecture

Modern desktop applications are often built using Electron, which bundles an entire Chromium browser and Node.js backend, resulting in massive file sizes and heavy RAM usage. **Hytech ERP solves this by utilizing a lightweight Sidecar Architecture:**

* **The Face (Frontend):** Built with React + TypeScript and Vite. Styled with custom Glassmorphism CSS for a sleek, modern, cashier-friendly interface.
* **The Shell (Desktop Runtime):** Tauri (Rust). Provides military-grade OS security and native window management while consuming a fraction of the memory of standard web-wrapped apps.
* **The Brain (Sidecar Engine):** A compiled Go (Golang) microservice that boots invisibly in the background. It handles heavy mathematical calculations, API routing, and security handshakes (CORS) locally.
* **The Vault (Database):** PebbleDB (by Cockroach Labs). An embedded, ultra-fast key-value store that saves transaction data directly to the local disk in milliseconds—requiring zero cloud infrastructure.

## ✨ Core Features
* **100% Offline-First:** Runs entirely locally without needing a cloud database or internet connection.
* **Sub-Millisecond Barcode Scanning:** Instant query response for scanning SKUs and adding to the cart.
* **Native OS Binaries:** The Go engine is compiled directly to machine code (`aarch64` for Mac / `x86_64` for Windows) and tightly bound to the Tauri Rust shell.
* **Automated CI/CD (DevOps):** Uses GitHub Actions to automatically spin up cloud servers and compile `.msi` Windows installers on every repository push.
* **Pro-Cashier Hotkeys:** Keyboard-driven workflow (`F2` for New Product Modal, `F5` for Rapid Checkout).

---

## 📂 Project Structure

```text
hytech-pos/
├── sidecar/                 # The Go Backend Engine
│   ├── main.go              # API Routes & DB Logic
│   ├── go.mod               # Go dependencies
│   └── inventory_data/      # Local PebbleDB Storage (Ignored in Git)
├── src-tauri/               # The Rust Security Shell
│   ├── tauri.conf.json      # App configs & externalBin registration
│   ├── src/lib.rs           # Rust ignition switch for the Go sidecar
│   └── binaries/            # Compiled Go executables for Mac/Windows
├── src/                     # The React UI
│   ├── App.tsx              # Main Dashboard, Scanner, & F2 Modal
│   ├── App.css              # Glassmorphism & layout styles
│   └── main.tsx             # React DOM entry
└── .github/workflows/       # CI/CD Pipelines
    └── build-windows.yml    # Automated Windows .msi generator
