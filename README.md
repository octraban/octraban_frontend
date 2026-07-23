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
- The **[octraban_backend](https://github.com/pharuq411/octraban_backend)** indexer running locally on `:3001` (provides all `/api/*` data the UI reads from). Clone and start it first — the frontend will show a prominent banner until the backend is reachable.
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
- **[octraban_backend](https://github.com/pharuq411/octraban_backend)** — the API + indexer that ingests on-chain data and serves it to the UI (`:3001`).
- **[octraban_contract](https://github.com/octraban/octraban_contract)** — the Soroban smart contracts (explorer registry + ticket), deployed to testnet.

### Port topology

| Service                          | Default port | Notes                                              |
| -------------------------------- | ------------ | -------------------------------------------------- |
| **octraban_frontend** (Vite dev) | `:5173`      | `npm run dev`; production build served on `:3000` (nginx / Docker) |
| **octraban_backend** (indexer)   | `:3001`      | All `/api/*` traffic is proxied here               |
| **Soroban RPC**                  | n/a          | `VITE_SOROBAN_RPC_URL` (testnet default)           |

```
Browser (user)
     │
     ▼
octraban_frontend  :5173 dev / :3000 prod
     │  all /api/* requests
     ▼
octraban_backend (indexer)  :3001   ◀─── start this first
     │
     ▼
Soroban RPC / Stellar testnet
     ▲
     │
octraban_contract (deployed testnet contracts)
```

In development, Vite proxies every `/api/*` request to `http://localhost:3001` (configured in `vite.config.ts`). The production Docker image uses nginx for the same proxy. **The frontend will display a banner and all data views will fail if the backend is not running.**

---

## 🔌 Backend API contract

> All endpoints are served by the [octraban_backend](https://github.com/pharuq411/octraban_backend) indexer on port **3001**.
> In development the Vite proxy (`server.proxy` in `vite.config.ts`) forwards `/api → http://localhost:3001` so the frontend always uses relative `/api/*` paths.

### Health

| Method | Path         | Description                                      |
| ------ | ------------ | ------------------------------------------------ |
| GET    | `/api/health` | Liveness check — 200 OK when the indexer is up. Used by `BackendStatusBanner` on startup. |

### Explorer — read endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/events` | Paginated event list (`?contract=&fn=&page=&type=`) |
| GET | `/api/events/:seq` | Single decoded event |
| GET | `/api/events/:seq/zk-costs` | CAP-0080 ZK host-function telemetry for an event |
| GET | `/api/search` | Universal search (`?q=&limit=`) — contracts, events, wallets |
| GET | `/api/contracts/:id` | Contract metadata + ABI |
| GET | `/api/contracts/:id/abi` | Download ABI as JSON blob |
| GET | `/api/contracts/:id/spec-full` | Full contract spec (functions + custom types) |
| GET | `/api/contracts/:id/migration-status` | SEP-49 migration state |
| GET | `/api/contracts/:id/roles` | Privileged role addresses |
| GET | `/api/contracts/:id/network-comparison` | State across networks |
| GET | `/api/contracts/:id/address-graph` | Address relationship graph data |
| GET | `/api/contracts/:id/circuit-breaker` | Circuit-breaker pause status |
| GET | `/api/contracts/:id/rwa-metadata` | Real-world asset token metadata |
| GET | `/api/contracts/:id/source-verifications` | Multi-sig source verifications (`?wasm_hash=`) |
| GET | `/api/contracts/:id/ttl` | Live TTL for instance + code entries |
| GET | `/api/contracts/:id/state-diffs` | Storage state-diff timeline (`?key=`) |
| GET | `/api/contracts/:id/quorum-freeze` | CAP-0077 quorum-freeze status |
| GET | `/api/burn-alerts` | Burn-rate alerts (`?contract=`) |
| GET | `/api/wallet/:address` | Events for a wallet address |
| GET | `/api/contract-graph` | Global contract dependency graph (`?limit=`) |
| GET | `/api/v1/contracts/:id/events-deep` | Events where contract appears directly or as sub-invocation (`?page=`) |

### Transactions & sub-invocations

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/transactions/:txHash/sub-invocations` | Sub-invocation tree for a transaction |
| GET | `/api/transactions/:txHash/status` | Transaction status (polling) |
| GET | `/api/transactions/:txHash/status/stream` | Live status via Server-Sent Events |
| GET | `/api/transactions/:txHash/call-path-metrics` | Analytical call-path metrics |
| GET | `/api/transactions/compare` | Cross-transaction tree diff (`?a=&b=`) |
| GET | `/api/sub-invocations/search` | Filtered sub-invocation search (8+ filter params) |
| GET | `/api/sub-invocations/analytics` | Aggregate analytics across all sub-invocations |
| GET | `/api/sub-invocations/stream` | SSE feed of live sub-invocations (`?contract=&function=`) |

### Write & simulation

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/contracts/:id/source-verifications` | Submit a source verification signature |
| POST | `/api/simulate` | Simulate a single contract invocation |
| POST | `/api/batch/simulate` | Batch multi-call simulation |
| POST | `/api/batch/estimate-gas` | Batch gas estimation |
| POST | `/api/batch/optimize` | Batch call-order optimisation |
| POST | `/api/batch/validate` | Batch call validation |

### Sandbox persistence

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST   | `/api/sandbox` | Save a sandbox session |
| GET    | `/api/sandbox/:id` | Load a sandbox session |
| DELETE | `/api/sandbox/:id` | Delete a sandbox session |
| GET    | `/api/sandboxes` | List sandbox sessions (`?limit=&offset=`) |

### Operations & admin

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/rpc-metrics` | RPC layer latency, throughput, and circuit-breaker state |
| GET | `/api/admin/analytics/rate-limit-hits` | Rate-limit hit counts (`?minutes=60`) |
| GET | `/api/admin/analytics/top-users` | Top rate-limit offenders (`?window=`) |
| GET | `/api/admin/analytics/violation-heatmap` | Rate-limit heatmap |
| GET | `/api/admin/analytics/upgrade-recommendations` | Upgrade advisories |
| GET | `/api/setup/doctor` | Backend diagnostic / health check |
| POST | `/api/setup/test-db` | Test database connection |
| POST | `/api/setup/save-config` | Persist backend configuration |
| POST | `/api/setup/db-init` | Initialise the database |

---

## 🤝 Contributing

Issues and pull requests are welcome. Please run `npm run build` and `npm test` before opening a PR, and keep changes consistent with the existing ESLint/Prettier configuration.

## 📄 License

Released under the [MIT License](./LICENSE).
