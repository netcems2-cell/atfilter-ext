# @Filter MCP Server

MCP (Model Context Protocol) server for the @Filter Signal Engine API. Connect to Claude Desktop, Cursor, VS Code, or any MCP-compatible AI client to query content filtering intelligence using natural language.

## Setup

### 1. Get your API key

Subscribe to the Professional plan at [atfilter.com/portal/pricing](https://atfilter.com/portal/pricing) and copy your API key from the account page.

### 2. Configure your AI client

#### Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "atfilter": {
      "command": "node",
      "args": ["C:/path/to/atfilter/mcp-server/dist/index.js"],
      "env": {
        "ATFILTER_API_KEY": "atf_your_api_key_here"
      }
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "atfilter": {
      "command": "node",
      "args": ["C:/path/to/atfilter/mcp-server/dist/index.js"],
      "env": {
        "ATFILTER_API_KEY": "atf_your_api_key_here"
      }
    }
  }
}
```

#### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "atfilter": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/path/to/atfilter/mcp-server/dist/index.js"],
      "env": {
        "ATFILTER_API_KEY": "atf_your_api_key_here"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|---|---|
| `signals_top_keywords` | Get the most suppressed keywords |
| `signals_keyword_timeseries` | Track a keyword's activity over time |
| `signals_geo_heat` | Geographic distribution of filtering activity |
| `signals_domain_timeseries` | Track a domain's filtering activity over time |
| `signals_query` | Flexible multi-dimension query (filter + group by any combination) |
| `signals_trending` | Detect fastest-growing keywords, domains, platforms |

## Example Prompts

Once connected, you can ask your AI assistant things like:

- "What are the top 20 keywords being filtered right now?"
- "Show me the trend for 'immigration' over the past week"
- "Which domains have the most filtering activity in the US?"
- "What keywords are trending fastest in the last 24 hours?"
- "Compare filtering activity on social media vs news sites in Pennsylvania this month"
- "Show me a breakdown of suppression activity by country and platform for the last 30 days"

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ATFILTER_API_KEY` | Yes | — | Your @Filter API key |
| `ATFILTER_API_URL` | No | `https://atfilter.com` | API base URL (for development) |

## Development

```bash
npm install
npm run build
npm start
```
