interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NosDéputés.fr MCP — civic-tech mirror of the French Assemblée nationale
 *
 * The official Assemblée open data is XML dumps (data.assemblee-nationale.fr).
 * NosDéputés.fr ingests those dumps and exposes a clean JSON REST layer.
 *
 * Auth: none.
 * Docs: https://www.nosdeputes.fr/api
 */


const DEFAULT_LEGISLATURE = '17';

function legBase(leg?: string) {
  return `https://www.nosdeputes.fr/${leg ?? DEFAULT_LEGISLATURE}`;
}

const tools: McpToolExport['tools'] = [
  {
    name: 'list_deputies',
    description: 'List sitting deputies, optionally filtered by group or département.',
    inputSchema: {
      type: 'object',
      properties: {
        active: { type: 'boolean', description: 'Only currently active (default true)' },
        group: { type: 'string', description: 'Group acronym (e.g. "RE", "LFI-NUPES")' },
        departement: { type: 'string', description: 'Département name or code' },
        legislature: { type: 'string', description: 'Legislature number (default current)' },
      },
    },
  },
  {
    name: 'get_deputy',
    description: 'Deputy profile by slug or numeric id.',
    inputSchema: {
      type: 'object',
      properties: {
        slug_or_id: { type: 'string', description: 'NosDéputés slug or numeric id' },
        legislature: { type: 'string' },
      },
      required: ['slug_or_id'],
    },
  },
  {
    name: 'search_interventions',
    description: 'Full-text search across debate contributions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        deputy_slug: { type: 'string', description: 'Restrict to a specific deputy' },
        date_from: { type: 'string', description: 'YYYY-MM-DD' },
        date_to: { type: 'string', description: 'YYYY-MM-DD' },
        limit: { type: 'number', description: '1-100 (default 25)' },
        legislature: { type: 'string' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_questions',
    description: 'Written or oral questions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        deputy_slug: { type: 'string' },
        type: { type: 'string', description: 'ecrite | orale | au gouvernement' },
        limit: { type: 'number' },
        legislature: { type: 'string' },
      },
    },
  },
  {
    name: 'list_votes',
    description: 'Recent recorded votes.',
    inputSchema: {
      type: 'object',
      properties: {
        deputy_slug: { type: 'string', description: 'Filter to votes cast by a specific deputy' },
        limit: { type: 'number', description: '1-100 (default 25)' },
        legislature: { type: 'string' },
      },
    },
  },
  {
    name: 'list_groups',
    description: 'Political groups in the assembly.',
    inputSchema: {
      type: 'object',
      properties: { legislature: { type: 'string' } },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const base = legBase(args.legislature as string | undefined);
  switch (name) {
    case 'list_deputies': {
      const params = new URLSearchParams();
      if (args.active === false) params.set('actifs', '0');
      if (args.group) params.set('groupe', String(args.group));
      if (args.departement) params.set('departement', String(args.departement));
      return ndFetch(`${base}/deputes/json${params.toString() ? `?${params}` : ''}`);
    }
    case 'get_deputy':
      return ndFetch(`${base}/${encodeURIComponent(reqStr(args, 'slug_or_id', '"jean-louis-bourlanges"'))}/json`);
    case 'search_interventions': {
      const params = new URLSearchParams({
        recherche: reqStr(args, 'query', '"climat"'),
        format: 'json',
        count: String(Math.min(100, Math.max(1, (args.limit as number) ?? 25))),
      });
      if (args.deputy_slug) params.set('parlementaire', String(args.deputy_slug));
      if (args.date_from) params.set('date_min', String(args.date_from));
      if (args.date_to) params.set('date_max', String(args.date_to));
      return ndFetch(`${base}/interventions/json?${params}`);
    }
    case 'search_questions': {
      const params = new URLSearchParams({
        format: 'json',
        count: String(Math.min(100, Math.max(1, (args.limit as number) ?? 25))),
      });
      if (args.query) params.set('recherche', String(args.query));
      if (args.deputy_slug) params.set('parlementaire', String(args.deputy_slug));
      if (args.type) params.set('type', String(args.type));
      return ndFetch(`${base}/questions/json?${params}`);
    }
    case 'list_votes': {
      const params = new URLSearchParams({
        count: String(Math.min(100, Math.max(1, (args.limit as number) ?? 25))),
      });
      if (args.deputy_slug) params.set('parlementaire', String(args.deputy_slug));
      return ndFetch(`${base}/votes/json?${params}`);
    }
    case 'list_groups':
      return ndFetch(`${base}/organismes/groupe/json`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ndFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-nosdeputes-fr/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 404) throw new Error('NosDéputés: not found');
  if (res.status === 429) throw new Error('NosDéputés: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`NosDéputés error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
