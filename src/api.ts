const BASE = "/api";

export interface DecodedEvent {
  seq: number;
  contract_id: string;
  function: string;
  ledger: number;
  description: string;
  raw_topics: string[];
  tx_hash?: string;
}

export interface ContractMeta {
  id: string;
  name: string;
  description: string;
  functions: { name: string; description: string }[];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export interface SimResult {
  success: boolean;
  returnValue?: string;
  cost?: { cpuInsns: string; memBytes: string };
  error?: string;
}

export const api = {
  events: (params: { contract?: string; fn?: string; page?: number; type?: string }) => {
    const q = new URLSearchParams();
    if (params.contract) q.set("contract", params.contract);
    if (params.fn)       q.set("fn", params.fn);
    if (params.page)     q.set("page", String(params.page));
    if (params.type)     q.set("type", params.type);
    return get<DecodedEvent[]>(`/events?${q}`);
  },
  event:    (seq: number)     => get<DecodedEvent>(`/events/${seq}`),
  contract: (id: string)      => get<ContractMeta>(`/contracts/${id}`),
  wallet:   (address: string) => get<DecodedEvent[]>(`/wallet/${address}`),
  simulate: (contractId: string, fn: string, args: unknown[]) =>
    fetch(`${BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId, fn, args }),
    }).then(r => r.json() as Promise<SimResult>),
};
