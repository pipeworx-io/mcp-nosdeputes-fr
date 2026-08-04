# @pipeworx/nosdeputes-fr

NosDéputés.fr MCP — civic-tech mirror of the French Assemblée nationale. Member activity, votes, debates, attendance. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Nosdeputes Fr data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
