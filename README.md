# @pipeworx/nosdeputes-fr

NosDéputés.fr MCP — civic-tech mirror of the French Assemblée nationale. Member activity, votes, debates, attendance. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

Note: this is a community-maintained dataset built from the Assemblée's open data dumps; it's not an official API. The official Assemblée open data publishes XML/JSON files at https://data.assemblee-nationale.fr/ which are awkward to query at the record level — NosDéputés provides REST search on top.

**Upstream reliability:** nosdeputes.fr is a volunteer-run service and has occasional outages (HTTP 522 from their Cloudflare front when the origin is offline). The pack will surface those errors directly; retry later or fall back to the official data dumps.

## Tools

- `list_deputies(active?, group?, departement?)` — deputies (sitting MPs)
- `get_deputy(slug_or_id)` — deputy profile + activity stats
- `search_interventions(query, deputy_slug?, date_from?, date_to?, limit?)` — debate contributions
- `search_questions(query?, deputy_slug?, type?, limit?)` — written + oral questions
- `list_votes(deputy_slug?, limit?)` — recent recorded votes
- `list_groups(legislature?)` — political groups

## Data source

`https://www.nosdeputes.fr/<legislature>/json` — replace `<legislature>` with `17` (current at time of writing) for the active parliament.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "nosdeputes-fr": {
      "url": "https://gateway.pipeworx.io/nosdeputes-fr/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/nosdeputes-fr/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Nosdeputes Fr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/list_deputies \
  -H 'Content-Type: application/json' \
  -d '{"group":"LFI"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/list_deputies`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
