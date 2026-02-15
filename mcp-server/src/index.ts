#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.ATFILTER_API_URL ?? "https://atfilter.com";
const API_KEY = process.env.ATFILTER_API_KEY ?? "";

async function apiGet(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  const url = new URL(path, API_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

const server = new McpServer({
  name: "atfilter-signals",
  version: "1.0.0",
});

// --- Tool: getTopKeywords ---
server.tool(
  "signals_getTopKeywords",
  "Get the top suppressed keywords from @Filter users. Returns ranked keywords with suppression counts and user estimates.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d"])
      .default("24h")
      .describe("Time window"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(50)
      .describe("Max keywords to return"),
  },
  async ({ window, limit }) => {
    const data = await apiGet("/api/v1/signals/top-keywords", {
      window,
      limit: limit.toString(),
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
);

// --- Tool: getKeywordTimeSeries ---
server.tool(
  "signals_getKeywordTimeSeries",
  "Get a time series of suppression data for a specific keyword. Returns bucketed counts over the specified window.",
  {
    keyword: z.string().min(1).describe("The keyword to query"),
    window: z
      .enum(["24h", "7d", "30d", "90d"])
      .default("7d")
      .describe("Time window"),
    bucket: z
      .enum(["hour", "day", "week"])
      .default("hour")
      .describe("Time bucket size"),
  },
  async ({ keyword, window, bucket }) => {
    const data = await apiGet("/api/v1/signals/keyword-timeseries", {
      keyword,
      window,
      bucket,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
);

// --- Tool: getGeoHeat ---
server.tool(
  "signals_getGeoHeat",
  "Get geographic heat map data showing where keyword suppressions are concentrated. Returns regions with suppression counts and user estimates.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d"])
      .default("24h")
      .describe("Time window"),
    level: z
      .enum(["country", "region", "county", "city"])
      .default("country")
      .describe("Geographic granularity"),
  },
  async ({ window, level }) => {
    const data = await apiGet("/api/v1/signals/geo-heat", {
      window,
      level,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
);

// --- Tool: getDomainTimeSeries ---
server.tool(
  "signals_getDomainTimeSeries",
  "Get a time series of suppression data for a specific domain (e.g., cnn.com, reddit.com). Returns bucketed counts over the specified window.",
  {
    domain: z.string().min(1).describe("The domain to query (e.g. cnn.com)"),
    window: z
      .enum(["24h", "7d", "30d", "90d"])
      .default("7d")
      .describe("Time window"),
    bucket: z
      .enum(["hour", "day", "week"])
      .default("hour")
      .describe("Time bucket size"),
  },
  async ({ domain, window, bucket }) => {
    const data = await apiGet("/api/v1/signals/domain-timeseries", {
      domain,
      window,
      bucket,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  },
);

// --- Start ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[atfilter-mcp] Server started on stdio");
}

main().catch((err) => {
  console.error("[atfilter-mcp] Fatal error:", err);
  process.exit(1);
});
