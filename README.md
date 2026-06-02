# mcp-nosdeputes-fr

NosDéputés.fr MCP — civic-tech mirror of the French Assemblée nationale

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_deputies` | List sitting deputies, optionally filtered by group or département. |
| `get_deputy` | Deputy profile by slug or numeric id. |
| `search_interventions` | Full-text search across debate contributions. |
| `search_questions` | Written or oral questions. |
| `list_votes` | Recent recorded votes. |
| `list_groups` | Political groups in the assembly. |

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

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
