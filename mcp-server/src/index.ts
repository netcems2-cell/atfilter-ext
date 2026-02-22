#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.ATFILTER_API_URL ?? "https://atfilter.com";
const API_KEY = process.env.ATFILTER_API_KEY ?? "";

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

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

async function apiPost(
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const url = new URL(path, API_URL);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "atfilter-signals",
  version: "1.0.0",
});

// --- Tool: getTopKeywords ---
server.tool(
  "signals_top_keywords",
  "Get the most suppressed keywords by @Filter users. " +
    "Use this to discover what topics people are actively filtering out of their feeds. " +
    "Returns ranked keywords with suppression counts and estimated unique user counts.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d"])
      .default("24h")
      .describe("Time window to aggregate over"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(50)
      .describe("Maximum number of keywords to return"),
  },
  async ({ window, limit }) => {
    const data = await apiGet("/api/v1/signals/top-keywords", {
      window,
      limit: limit.toString(),
    });
    return textResult(data);
  },
);

// --- Tool: getKeywordTimeSeries ---
server.tool(
  "signals_keyword_timeseries",
  "Get a time series showing how suppression activity for a specific keyword changes over time. " +
    "Use this to track whether a topic is rising or falling in filtering activity, " +
    "spot spikes after news events, or compare activity levels across different time periods.",
  {
    keyword: z.string().min(1).describe("The keyword to query (e.g. 'trump', 'crypto')"),
    window: z
      .enum(["24h", "7d", "30d", "90d"])
      .default("7d")
      .describe("Time window to cover"),
    bucket: z
      .enum(["hour", "day", "week"])
      .default("hour")
      .describe("Time bucket granularity"),
  },
  async ({ keyword, window, bucket }) => {
    const data = await apiGet("/api/v1/signals/keyword-timeseries", {
      keyword,
      window,
      bucket,
    });
    return textResult(data);
  },
);

// --- Tool: getGeoHeat ---
server.tool(
  "signals_geo_heat",
  "Get geographic distribution of content filtering activity. " +
    "Shows where suppression activity is concentrated at country, region (state), county, or city level. " +
    "Use this for geographic analysis of filtering behavior patterns.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d"])
      .default("24h")
      .describe("Time window to aggregate over"),
    level: z
      .enum(["country", "region", "county", "city"])
      .default("country")
      .describe("Geographic granularity level"),
  },
  async ({ window, level }) => {
    const data = await apiGet("/api/v1/signals/geo-heat", {
      window,
      level,
    });
    return textResult(data);
  },
);

// --- Tool: getDomainTimeSeries ---
server.tool(
  "signals_domain_timeseries",
  "Get a time series of suppression activity for a specific website domain. " +
    "Use this to track filtering activity on specific platforms like twitter.com, cnn.com, reddit.com, etc.",
  {
    domain: z.string().min(1).describe("The domain to query (e.g. 'cnn.com', 'reddit.com')"),
    window: z
      .enum(["24h", "7d", "30d", "90d"])
      .default("7d")
      .describe("Time window to cover"),
    bucket: z
      .enum(["hour", "day", "week"])
      .default("hour")
      .describe("Time bucket granularity"),
  },
  async ({ domain, window, bucket }) => {
    const data = await apiGet("/api/v1/signals/domain-timeseries", {
      domain,
      window,
      bucket,
    });
    return textResult(data);
  },
);

