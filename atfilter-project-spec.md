# @Filter — Project Specification
### atfilter.com | Browser Extension | MCP API Server
**Version:** 1.0  
**Date:** February 10, 2026  
**Domain:** atfilter.com

---

## 1. Project Overview

@Filter is a three-component product ecosystem:

1. **Browser Extension** — A free content filtering tool that removes Trump-related media content from websites using universal HTML pattern detection. Distributed via Chrome Web Store (and potentially other browser stores). Collects anonymized telemetry for aggregation.

2. **Website (atfilter.com)** — The public-facing brand hub. Displays the "@" brand mark prominently, a real-time global map of usage/donations, download links, donation flow, and general product information.

3. **MCP API Server** — A paid, professional-tier API that exposes aggregated, anonymized data collected from the extension's telemetry. Targeted at consultants, data aggregators, politicians, media analysts, and business leadership. No free tier.

---

## 2. Branding

- **Name:** @Filter (displayed as the "@" symbol in branding contexts)
- **Primary Brand Element:** A large "@" symbol, centered on the homepage, positioned above the global map. This is the logo, the identity, and the focal point.
- **Logo Spec:** "@" in Constantia Bold, RGB(255, 140, 0) — #FF8C00
- **Domain:** atfilter.com
- **Tone:** Clean, minimal, data-forward. Not overtly political — positioned as a "media wellness" / "content control" tool.
- **Color Palette:**
  - **Primary Orange:** #FF8C00 / RGB(255, 140, 0) — logo, CTAs, active data points on map, counters
  - **Light Orange:** #FFB347 — hover states, secondary highlights, warm accents
  - **Dark Orange:** #CC7000 — pressed states, borders, emphasis
  - **Dark Grey (background):** #1A1A1A — primary background, map background
  - **Medium Grey:** #3A3A3A — cards, panels, secondary surfaces
  - **Light Grey:** #B0B0B0 — body text, secondary labels, subtle borders
  - **White:** #FFFFFF — headings, primary text, the "@" glow effect
  - **Map heat scale:** Light Orange (#FFB347) → Primary Orange (#FF8C00) → Dark Orange (#CC7000) → Red (#FF3300) for intensity progression

---

## 3. Component 1: Browser Extension

### 3.1 Core Functionality (Already Developed)
- Universal content filtering using HTML structural pattern detection (~10 common layout patterns)
- Keyword-based filtering of Trump-related content
- Works across all websites without site-specific hardcoding
- Removes articles, cards, video thumbnails, headlines, and feed items matching filter criteria
- Version number displayed in extension UI

### 3.2 New: Telemetry Module
The extension must collect and transmit anonymized usage data to the @Filter backend. All telemetry is aggregated — no personally identifiable information (PII) is ever collected or transmitted.

**Data points to collect per session/interval:**

| Data Point | Description | Frequency |
|---|---|---|
| `filter_hit_count` | Number of content blocks removed | Per session, batched |
| `site_domain` | Domain where filtering occurred (e.g., cnn.com, youtube.com) | Per hit |
| `keyword_triggered` | Which filter keyword(s) matched | Per hit |
| `pattern_type` | Which HTML pattern was matched (article tag, CSS grid, YT element, etc.) | Per hit |
| `timestamp` | UTC timestamp of filtering event | Per hit |
| `geo_country` | Country code (derived from IP on server side) | Per session |
| `geo_region` | State/province (derived from IP on server side) | Per session |
| `geo_city` | City name (USA: city + county via MaxMind/IP2Location; outside USA: city-level best effort) | Per session |
| `geo_county_fips` | USA only: county FIPS code for precise county-level mapping | Per session |
| `geo_lat_lng` | Approximate lat/lng centroid of city (NOT user's actual location — city-center approximation only) | Per session |
| `session_duration` | How long the extension was active | Per session |
| `extension_version` | Version of the extension | Per session |
| `browser_type` | Chrome, Firefox, Edge, etc. | Per session |

**Telemetry rules:**
- **Opt-in with notice** — on first install, a clear notice explains what anonymized data is collected and why. User must actively opt in to enable telemetry. Extension works fully without telemetry enabled.
- All data is anonymized before storage — no user IDs, no IP storage, no cookies
- Telemetry is batched and sent at intervals (e.g., every 5 minutes or on session end), not per-event
- Users must be informed of telemetry in the privacy policy and extension description
- Telemetry payload is lightweight JSON, POST to backend API endpoint
- Graceful failure — if telemetry fails to send, it is silently dropped (not queued indefinitely)
- User can toggle telemetry off at any time in the extension settings

### 3.3 Extension UI Updates
- Add a small "@" icon as the extension icon/badge
- Show a running count of items filtered in the current session (badge or popup)
- Link to atfilter.com from the extension popup
- Donation link accessible from extension popup

---

## 4. Component 2: Website (atfilter.com)

### 4.1 Page Structure

The website is a single-page application (SPA) or a minimal multi-page site with the following sections:

#### 4.1.1 Hero / Landing Section
- **Centered "@" symbol** — large, bold, unmistakable. This is the first thing visitors see. It should dominate the viewport above the fold.
- Minimal tagline beneath: e.g., "Filter your feed." or "Take control of your media."
- Subtle scroll indicator or CTA to explore below

#### 4.1.2 Global Map Section — "Magic Wall" Style
- Directly below the "@" — a real-time interactive world map
- **John King "Magic Wall" zoom-to-drill-down behavior:**
  - **Default view:** World map showing country-level heatmap / dot clusters
  - **Zoom level 1 (country):** Click or zoom into a country → shows state/province-level breakdown
  - **Zoom level 2 (state — USA):** Click or zoom into a US state → shows county-level breakdown with county boundary lines
  - **Zoom level 3 (county/city — USA):** Click or zoom into a county → shows city-level dots and detailed stats
  - **Outside USA:** Zoom resolves to state/province or city level (best effort based on available geo data)
  - Smooth animated fly-to transitions between zoom levels
  - Data density and labels increase as you zoom — sparse at world view, rich at county/city view
- Displays at each zoom level:
  - **Donation origins** — animated dots/pulses showing where donations come from
  - **Active user distribution** — heatmap or dot density showing active filtering
  - **Download distribution** — where the extension has been installed
  - **Filtering intensity** — color-coded by volume (cool to hot) at the visible geographic level
- **Contextual stats panel** (side panel or overlay, updates dynamically as you zoom/pan):
  - Stats for the currently visible region (e.g., "Harris County, TX: 1,240 active users, 38K blocks filtered today")
  - Comparison to state/national/global averages
  - Top domains being filtered in this region
- Global stats bar (always visible regardless of zoom):
  - Total downloads (animated counter)
  - Total donations (dollar amount + count)
  - Active users (daily/weekly)
  - Content blocks filtered (cumulative counter, animated)
- **USA county boundaries:** US Census Bureau TIGER/Line shapefiles or TopoJSON for county outlines
- **Map library:** Mapbox GL JS (recommended — supports vector tiles, smooth zoom, custom data layers, county/city boundaries, fly-to animations, choropleth fills, and handles the drill-down UX natively)
- Dark theme with bright accent data points — visually striking at all zoom levels

#### 4.1.3 Download Section
- Prominent download button(s) for each supported browser
- Chrome Web Store link (primary)
- Firefox Add-ons link (if applicable)
- Edge Add-ons link (if applicable)
- Brief description of what the extension does

#### 4.1.4 API / Data Access Section
- Brief description of the MCP API offering
- Target audience callout: "Built for analysts, consultants, and decision-makers"
- **Full API documentation** — publicly viewable with endpoint descriptions, parameters, and example responses so customers can evaluate before purchasing
- Feature highlights (classification, trend analytics, geographic data, streaming)
- "Contact Us" CTA — leads to email contact for pricing discussions
- Pricing handled on a per-customer basis until demand justifies public tiers

#### 4.1.5 About / FAQ Section
- What is @Filter?
- How does it work?
- Is my data private? (Yes — all telemetry is anonymized and aggregated)
- Who uses the data API?
- How do I get support?

#### 4.1.6 Footer
- Links: Privacy Policy, Terms of Service, Contact, API Docs
- Social links (if applicable)
- "Built with purpose" or similar sign-off

### 4.2 Technical Requirements — Website
- **Frontend:** React or Next.js (for SSR/SEO benefits)
- **Map:** Mapbox GL JS — vector tiles, smooth zoom, fly-to animations, county boundary layers, choropleth support. Requires Mapbox API key (free tier supports 50K map loads/month)
- **USA County Data:** US Census Bureau TIGER/Line shapefiles converted to TopoJSON for county boundary overlays
- **Hosting:** Vercel (optimized for Next.js — instant deploys, automatic SSL, global CDN, edge rendering)
- **Real-time updates:** WebSocket or SSE connection for live map data (downloads pulsing in, counters ticking up)
- **Responsive:** Must work well on mobile — the "@" and map should scale gracefully
- **Performance:** Map must load fast, data can lazy-load / stream in
- **Analytics:** Basic site analytics (privacy-respecting, e.g., Plausible or Fathom)

---

## 5. Component 3: MCP API Server

### 5.1 Overview
A paid API service exposing aggregated, anonymized data from the @Filter extension telemetry. Accessed by professional customers via API keys. No free tier. All data is statistical/aggregated — never individual user data.

### 5.2 Data Catalog

#### 5.2.1 Downloads & Installs
| Endpoint | Description |
|---|---|
| `GET /data/downloads/total` | Total cumulative download count |
| `GET /data/downloads/timeseries` | Downloads over time (daily, weekly, monthly) |
| `GET /data/downloads/geo` | Downloads by geography. Supports `level` param: `country`, `state`, `county` (USA), `city`. Default: `country`. USA data resolves to county/city; international resolves to state/city best-effort |
| `GET /data/downloads/browser` | Downloads by browser type |

#### 5.2.2 Filtering Activity
| Endpoint | Description |
|---|---|
| `GET /data/filtering/volume` | Total content blocks filtered (cumulative + timeseries) |
| `GET /data/filtering/by-site` | Filtering activity broken down by domain (top sites) |
| `GET /data/filtering/by-keyword` | Which keywords trigger most filtering |
| `GET /data/filtering/by-pattern` | Which HTML patterns are most common |
| `GET /data/filtering/by-platform` | Aggregated by platform category (news, social, video) |
| `GET /data/filtering/velocity` | Rate of filtering activity over time (content velocity) |
| `GET /data/filtering/geo` | Filtering activity by geography. Supports `level` param: `country`, `state`, `county` (USA), `city` |
| `GET /data/filtering/time-of-day` | Filtering patterns by hour/day-of-week |

#### 5.2.3 Active Users
| Endpoint | Description |
|---|---|
| `GET /data/users/active` | Daily/weekly/monthly active user counts |
| `GET /data/users/geo` | Active user distribution by geography. Supports `level` param: `country`, `state`, `county` (USA), `city` |
| `GET /data/users/retention` | Install retention / churn over time |
| `GET /data/users/sessions` | Average session duration and frequency |

#### 5.2.4 Derived / Computed Intelligence
| Endpoint | Description |
|---|---|
| `GET /data/intelligence/sentiment-intensity` | Sentiment intensity score — higher = more media saturation |
| `GET /data/intelligence/event-correlation` | Filtering spikes mapped to real-world events (annotated) |
| `GET /data/intelligence/regional-comparison` | Compare filtering intensity across regions. USA: state-to-state or county-to-county. Supports `level` param. E.g., compare all counties in a swing state |
| `GET /data/intelligence/platform-concentration` | Which platforms dominate Trump content over time |
| `GET /data/intelligence/trend-forecast` | Projected trends based on historical patterns |
| `GET /data/intelligence/new-domains` | Newly discovered domains surfacing filtered content |

#### 5.2.5 Common Query Parameters
All timeseries endpoints support:
- `start_date` / `end_date` — date range filter
- `granularity` — `hourly`, `daily`, `weekly`, `monthly`
- `region` — filter by country, state, county (FIPS code), or city
- `geo_level` — `country`, `state`, `county`, `city` (controls aggregation level; county/city primarily USA)
- `format` — `json` (default), `csv`

### 5.3 Pricing Model

Target customers are professionals who are not price-sensitive. Pricing should reflect the uniqueness and exclusivity of the data.

**Launch Model:** Contact-based pricing. No public tiers at launch — pricing is discussed per customer via email. This allows calibration based on early demand before committing to fixed tiers.

**Notes:**
- Pricing tiers (Analyst / Professional / Enterprise) may be introduced once demand patterns are established
- Corporate licensing is a future consideration if adoption grows
- All access requires API key authentication
- **No free tier, no trial** — comprehensive API documentation with example responses provided so customers can evaluate the data before purchasing
- API docs are publicly accessible; data access requires paid key

### 5.4 Technical Architecture — MCP Server

```
┌─────────────────────────────────────────────────────┐
│                   API Consumers                      │
│         (Consultants, Analysts, Media, etc.)         │
│                 Authenticated via API Key             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│              MCP API Server (Node.js)                │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Auth & Rate  │  │ Query    │  │ Response      │  │
│  │ Limiting     │  │ Engine   │  │ Formatter     │  │
│  └─────────────┘  └──────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Aggregation & Compute Layer             │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Pre-computed  │  │ Real-time  │  │ Intelligence│  │
│  │ Aggregates   │  │ Rollups    │  │ Engine      │  │
│  └──────────────┘  └────────────┘  └────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                   Data Store                         │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ PostgreSQL   │  │ Redis      │  │ TimescaleDB │  │
│  │ (core data)  │  │ (cache +   │  │ (timeseries)│  │
│  │              │  │  real-time) │  │             │  │
│  └──────────────┘  └────────────┘  └────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▲
                       │
┌─────────────────────────────────────────────────────┐
│              Telemetry Ingestion Service             │
│  ┌──────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ POST /ingest │  │ Validation │  │ Geo Lookup  │  │
│  │ endpoint     │  │ & Cleaning │  │ (IP→City/County via MaxMind)│  │
│  └──────────────┘  └────────────┘  └────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▲
                       │ HTTPS POST (batched JSON)
┌─────────────────────────────────────────────────────┐
│              Browser Extensions (Worldwide)          │
│  Anonymized telemetry: filter hits, domains,         │
│  keywords, patterns, session data                    │
└─────────────────────────────────────────────────────┘
```

### 5.5 Authentication & Security
- API keys issued per customer, tied to their tier
- Rate limiting enforced per tier (see pricing table)
- HTTPS only
- API keys rotatable, revocable
- Usage logging for billing and abuse detection
- No PII ever exposed through any endpoint

---

## 6. Backend Infrastructure (Shared)

The website and API server share a common backend:

### 6.0 Hosting Architecture

**Split approach: Vercel (frontend) + AWS (backend)**

**Vercel — Website (atfilter.com)**
- Hosts the Next.js frontend
- Automatic SSL, global CDN, edge rendering
- Push-to-deploy from Git — instant previews and rollbacks
- Handles the "@" hero, global map, download/donation pages
- Connects to AWS backend via HTTPS API calls for live data (map, counters)

**AWS — Backend (telemetry, databases, MCP API server)**
- **EC2 or ECS (Fargate):** Telemetry ingestion service and MCP API server (Node.js)
- **RDS (PostgreSQL):** Core relational data — donations, downloads, API keys, customers
- **TimescaleDB on EC2 (or Amazon Timestream):** High-volume timeseries data — filter events, sessions
- **ElastiCache (Redis):** Caching layer for pre-computed aggregates, real-time counters, rate limiting
- **API Gateway:** Optional — sits in front of the MCP API for throttling, key validation, and usage metering
- **CloudWatch:** Monitoring, alerting, logging across all services
- **S3:** Backup storage, data exports for enterprise customers

**Networking:**
- Vercel frontend calls AWS backend endpoints over HTTPS
- Extension telemetry POSTs directly to AWS ingestion endpoint
- MCP API customers connect directly to AWS API endpoint
- All inter-service communication within AWS VPC

### 6.1 Telemetry Ingestion
- **Endpoint:** `POST /api/ingest`
- Receives batched JSON payloads from extensions
- Validates, cleans, and geo-tags using MaxMind GeoIP2 City database:
  - USA: resolves to city + county (FIPS code) + state + lat/lng centroid
  - International: resolves to city + state/province + country (best effort)
  - IP address is used ONLY for geo resolution, then immediately discarded — never stored
- Writes to timeseries database

### 6.2 Database Schema (High-Level)

**Table: `filter_events`** (timeseries — high volume)
- `timestamp` (UTC)
- `geo_country` (country code)
- `geo_region` (state/province)
- `geo_city` (city name)
- `geo_county` (USA only: county name)
- `geo_county_fips` (USA only: 5-digit FIPS code for county boundary mapping)
- `geo_lat` (approximate city-center latitude — NOT user's actual location)
- `geo_lng` (approximate city-center longitude)
- `site_domain` (e.g., cnn.com)
- `keyword` (which keyword matched)
- `pattern_type` (which HTML pattern)
- `platform_category` (news / social / video / other)
- `extension_version`
- `browser_type`

**Table: `sessions`** (timeseries — moderate volume)
- `timestamp` (session start, UTC)
- `geo_country`
- `geo_region`
- `geo_city`
- `geo_county` (USA only)
- `geo_county_fips` (USA only)
- `duration_seconds`
- `filter_hit_count`
- `extension_version`
- `browser_type`

**Table: `donations`**
- `timestamp`
- `amount_usd`
- `geo_country`
- `payment_method`
- (no donor PII stored — payment processor handles that)

**Table: `downloads`**
- `timestamp`
- `geo_country` (if available from store API)
- `browser_store` (chrome / firefox / edge)

**Table: `api_keys`**
- `key_hash`
- `customer_id`
- `tier`
- `created_at`
- `is_active`
- `rate_limit`
- `calls_this_month`

### 6.3 Pre-Computed Aggregates
To keep API responses fast, run scheduled jobs to pre-compute:
- Hourly / daily / weekly / monthly rollups for all timeseries data
- Geographic rollups at each level: country → state → county (USA) → city
- USA county-level FIPS-indexed aggregates (for fast map rendering)
- Top-N domains, keywords, patterns (global and per-region)
- Derived intelligence scores
- Privacy threshold checks — suppress or roll up under-threshold geo data

---

## 7. Privacy & Compliance

- **No PII collection** — the extension does not collect usernames, emails, browsing history, or any identifying information
- **IP addresses** are used only for geo-tagging (city/county resolution via MaxMind GeoIP2) on the server, then immediately discarded — never stored or logged
- **Aggregation thresholds** — to prevent de-anonymization:
  - City-level data: only exposed if ≥ 25 active users in that city
  - County-level data: only exposed if ≥ 10 active users in that county
  - Below threshold: data is rolled up to the next geographic level (city → county → state)
  - API responses include a flag indicating when data has been rolled up for privacy
- **Privacy policy** must be clearly accessible on atfilter.com and in the extension store listing
- **GDPR / CCPA considerations** — since no PII is stored, compliance burden is minimal, but privacy policy should explicitly state this
- **API customers** receive only aggregated statistical data — never individual-level data

---

## 8. Development Phases

### Phase 1: Foundation
- [ ] Purchase atfilter.com domain
- [ ] Set up Vercel project linked to Git repo
- [ ] Set up AWS infrastructure (EC2/ECS, RDS, TimescaleDB, Redis, networking)
- [ ] Build website with "@" branding, hero section, and static content
- [ ] Build telemetry ingestion endpoint on AWS
- [ ] Add telemetry module to browser extension
- [ ] Deploy donation flow (Stripe integration)

### Phase 2: Live Data
- [ ] Build global map visualization with real-time data
- [ ] Connect live download/donation counters
- [ ] Build aggregation pipeline (scheduled rollups)
- [ ] Test telemetry at scale

### Phase 3: API Launch
- [ ] Build MCP API server with all endpoints
- [ ] Implement API key management and tier-based rate limiting
- [ ] Build public API documentation page with example responses
- [ ] Integrate Stripe for API key purchase (select tier → pay → receive key immediately)
- [ ] Build API key management dashboard for customers (usage stats, key rotation)
- [ ] Launch API — open to all paying customers

### Phase 4: Intelligence Layer
- [ ] Build derived intelligence endpoints (sentiment, event correlation, forecasting)
- [ ] Implement trend detection and anomaly alerts
- [ ] **Event annotation — Phase A (no AI):**
  - Spike detection via statistical analysis (current volume vs. rolling 7-day baseline, flag at 2x+ threshold)
  - When spike detected, auto-pull headlines from news API (NewsAPI.org, GDELT, or Google News RSS) for same time window, filtered by extension keyword list
  - Attach matching headlines as spike annotations — covers ~80-90% of cases
  - Runs as scheduled backend job (e.g., every 15 minutes)
- [ ] **Event annotation — Phase B (light AI, future upgrade):**
  - When spike + headlines are matched, pass through Claude API to generate clean one-line summary annotation (e.g., "Spike correlated with federal indictment coverage across 47 major outlets")
  - Minimal API cost — only called on spike events, not continuously
  - Enriches the `/data/intelligence/event-correlation` endpoint for premium API customers

### Phase 5: Scale & Iterate
- [ ] Performance optimization for high-volume telemetry
- [ ] Expand to additional browsers (Firefox, Edge, Safari)
- [ ] Calibrate pricing based on customer feedback
- [ ] Explore additional data products or custom reports

---

## 9. Decisions Log

| # | Question | Decision |
|---|---|---|
| 1 | Color palette and visual design | Grey/orange palette. Dark grey backgrounds, light/medium/dark grey surfaces and text. Orange accent: #FF8C00. Logo: "@" in Constantia Bold, RGB(255,140,0) |
| 2 | Map library | Mapbox GL JS |
| 3 | Hosting provider | Split: Vercel (frontend) + AWS (backend) |
| 4 | Payment processor | Stripe. Primary audience: North American |
| 5 | Telemetry consent model | Opt-in with notice on first install. Toggle off anytime in settings |
| 6 | API trial policy | No trial. Full API docs with example responses publicly available for evaluation |
| 7 | Event annotation approach | Automated. Phase A: statistical spike detection + news API headline matching (no AI). Phase B: add Claude API for polished one-line summary annotations on spike events |
| 8 | API launch model | Open to all — anyone who pays gets immediate access via Stripe checkout |

---

*This specification is a living document. Calibrate and update as development progresses.*
