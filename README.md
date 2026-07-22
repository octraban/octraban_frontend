<div align="center">

# Octraban — Frontend

**A human-readable block explorer & developer workspace for Soroban smart contracts on Stellar.**

Decode raw contract calls into plain English, visualise contract relationships, replay transactions, and prototype against live contracts — all in the browser.

[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7D00FF?logo=stellar&logoColor=white)](https://soroban.stellar.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

---

## 🟢 Live on Testnet

The Octraban Soroban contracts are **deployed and verifiable on the Stellar test network** right now:

| Contract                | Contract ID                                                | Stellar Explorer                                                                                                                      |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Explorer / registry** | `CBKPNRQ4D3KTAAE7MMJ4HL6JNF2J2EBG2PSSRW4YHOMHTRHUU734CFWJ` | [View on stellar.expert ↗](https://stellar.expert/explorer/testnet/contract/CBKPNRQ4D3KTAAE7MMJ4HL6JNF2J2EBG2PSSRW4YHOMHTRHUU734CFWJ) |
| **Ticket**              | `CDX3V6OE72KUIEEJTBLFCQZFXZCAKOYWYXK2KPRM57M6FLZFAVUSVL42` | [View on stellar.expert ↗](https://stellar.expert/explorer/testnet/contract/CDX3V6OE72KUIEEJTBLFCQZFXZCAKOYWYXK2KPRM57M6FLZFAVUSVL42) |

> **Network:** `Test SDF Network ; September 2015` · **RPC:** `https://soroban-testnet.stellar.org`

Point the app at these contracts by keeping the default testnet configuration in your `.env` (see [Configuration](#-configuration)).

---

## 📋 Overview

Raw Soroban activity is opaque — a swap looks like an unlabelled base64 XDR blob. **Octraban** turns that noise into signal. It pairs an ABI-aware indexer (in the [backend](https://github.com/octraban/octraban_backend) repo) with a rich React UI that renders contract calls, events, and relationships the way a human actually reads them:

> _"Address `GABC…` swapped 100 USDC → 98.7 XLM on StellarSwap at ledger 4,521,983."_

Beyond read-only exploration, Octraban ships a **developer workspace** — an in-browser editor and sandbox for prototyping contract interactions against live testnet contracts without leaving the tab.

---

## ✨ Features

### 🔍 Explore

| Feature                          | Description                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Contract dashboard**           | Metadata, ABI, privileged roles, recent transactions and events for any contract (`/contract/:id`) |
| **Human-readable events**        | XDR decoded into plain-English event rows via the ABI registry                                     |
| **Event & sub-invocation views** | Drill into a single event (`/event/:seq`) or the full sub-invocation tree of a call                |
| **Wallet history**               | All transactions and events for an address (`/wallet/:address`)                                    |
| **Universal search**             | Look up contracts, wallets, transactions, and events from one bar (`/search`)                      |
| **XDR inspector**                | Paste any XDR envelope and decode it field-by-field (`/xdr`)                                       |

### 🕸️ Visualise

| Feature                            | Description                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| **Relationship graph**             | Interactive contract/address relationship graph (`/graph`) built with Cytoscape |
| **3D dependency graph**            | `3d-force-graph` view of contract dependencies and factory deployment trees     |
| **Invocation & batch flow charts** | React-Flow diagrams of call flows and batched multi-calls                       |
| **Address connection graph**       | Trace value and call flow between accounts                                      |

### 🛠️ Build

| Feature                 | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| **Developer workspace** | Monaco-powered editor + file explorer scoped to a contract (`/contract/:id/workspace`)                  |
| **Sandbox**             | Run and share snippets against live contracts using a WebContainer runtime (`/sandbox`, `/sandbox/:id`) |
| **Batch multi-call**    | Compose and preview batched contract invocations (`/batch`)                                             |
| **ABI upload**          | Drop a local ABI to decode events for unregistered contracts                                            |
| **Guided setup**        | First-run configuration walkthrough (`/setup`)                                                          |

### 📊 Operate

| Feature                           | Description                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| **RPC metrics dashboard**         | Latency, throughput, and circuit-breaker status for the RPC layer (`/rpc-metrics`) |
| **Rate-limit dashboard**          | Admin view of rate-limit hits (`/admin/rate-limits`)                               |
| **Network switcher & comparison** | Toggle networks and compare state side-by-side                                     |
| **Wallet integration**            | Connect with **Freighter** for signing and account context                         |

---

## 🧱 Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| **Framework**      | React 18 + TypeScript, bundled with **Vite**     |
| **Routing**        | React Router                                     |
| **Data**           | TanStack Query (server state, caching, retries)  |
| **Stellar**        | `@stellar/stellar-sdk`, `@stellar/freighter-api` |
| **Visualisation**  | Cytoscape, `3d-force-graph`, React-Flow          |
| **In-browser IDE** | Monaco Editor + `@webcontainer/api` sandbox      |
| **Testing**        | Vitest + Testing Library (jsdom)                 |
| **Tooling**        | ESLint, Prettier, TypeScript strict mode         |

---

## 📁 Project Structure

```
src/
├── pages/          # Route-level screens (Home, ContractPage, GraphPage, Sandbox, …)
├── components/     # Reusable UI (graphs, tables, editor, dashboards, banners)
├── contexts/       # React context providers (network, wallet, …)
├── hooks/          # Custom hooks (data fetching, wallet, RPC metrics)
├── services/       # API/RPC clients, templates, WebContainer glue
├── types/          # Shared TypeScript types
├── utils/          # Formatting, XDR helpers, snippet generation
└── styles/         # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 18**
- The [Octraban backend](https://github.com/octraban/octraban_backend) running locally (provides the indexer API the UI reads from), or a reachable indexer URL
- A [Freighter](https://www.freighter.app/) wallet for signing (optional, for write flows)

### Installation

```bash
git clone https://github.com/octraban/octraban_frontend.git
cd octraban_frontend

npm install
cp .env.example .env      # then edit as needed
npm run dev               # http://localhost:5173
```

### Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the Vite dev server            |
| `npm run build`      | Type-check and build for production  |
| `npm run preview`    | Preview the production build locally |
| `npm test`           | Run the Vitest suite                 |
| `npm run test:watch` | Run tests in watch mode              |

---

## 🔧 Configuration

Copy `.env.example` → `.env` and adjust:

| Variable                  | Default                               | Description                                |
| ------------------------- | ------------------------------------- | ------------------------------------------ |
| `VITE_INDEXER_URL`        | `http://localhost:3001`               | Octraban indexer API the UI reads from     |
| `VITE_SOROBAN_RPC_URL`    | `https://soroban-testnet.stellar.org` | Soroban RPC endpoint (used by the Sandbox) |
| `VITE_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015`   | Stellar network passphrase                 |

The defaults point at **Stellar testnet**, so a fresh checkout talks to the live testnet deployment out of the box.

---

## 🗺️ How it fits together

Octraban is split across three repositories:

- **octraban_frontend** _(this repo)_ — the explorer & developer workspace UI.
- **[octraban_backend](https://github.com/octraban/octraban_backend)** — the API + indexer that ingests on-chain data and serves it to the UI (`:3001`).
- **[octraban_contract](https://github.com/octraban/octraban_contract)** — the Soroban smart contracts (explorer registry + ticket), deployed to testnet.

```
Freighter ─┐
           ▼
    octraban_frontend  ──▶  octraban_backend (indexer :3001)  ──▶  Soroban RPC / testnet
       (this repo)                                                   ▲
                                                                     │
                                              octraban_contract (deployed testnet contracts)
```

---

## 🤝 Contributing

Issues and pull requests are welcome. Please run `npm run build` and `npm test` before opening a PR, and keep changes consistent with the existing ESLint/Prettier configuration.

## 📄 License

Released under the [MIT License](./LICENSE).