// --- Tool: query ---
server.tool(
  "signals_query",
  "Flexible query endpoint that lets you filter and group by any combination of dimensions. " +
    "This is the most powerful tool — use it when you need to combine multiple dimensions " +
    "(e.g. 'top keywords on social media in Pennsylvania this month'). " +
    "Dimensions: keyword, domain, platform, page_context, country, region, county, city, time. " +
    "Always returns three measures: suppressions, unique_users, events.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d", "90d"])
      .describe("Time window to aggregate over"),
    group_by: z
      .array(
        z.enum([
          "keyword",
          "domain",
          "platform",
          "page_context",
          "country",
          "region",
          "county",
          "city",
          "time",
        ]),
      )
      .max(5)
      .default([])
      .describe(
        "Dimensions to group by (max 5). Empty array returns grand totals. " +
          "Include 'time' to get time-bucketed results (requires bucket parameter).",
      ),
    bucket: z
      .enum(["hour", "day", "week"])
      .optional()
      .describe("Time bucket size. Required when group_by includes 'time'."),
    keywords: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific keywords"),
    domains: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific domains"),
    platforms: z
      .array(z.enum(["social", "news", "video", "other"]))
      .optional()
      .describe("Filter to specific platform types"),
    page_contexts: z
      .array(z.enum(["homepage", "feed", "search", "article", "other"]))
      .optional()
      .describe("Filter to specific page contexts"),
    countries: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific country codes (e.g. 'US', 'GB')"),
    regions: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific region codes (e.g. 'US-PA', 'US-CA')"),
    counties: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific county IDs"),
    cities: z
      .array(z.string())
      .max(50)
      .optional()
      .describe("Filter to specific city IDs"),
    order_by: z
      .enum(["suppressions", "unique_users", "events"])
      .default("suppressions")
      .describe("Measure to sort results by"),
    order: z
      .enum(["asc", "desc"])
      .default("desc")
      .describe("Sort direction"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(100)
      .describe("Maximum number of results"),
  },
  async (params) => {
    // Build the filters object from individual params
    const filters: Record<string, string[]> = {};
    if (params.keywords?.length) filters.keywords = params.keywords;
    if (params.domains?.length) filters.domains = params.domains;
    if (params.platforms?.length) filters.platforms = params.platforms;
    if (params.page_contexts?.length) filters.page_contexts = params.page_contexts;
    if (params.countries?.length) filters.countries = params.countries;
    if (params.regions?.length) filters.regions = params.regions;
    if (params.counties?.length) filters.counties = params.counties;
    if (params.cities?.length) filters.cities = params.cities;

    const body: Record<string, unknown> = {
      window: params.window,
      group_by: params.group_by,
      order_by: params.order_by,
      order: params.order,
      limit: params.limit,
    };

    if (Object.keys(filters).length > 0) body.filters = filters;
    if (params.bucket) body.bucket = params.bucket;

    const data = await apiPost("/api/v1/signals/query", body);
    return textResult(data);
  },
);

// --- Tool: trending ---
server.tool(
  "signals_trending",
  "Detect which keywords, domains, platforms, or page contexts are growing fastest. " +
    "Compares recent activity to a baseline period to calculate growth percentage. " +
    "Use this to find what's newly trending in content filtering — great for breaking news detection.",
  {
    window: z
      .enum(["24h", "7d", "30d"])
      .default("24h")
      .describe(
        "Analysis window. 24h compares last 6h vs 6-24h ago. " +
          "7d compares last 1d vs 1-7d ago. 30d compares last 7d vs 7-30d ago.",
      ),
    dimension: z
      .enum(["keyword", "domain", "platform", "page_context"])
      .default("keyword")
      .describe("What dimension to find trends in"),
    metric: z
      .enum(["suppressions", "events", "unique_users"])
      .default("suppressions")
      .describe("Which metric to measure growth of"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(50)
      .describe("Maximum number of trending items to return"),
    min_baseline: z
      .number()
      .int()
      .min(1)
      .default(10)
      .describe("Minimum baseline value to include (filters noise from low-activity items)"),
  },
  async ({ window, dimension, metric, limit, min_baseline }) => {
    const data = await apiGet("/api/v1/signals/trending", {
      window,
      dimension,
      metric,
      limit: limit.toString(),
      min_baseline: min_baseline.toString(),
    });
    return textResult(data);
  },
);

// --- Tool: keyword activity ---
server.tool(
  "signals_keyword_activity",
  "Shows which keywords users are adding, removing, or editing in their filter lists. " +
    "Reveals user intent — which topics are gaining or losing interest. " +
    "The net_adds field (adds minus removes) indicates whether a keyword is growing or shrinking in popularity.",
  {
    window: z
      .enum(["1h", "6h", "12h", "24h", "7d", "30d"])
      .default("24h")
      .describe("Time window to aggregate over"),
    type: z
      .enum(["added", "removed", "edited", "all"])
      .default("all")
      .describe("Filter by event type, or 'all' for combined view"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(50)
      .describe("Maximum number of keywords to return"),
  },
  async ({ window, type, limit }) => {
    const data = await apiGet("/api/v1/signals/keyword-activity", {
      window,
      type,
      limit: limit.toString(),
    });
    return textResult(data);
  },
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  if (!API_KEY) {
    console.error(
      "[atfilter-mcp] Warning: ATFILTER_API_KEY is not set. API calls will fail with 401.",
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[atfilter-mcp] Server started on stdio");
}

main().catch((err) => {
  console.error("[atfilter-mcp] Fatal error:", err);
  process.exit(1);
});
