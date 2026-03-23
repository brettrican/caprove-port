# Repository: shaneholloman/mcp-knowledge-graph
## Branch: main

## File: .aim/memory-project-work.jsonl
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/.aim/memory-project-work.jsonl

```jsonl
{"type":"_aim","source":"mcp-knowledge-graph"}
{"type":"entity","name":"Project_Feature_A","entityType":"feature","observations":["Part of local project","Stored in .aim/memory-project-work.jsonl","Isolated from global contexts"]}
```
---


## File: .aim/memory.jsonl
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/.aim/memory.jsonl

```jsonl
{"type":"_aim","source":"mcp-knowledge-graph"}
{"type":"entity","name":"Local_Project_Entity","entityType":"project_test","observations":["Created in .aim directory","Should be project-local","Testing project detection"]}
{"type":"entity","name":"NPM_Publication_Test","entityType":"milestone","observations":["Successfully published version 1.2.0","Updated Claude config to use npx","All database functionality working perfectly"]}
```
---


## File: .claude/settings.local.json
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/.claude/settings.local.json

```json
{
  "permissions": {
    "allow": [
      "Bash(rm:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)"
    ],
    "deny": [],
    "ask": []
  }
}
```
---


## File: .gitignore
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/.gitignore

```gitignore
# Build output
dist/
build/
*.tsbuildinfo

# Dependencies
node_modules/
.npm
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Testing
coverage/
.nyc_output/

# IDEs and editors
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
*.swp
*.swo
.DS_Store
.env
.env.local
.env.*.local

# TypeScript cache
*.tsbuildinfo

# Optional eslint cache
.eslintcache

# Memory files (except examples)
*.jsonl
!example*.jsonl

# Local documentation
PUBLISHING.md
VERSION_UPDATE.md

# History files
.history/

# Package files
*.tgz

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

```
---


## File: LICENSE
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/LICENSE

```license
# MIT License

Copyright (c) 2025 Shane Holloman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```
---


## File: README.md
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/README.md

```md
# MCP Knowledge Graph

**Persistent memory for AI models through a local knowledge graph.**

Store and retrieve information across conversations using entities, relations, and observations. Works with Claude Code/Desktop and any MCP-compatible AI platform.

## Why ".aim" and "aim_" prefixes?

AIM stands for **AI Memory** - the core concept of this system. The three AIM elements provide clear organization and safety:

- **`.aim` directories**: Keep AI memory files organized and easily identifiable
- **`aim_` tool prefixes**: Group related memory functions together in multi-tool setups
- **`_aim` safety markers**: Each memory file starts with `{"type":"_aim","source":"mcp-knowledge-graph"}` to prevent accidental overwrites of unrelated JSONL files

This consistent AIM naming makes it obvious which directories, tools, and files belong to the AI memory system.

## CRITICAL: Understanding `.aim` dir vs `_aim` file marker

**Two different things with similar names:**

- `.aim` = **Project-local directory name** (MUST be named exactly `.aim` for project detection to work)
- `_aim` = **File safety marker** (appears inside JSONL files: `{"type":"_aim","source":"mcp-knowledge-graph"}`)

**For project-local storage:**

- Directory MUST be named `.aim` in your project root
- Example: `my-project/.aim/memory.jsonl`
- The system specifically looks for this exact name

**For global storage (--memory-path):**

- Can be ANY directory you want
- Examples: `~/yourusername/.aim/`, `~/memories/`, `~/Dropbox/ai-memory/`, `~/Documents/ai-data/`
- Complete flexibility - choose whatever location works for you

## Storage Logic

**File Location Priority:**

1. **Project with `.aim`** - Uses `.aim/memory.jsonl` (project-local)
2. **No project/no .aim** - Uses configured global directory
3. **Contexts** - Adds suffix: `memory-work.jsonl`, `memory-personal.jsonl`

**Safety System:**

- Every memory file starts with `{"type":"_aim","source":"mcp-knowledge-graph"}`
- System refuses to write to files without this marker
- Prevents accidental overwrite of unrelated JSONL files

## Master Database Concept

**The master database is your primary memory store** - used by default when no specific database is requested. It's always named `default` in listings and stored as `memory.jsonl`.

- **Default Behavior**: All memory operations use the master database unless you specify a different one
- **Always Available**: Exists in both project-local and global locations
- **Primary Storage**: Your main knowledge graph that persists across all conversations
- **Named Databases**: Optional additional databases (`work`, `personal`, `health`) for organizing specific topics

## Key Features

- **Master Database**: Primary memory store used by default for all operations
- **Multiple Databases**: Optional named databases for organizing memories by topic
- **Project Detection**: Automatic project-local memory using `.aim` directories
- **Location Override**: Force operations to use project or global storage
- **Safe Operations**: Built-in protection against overwriting unrelated files
- **Database Discovery**: List all available databases in both locations

## Quick Start

### Global Memory (Recommended)

Add to your `claude_desktop_config.json` or `.claude.json`. Two common approaches:

**Option 1: Default `.aim` directory (simple)**

```json
{
  "mcpServers": {
    "Aim-Memory-Bank": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/Users/yourusername/.aim"
      ]
    }
  }
}
```

**Option 2: Dropbox/cloud sync (portable)**

For accessing memories across multiple machines, use a synced folder. This is how the author of this MCP server keeps his own memories:

```json
{
  "mcpServers": {
    "Aim-Memory-Bank": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/Users/yourusername/Dropbox/ai-memory"
      ]
    }
  }
}
```

This creates memory files in your specified directory:

- `memory.jsonl` - **Master Database** (default for all operations)
- `memory-work.jsonl` - Work database
- `memory-personal.jsonl` - Personal database
- etc.

### Project-Local Memory

In any project, create a `.aim` directory:

```bash
mkdir .aim
```

Now memory tools automatically use `.aim/memory.jsonl` (project-local **master database**) instead of global storage when run from this project.

## How AI Uses Databases

Once configured, AI models use the **master database by default** or can specify named databases with a `context` parameter. New databases are created automatically - no setup required:

```json
// Master Database (default - no context needed)
aim_memory_store({
  entities: [{
    name: "John_Doe",
    entityType: "person",
    observations: ["Met at conference"]
  }]
})

// Work database
aim_memory_store({
  context: "work",
  entities: [{
    name: "Q4_Project",
    entityType: "project",
    observations: ["Due December 2024"]
  }]
})

// Personal database
aim_memory_store({
  context: "personal",
  entities: [{
    name: "Mom",
    entityType: "person",
    observations: ["Birthday March 15th"]
  }]
})

// Master database in specific location
aim_memory_store({
  location: "global",
  entities: [{
    name: "Important_Info",
    entityType: "reference",
    observations: ["Stored in global master database"]
  }]
})
```

## File Organization

**Global Setup:**

```tree
/Users/yourusername/.aim/
├── memory.jsonl           # Master Database (default)
├── memory-work.jsonl      # Work database
├── memory-personal.jsonl  # Personal database
└── memory-health.jsonl    # Health database
```

**Project Setup:**

```tree
my-project/
├── .aim/
│   ├── memory.jsonl       # Project Master Database (default)
│   └── memory-work.jsonl  # Project Work database
└── src/
```

## Available Tools

- `aim_memory_store` - Store new memories (people, projects, concepts)
- `aim_memory_add_facts` - Add facts to existing memories
- `aim_memory_link` - Link two memories together
- `aim_memory_search` - Search memories by keyword
- `aim_memory_get` - Retrieve specific memories by exact name
- `aim_memory_read_all` - Read all memories in a database
- `aim_memory_list_stores` - List available databases
- `aim_memory_forget` - Forget memories
- `aim_memory_remove_facts` - Remove specific facts from a memory
- `aim_memory_unlink` - Remove links between memories

### Parameters

- `context` (optional) - Specify named database (`work`, `personal`, etc.). Defaults to **master database**
- `location` (optional) - Force `project` or `global` storage location. Defaults to auto-detection

## Database Discovery

Use `aim_memory_list_stores` to see all available databases:

```json
{
  "project_databases": [
    "default",      // Master Database (project-local)
    "project-work"  // Named database
  ],
  "global_databases": [
    "default",      // Master Database (global)
    "work",
    "personal",
    "health"
  ],
  "current_location": "project (.aim directory detected)"
}
```

**Key Points:**

- **"default"** = Master Database in both locations
- **Current location** shows whether you're using project or global storage
- **Master database exists everywhere** - it's your primary memory store
- **Named databases** are optional additions for specific topics

## Configuration Examples

**Important:** Always specify `--memory-path` to control where your memory files are stored.

**Auto-approve read operations (recommended):**

```json
{
  "mcpServers": {
    "Aim-Memory-Bank": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/Users/yourusername/.aim"
      ],
      "autoapprove": [
        "aim_memory_search",
        "aim_memory_get",
        "aim_memory_read_all",
        "aim_memory_list_stores"
      ]
    }
  }
}
```

## Troubleshooting

**"File does not contain required _aim safety marker" error:**

- The file may not belong to this system
- Manual JSONL files need `{"type":"_aim","source":"mcp-knowledge-graph"}` as first line
- If you created the file manually, add the `_aim` marker or delete and let the system recreate it

**Memories going to unexpected locations:**

- Check if you're in a project directory with `.aim` folder (uses project-local storage)
- Otherwise uses the configured global `--memory-path` directory
- Use `aim_memory_list_stores` to see all available databases and current location
- Use `ls .aim/` or `ls /Users/yourusername/.aim/` to see your memory files

**Too many similar databases:**

- AI models try to use consistent names, but may create variations
- Manually delete unwanted database files if needed
- Encourage AI to use simple, consistent database names
- **Remember**: Master database is always available as the default - named databases are optional

## Requirements

- Node.js 18+
- MCP-compatible AI platform

## License

MIT

```
---


## File: example.jsonl
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/example.jsonl

```jsonl
{"type":"_aim","source":"mcp-knowledge-graph"}
{"type":"entity","name":"Alice_Smith","entityType":"person","observations":["Works as a software engineer","Lives in San Francisco","Speaks Mandarin fluently"]}
{"type":"entity","name":"ML_Project_X","entityType":"project","observations":["Started in 2023","Focus on natural language processing","Currently in development phase"]}
{"type":"entity","name":"TechCorp","entityType":"organization","observations":["Founded in 2010","Specializes in AI development","Headquartered in San Francisco"]}
{"type":"relation","from":"Alice_Smith","to":"ML_Project_X","relationType":"leads"}
{"type":"relation","from":"Alice_Smith","to":"TechCorp","relationType":"works_at"}
{"type":"relation","from":"TechCorp","to":"ML_Project_X","relationType":"owns"}
```
---


## File: img/read-function.png
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/img/read-function.png

Content skipped: Image file
---


## File: img/server-name.png
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/img/server-name.png

Content skipped: Image file
---


## File: index.ts
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/index.ts

```ts
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import minimist from 'minimist';
import { isAbsolute } from 'path';

// Read version from package.json - single source of truth
// Path is '../package.json' because compiled code runs from dist/
const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string; name: string };

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));
let memoryPath = argv['memory-path'];

// If a custom path is provided, ensure it's absolute
if (memoryPath && !isAbsolute(memoryPath)) {
    memoryPath = path.resolve(process.cwd(), memoryPath);
}

// Define the base directory for memory files
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Handle memory path - could be a file or directory
let baseMemoryPath: string;
if (memoryPath) {
  // If memory-path points to a .jsonl file, use its directory as the base
  if (memoryPath.endsWith('.jsonl')) {
    baseMemoryPath = path.dirname(memoryPath);
  } else {
    // Otherwise treat it as a directory
    baseMemoryPath = memoryPath;
  }
} else {
  baseMemoryPath = __dirname;
}

// Simple marker to identify our files - prevents writing to unrelated JSONL files
const FILE_MARKER = {
  type: "_aim",
  source: "mcp-knowledge-graph"
};

// Project detection - look for common project markers
// .aim is checked first: if it exists, that's an explicit signal for project-local storage
function findProjectRoot(startDir: string = process.cwd()): string | null {
  const projectMarkers = ['.aim', '.git', 'package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod'];
  let currentDir = startDir;
  const maxDepth = 5;

  for (let i = 0; i < maxDepth; i++) {
    // Check for project markers
    for (const marker of projectMarkers) {
      if (existsSync(path.join(currentDir, marker))) {
        return currentDir;
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root directory
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

// Function to get memory file path based on context and optional location override
function getMemoryFilePath(context?: string, location?: 'project' | 'global'): string {
  const filename = context ? `memory-${context}.jsonl` : 'memory.jsonl';
  
  // If location is explicitly specified, use it
  if (location === 'global') {
    return path.join(baseMemoryPath, filename);
  }
  
  if (location === 'project') {
    const projectRoot = findProjectRoot();
    if (projectRoot) {
      const aimDir = path.join(projectRoot, '.aim');
      return path.join(aimDir, filename); // Will create .aim if it doesn't exist
    } else {
      throw new Error('No project detected - cannot use project location');
    }
  }
  
  // Auto-detect logic (existing behavior)
  const projectRoot = findProjectRoot();
  if (projectRoot) {
    const aimDir = path.join(projectRoot, '.aim');
    if (existsSync(aimDir)) {
      return path.join(aimDir, filename);
    }
  }
  
  // Fallback to configured base directory
  return path.join(baseMemoryPath, filename);
}

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
  name: string;
  entityType: string;
  observations: string[];
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// Format a knowledge graph as human-readable text
function formatGraphPretty(graph: KnowledgeGraph, context?: string): string {
  const lines: string[] = [];
  const dbName = context || 'default';

  lines.push(`=== ${dbName} database ===`);
  lines.push('');

  // Entities section
  if (graph.entities.length === 0) {
    lines.push('ENTITIES: (none)');
  } else {
    lines.push(`ENTITIES (${graph.entities.length}):`);
    for (const entity of graph.entities) {
      lines.push(`  ${entity.name} [${entity.entityType}]`);
      for (const obs of entity.observations) {
        lines.push(`    - ${obs}`);
      }
    }
  }

  lines.push('');

  // Relations section
  if (graph.relations.length === 0) {
    lines.push('RELATIONS: (none)');
  } else {
    lines.push(`RELATIONS (${graph.relations.length}):`);
    for (const rel of graph.relations) {
      lines.push(`  ${rel.from} --${rel.relationType}--> ${rel.to}`);
    }
  }

  return lines.join('\n');
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
  private async loadGraph(context?: string, location?: 'project' | 'global'): Promise<KnowledgeGraph> {
    const filePath = getMemoryFilePath(context, location);
    
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      
      if (lines.length === 0) {
        return { entities: [], relations: [] };
      }
      
      // Check first line for our file marker
      const firstLine = JSON.parse(lines[0]!);
      if (firstLine.type !== "_aim" || firstLine.source !== "mcp-knowledge-graph") {
        throw new Error(`File ${filePath} does not contain required _aim safety marker. This file may not belong to the knowledge graph system. Expected first line: {"type":"_aim","source":"mcp-knowledge-graph"}`);
      }
      
      // Process remaining lines (skip metadata)
      return lines.slice(1).reduce((graph: KnowledgeGraph, line) => {
        const item = JSON.parse(line);
        if (item.type === "entity") graph.entities.push(item as Entity);
        if (item.type === "relation") graph.relations.push(item as Relation);
        return graph;
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        // File doesn't exist - we'll create it with metadata on first save
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph, context?: string, location?: 'project' | 'global'): Promise<void> {
    const filePath = getMemoryFilePath(context, location);
    
    // Write our simple file marker
    
    const lines = [
      JSON.stringify(FILE_MARKER),
      ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
      ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
    ];
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    await fs.writeFile(filePath, lines.join("\n"));
  }

  async createEntities(entities: Entity[], context?: string, location?: 'project' | 'global'): Promise<Entity[]> {
    const graph = await this.loadGraph(context, location);
    const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
    graph.entities.push(...newEntities);
    await this.saveGraph(graph, context, location);
    return newEntities;
  }

  async createRelations(relations: Relation[], context?: string, location?: 'project' | 'global'): Promise<Relation[]> {
    const graph = await this.loadGraph(context, location);
    const newRelations = relations.filter(r => !graph.relations.some(existingRelation =>
      existingRelation.from === r.from &&
      existingRelation.to === r.to &&
      existingRelation.relationType === r.relationType
    ));
    graph.relations.push(...newRelations);
    await this.saveGraph(graph, context, location);
    return newRelations;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[], context?: string, location?: 'project' | 'global'): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph(context, location);
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph, context, location);
    return results;
  }

  async deleteEntities(entityNames: string[], context?: string, location?: 'project' | 'global'): Promise<void> {
    const graph = await this.loadGraph(context, location);
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
    await this.saveGraph(graph, context, location);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[], context?: string, location?: 'project' | 'global'): Promise<void> {
    const graph = await this.loadGraph(context, location);
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph, context, location);
  }

  async deleteRelations(relations: Relation[], context?: string, location?: 'project' | 'global'): Promise<void> {
    const graph = await this.loadGraph(context, location);
    graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
      r.from === delRelation.from &&
      r.to === delRelation.to &&
      r.relationType === delRelation.relationType
    ));
    await this.saveGraph(graph, context, location);
  }

  async readGraph(context?: string, location?: 'project' | 'global'): Promise<KnowledgeGraph> {
    return this.loadGraph(context, location);
  }

  // Very basic search function
  async searchNodes(query: string, context?: string, location?: 'project' | 'global'): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph(context, location);

    // Filter entities
    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async openNodes(names: string[], context?: string, location?: 'project' | 'global'): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph(context, location);

    // Filter entities
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async listDatabases(): Promise<{ project_databases: string[], global_databases: string[], current_location: string }> {
    const result = {
      project_databases: [] as string[],
      global_databases: [] as string[],
      current_location: ""
    };

    // Check project-local .aim directory
    const projectRoot = findProjectRoot();
    if (projectRoot) {
      const aimDir = path.join(projectRoot, '.aim');
      if (existsSync(aimDir)) {
        result.current_location = "project (.aim directory detected)";
        try {
          const files = await fs.readdir(aimDir);
          result.project_databases = files
            .filter(file => file.endsWith('.jsonl'))
            .map(file => file === 'memory.jsonl' ? 'default' : file.replace('memory-', '').replace('.jsonl', ''))
            .sort();
        } catch (error) {
          // Directory exists but can't read - ignore
        }
      } else {
        result.current_location = "global (no .aim directory in project)";
      }
    } else {
      result.current_location = "global (no project detected)";
    }

    // Check global directory
    try {
      const files = await fs.readdir(baseMemoryPath);
      result.global_databases = files
        .filter(file => file.endsWith('.jsonl'))
        .map(file => file === 'memory.jsonl' ? 'default' : file.replace('memory-', '').replace('.jsonl', ''))
        .sort();
    } catch (error) {
      // Directory doesn't exist or can't read
      result.global_databases = [];
    }

    return result;
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();


// The server instance and tools exposed to AI models
const server = new Server({
  name: pkg.name,
  version: pkg.version,
}, {
  capabilities: {
    tools: {},
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "aim_memory_store",
        description: `Store new memories. Use this to remember people, projects, concepts, or any information worth persisting.

AIM (AI Memory) provides persistent memory for AI assistants. The 'aim_memory_' prefix groups all memory tools together.

WHAT'S STORED: Memories have a name, type (person/project/concept/etc.), and observations (facts about them).

DATABASES: Use the 'context' parameter to organize memories into separate graphs:
- Leave blank: Uses the master database (default for general information)
- Any name: Creates/uses a named database ('work', 'personal', 'health', 'research', etc.)
- New databases are created automatically - no setup required
- IMPORTANT: Use consistent, simple names - prefer 'work' over 'work-stuff'

STORAGE LOCATIONS: Files are stored as JSONL (e.g., memory.jsonl, memory-work.jsonl):
- Project-local: .aim directory in project root (auto-detected if exists)
- Global: User's configured --memory-path directory
- Use 'location' parameter to override: 'project' or 'global'

RETURNS: Array of created entities.

EXAMPLES:
- Master database (default): aim_memory_store({entities: [{name: "John", entityType: "person", observations: ["Met at conference"]}]})
- Work database: aim_memory_store({context: "work", entities: [{name: "Q4_Project", entityType: "project", observations: ["Due December 2024"]}]})
- Master database in global location: aim_memory_store({location: "global", entities: [{name: "John", entityType: "person", observations: ["Met at conference"]}]})
- Work database in project location: aim_memory_store({context: "work", location: "project", entities: [{name: "Q4_Project", entityType: "project", observations: ["Due December 2024"]}]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Defaults to master database if not specified. Use any descriptive name ('work', 'personal', 'health', 'basket-weaving', etc.) - new contexts created automatically."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the entity" },
                  entityType: { type: "string", description: "The type of the entity" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents associated with the entity"
                  },
                },
                required: ["name", "entityType", "observations"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "aim_memory_link",
        description: `Link two memories together with a relationship. Use this to connect related information.

RELATION STRUCTURE: Each link has 'from' (subject), 'relationType' (verb), and 'to' (object).
- Use active voice verbs: "manages", "works_at", "knows", "attended", "created"
- Read as: "from relationType to" (e.g., "Alice manages Q4_Project")
- Avoid passive: use "manages" not "is_managed_by"

IMPORTANT: Both 'from' and 'to' entities must already exist in the same database.

RETURNS: Array of created relations (duplicates are ignored).

DATABASE: Relations are created in the specified 'context' database, or master database if not specified.

EXAMPLES:
- aim_memory_link({relations: [{from: "John", to: "TechConf2024", relationType: "attended"}]})
- aim_memory_link({context: "work", relations: [{from: "Alice", to: "Q4_Project", relationType: "manages"}]})
- Multiple: aim_memory_link({relations: [{from: "John", to: "Alice", relationType: "knows"}, {from: "John", to: "Acme_Corp", relationType: "works_at"}]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Relations will be created in the specified context's knowledge graph."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "aim_memory_add_facts",
        description: `Add new facts to an existing memory. Use this to append information to something already stored.

IMPORTANT: Memory must already exist - use aim_memory_store first. Throws error if not found.

RETURNS: Array of {entityName, addedObservations} showing what was added (duplicates are ignored).

DATABASE: Adds to entities in the specified 'context' database, or master database if not specified.

EXAMPLES:
- aim_memory_add_facts({observations: [{entityName: "John", contents: ["Lives in Seattle", "Works in tech"]}]})
- aim_memory_add_facts({context: "work", observations: [{entityName: "Q4_Project", contents: ["Behind schedule", "Need more resources"]}]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Observations will be added to entities in the specified context's knowledge graph."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity to add the observations to" },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  },
                },
                required: ["entityName", "contents"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "aim_memory_forget",
        description: `Forget memories. Removes memories and their associated links.

DATABASE SELECTION: Entities are deleted from the specified database's knowledge graph.

LOCATION OVERRIDE: Use the 'location' parameter to force deletion from 'project' (.aim directory) or 'global' (configured directory). Leave blank for auto-detection.

EXAMPLES:
- Master database (default): aim_memory_forget({entityNames: ["OldProject"]})
- Work database: aim_memory_forget({context: "work", entityNames: ["CompletedTask", "CancelledMeeting"]})
- Master database in global location: aim_memory_forget({location: "global", entityNames: ["OldProject"]})
- Personal database in project location: aim_memory_forget({context: "personal", location: "project", entityNames: ["ExpiredReminder"]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Entities will be deleted from the specified context's knowledge graph."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            },
          },
          required: ["entityNames"],
        },
      },
      {
        name: "aim_memory_remove_facts",
        description: `Remove specific facts from a memory. Keeps the memory but removes selected observations.

DATABASE SELECTION: Observations are deleted from entities within the specified database's knowledge graph.

LOCATION OVERRIDE: Use the 'location' parameter to force deletion from 'project' (.aim directory) or 'global' (configured directory). Leave blank for auto-detection.

EXAMPLES:
- Master database (default): aim_memory_remove_facts({deletions: [{entityName: "John", observations: ["Outdated info"]}]})
- Work database: aim_memory_remove_facts({context: "work", deletions: [{entityName: "Project", observations: ["Old deadline"]}]})
- Master database in global location: aim_memory_remove_facts({location: "global", deletions: [{entityName: "John", observations: ["Outdated info"]}]})
- Health database in project location: aim_memory_remove_facts({context: "health", location: "project", deletions: [{entityName: "Exercise", observations: ["Injured knee"]}]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Observations will be deleted from entities in the specified context's knowledge graph."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity containing the observations" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  },
                },
                required: ["entityName", "observations"],
              },
            },
          },
          required: ["deletions"],
        },
      },
      {
        name: "aim_memory_unlink",
        description: `Remove links between memories. Keeps the memories but removes their connections.

DATABASE SELECTION: Relations are deleted from the specified database's knowledge graph.

LOCATION OVERRIDE: Use the 'location' parameter to force deletion from 'project' (.aim directory) or 'global' (configured directory). Leave blank for auto-detection.

EXAMPLES:
- Master database (default): aim_memory_unlink({relations: [{from: "John", to: "OldCompany", relationType: "worked_at"}]})
- Work database: aim_memory_unlink({context: "work", relations: [{from: "Alice", to: "CancelledProject", relationType: "manages"}]})
- Master database in global location: aim_memory_unlink({location: "global", relations: [{from: "John", to: "OldCompany", relationType: "worked_at"}]})
- Personal database in project location: aim_memory_unlink({context: "personal", location: "project", relations: [{from: "Me", to: "OldHobby", relationType: "enjoys"}]})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Relations will be deleted from the specified context's knowledge graph."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' forces project-local .aim directory, 'global' forces global directory. If not specified, uses automatic detection."
            },
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
              description: "An array of relations to delete"
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "aim_memory_read_all",
        description: `Read all memories in a database. Returns every stored memory and their links.

FORMAT OPTIONS:
- "json" (default): Structured JSON for programmatic use
- "pretty": Human-readable text format

DATABASE: Reads from the specified 'context' database, or master database if not specified.

EXAMPLES:
- aim_memory_read_all({}) - JSON format
- aim_memory_read_all({format: "pretty"}) - Human-readable
- aim_memory_read_all({context: "work", format: "pretty"}) - Work database, pretty`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Reads from the specified context's knowledge graph or master database if not specified."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' for .aim directory, 'global' for configured directory."
            },
            format: {
              type: "string",
              enum: ["json", "pretty"],
              description: "Output format. 'json' (default) for structured data, 'pretty' for human-readable text."
            }
          },
        },
      },
      {
        name: "aim_memory_search",
        description: `Search memories by keyword. Use this when you don't know the exact name of what you're looking for.

WHAT IT SEARCHES: Matches query (case-insensitive) against:
- Memory names (e.g., "John" matches "John_Smith")
- Memory types (e.g., "person" matches all person memories)
- Facts/observations (e.g., "Seattle" matches memories mentioning Seattle)

VS aim_memory_get: Use aim_memory_search for fuzzy matching. Use aim_memory_get when you know exact names.

FORMAT OPTIONS:
- "json" (default): Structured JSON for programmatic use
- "pretty": Human-readable text format

EXAMPLES:
- aim_memory_search({query: "John"}) - JSON format
- aim_memory_search({query: "project", format: "pretty"}) - Human-readable
- aim_memory_search({context: "work", query: "Shane", format: "pretty"})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional database name. Searches within this database or master database if not specified."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' for .aim directory, 'global' for configured directory."
            },
            query: { type: "string", description: "Search text to match against entity names, entity types, and observation content (case-insensitive)" },
            format: {
              type: "string",
              enum: ["json", "pretty"],
              description: "Output format. 'json' (default) for structured data, 'pretty' for human-readable text."
            }
          },
          required: ["query"],
        },
      },
      {
        name: "aim_memory_get",
        description: `Retrieve specific memories by exact name. Use this when you know exactly what you're looking for.

VS aim_memory_search: Use aim_memory_get for exact name lookup. Use aim_memory_search for fuzzy matching or when you don't know exact names.

RETURNS: Requested entities and relations between them. Non-existent names are silently ignored.

FORMAT OPTIONS:
- "json" (default): Structured JSON for programmatic use
- "pretty": Human-readable text format

EXAMPLES:
- aim_memory_get({names: ["John", "TechConf2024"]}) - JSON format
- aim_memory_get({names: ["Shane"], format: "pretty"}) - Human-readable
- aim_memory_get({context: "work", names: ["Q4_Project"], format: "pretty"})`,
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Optional memory context. Retrieves entities from the specified context's knowledge graph or master database if not specified."
            },
            location: {
              type: "string",
              enum: ["project", "global"],
              description: "Optional storage location override. 'project' for .aim directory, 'global' for configured directory."
            },
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve",
            },
            format: {
              type: "string",
              enum: ["json", "pretty"],
              description: "Output format. 'json' (default) for structured data, 'pretty' for human-readable text."
            }
          },
          required: ["names"],
        },
      },
      {
        name: "aim_memory_list_stores",
        description: `List all available memory databases and show current storage location.

DATABASE TYPES:
- "default": The master database (memory.jsonl) - used when no context is specified
- Named databases: Created via context parameter (e.g., "work" -> memory-work.jsonl)

RETURNS: {project_databases: [...], global_databases: [...], current_location: "..."}
- project_databases: Databases in .aim directory (if project detected)
- global_databases: Databases in global --memory-path directory
- current_location: Where operations will default to

Use this to discover what databases exist before querying them.

EXAMPLES:
- aim_memory_list_stores() - Shows all available databases and current storage location`,
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "aim_memory_store":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities as Entity[], args.context as string, args.location as 'project' | 'global'), null, 2) }] };
    case "aim_memory_link":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations as Relation[], args.context as string, args.location as 'project' | 'global'), null, 2) }] };
    case "aim_memory_add_facts":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[], args.context as string, args.location as 'project' | 'global'), null, 2) }] };
    case "aim_memory_forget":
      await knowledgeGraphManager.deleteEntities(args.entityNames as string[], args.context as string, args.location as 'project' | 'global');
      return { content: [{ type: "text", text: "Entities deleted successfully" }] };
    case "aim_memory_remove_facts":
      await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[], args.context as string, args.location as 'project' | 'global');
      return { content: [{ type: "text", text: "Observations deleted successfully" }] };
    case "aim_memory_unlink":
      await knowledgeGraphManager.deleteRelations(args.relations as Relation[], args.context as string, args.location as 'project' | 'global');
      return { content: [{ type: "text", text: "Relations deleted successfully" }] };
    case "aim_memory_read_all": {
      const graph = await knowledgeGraphManager.readGraph(args.context as string, args.location as 'project' | 'global');
      const output = args.format === 'pretty'
        ? formatGraphPretty(graph, args.context as string)
        : JSON.stringify(graph, null, 2);
      return { content: [{ type: "text", text: output }] };
    }
    case "aim_memory_search": {
      const graph = await knowledgeGraphManager.searchNodes(args.query as string, args.context as string, args.location as 'project' | 'global');
      const output = args.format === 'pretty'
        ? formatGraphPretty(graph, args.context as string)
        : JSON.stringify(graph, null, 2);
      return { content: [{ type: "text", text: output }] };
    }
    case "aim_memory_get": {
      const graph = await knowledgeGraphManager.openNodes(args.names as string[], args.context as string, args.location as 'project' | 'global');
      const output = args.format === 'pretty'
        ? formatGraphPretty(graph, args.context as string)
        : JSON.stringify(graph, null, 2);
      return { content: [{ type: "text", text: output }] };
    }
    case "aim_memory_list_stores":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.listDatabases(), null, 2) }] };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Knowledge Graph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

```
---


## File: package.json
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/package.json

```json
{
  "name": "mcp-knowledge-graph",
  "version": "1.3.2",
  "description": "MCP server enabling persistent memory for AI models through a local knowledge graph",
  "license": "MIT",
  "author": "Shane Holloman",
  "homepage": "https://github.com/shaneholloman/mcp-knowledge-graph",
  "bugs": "https://github.com/shaneholloman/mcp-knowledge-graph/issues",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "bin": {
    "mcp-knowledge-graph": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && shx chmod +x dist/*.js",
    "prepare": "npm run build",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.0.1",
    "minimist": "^1.2.8"
  },
  "devDependencies": {
    "@types/minimist": "^1.2.5",
    "@types/node": "^22.9.3",
    "shx": "^0.3.4",
    "typescript": "^5.6.2"
  }
}
```
---


## File: pnpm-lock.yaml
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/pnpm-lock.yaml

```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:

  .:
    dependencies:
      '@modelcontextprotocol/sdk':
        specifier: 1.0.1
        version: 1.0.1
      minimist:
        specifier: ^1.2.8
        version: 1.2.8
    devDependencies:
      '@types/minimist':
        specifier: ^1.2.5
        version: 1.2.5
      '@types/node':
        specifier: ^22.9.3
        version: 22.19.3
      shx:
        specifier: ^0.3.4
        version: 0.3.4
      typescript:
        specifier: ^5.6.2
        version: 5.9.3

packages:

  '@modelcontextprotocol/sdk@1.0.1':
    resolution: {integrity: sha512-slLdFaxQJ9AlRg+hw28iiTtGvShAOgOKXcD0F91nUcRYiOMuS9ZBYjcdNZRXW9G5JQ511GRTdUy1zQVZDpJ+4w==}

  '@types/minimist@1.2.5':
    resolution: {integrity: sha512-hov8bUuiLiyFPGyFPE1lwWhmzYbirOXQNNo40+y3zow8aFVTeyn3VWL0VFFfdNddA8S4Vf0Tc062rzyNr7Paag==}

  '@types/node@22.19.3':
    resolution: {integrity: sha512-1N9SBnWYOJTrNZCdh/yJE+t910Y128BoyY+zBLWhL3r0TYzlTmFdXrPwHL9DyFZmlEXNQQolTZh3KHV31QDhyA==}

  balanced-match@1.0.2:
    resolution: {integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==}

  brace-expansion@1.1.12:
    resolution: {integrity: sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==}

  bytes@3.1.2:
    resolution: {integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==}
    engines: {node: '>= 0.8'}

  concat-map@0.0.1:
    resolution: {integrity: sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==}

  content-type@1.0.5:
    resolution: {integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==}
    engines: {node: '>= 0.6'}

  depd@2.0.0:
    resolution: {integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==}
    engines: {node: '>= 0.8'}

  fs.realpath@1.0.0:
    resolution: {integrity: sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==}

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  glob@7.2.3:
    resolution: {integrity: sha512-nFR0zLpU2YCaRxwoCJvL6UvCH2JFyFVIvwTLsIf21AuHlMskA1hhTdk+LlYJtOlYt9v6dvszD2BGRqBL+iQK9Q==}
    deprecated: Glob versions prior to v9 are no longer supported

  hasown@2.0.2:
    resolution: {integrity: sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==}
    engines: {node: '>= 0.4'}

  http-errors@2.0.1:
    resolution: {integrity: sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==}
    engines: {node: '>= 0.8'}

  iconv-lite@0.7.1:
    resolution: {integrity: sha512-2Tth85cXwGFHfvRgZWszZSvdo+0Xsqmw8k8ZwxScfcBneNUraK+dxRxRm24nszx80Y0TVio8kKLt5sLE7ZCLlw==}
    engines: {node: '>=0.10.0'}

  inflight@1.0.6:
    resolution: {integrity: sha512-k92I/b08q4wvFscXCLvqfsHCrjrF7yiXsQuIVvVE7N82W3+aqpzuUdBbfhWcy/FZR3/4IgflMgKLOsvPDrGCJA==}
    deprecated: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.

  inherits@2.0.4:
    resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  interpret@1.4.0:
    resolution: {integrity: sha512-agE4QfB2Lkp9uICn7BAqoscw4SZP9kTE2hxiFI3jBPmXJfdqiahTbUuKGsMoN2GtqL9AxhYioAcVvgsb1HvRbA==}
    engines: {node: '>= 0.10'}

  is-core-module@2.16.1:
    resolution: {integrity: sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==}
    engines: {node: '>= 0.4'}

  minimatch@3.1.2:
    resolution: {integrity: sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==}

  minimist@1.2.8:
    resolution: {integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==}

  once@1.4.0:
    resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}

  path-is-absolute@1.0.1:
    resolution: {integrity: sha512-AVbw3UJ2e9bq64vSaS9Am0fje1Pa8pbGqTTsmXfaIiMpnr5DlDhfJOuLj9Sf95ZPVDAUerDfEk88MPmPe7UCQg==}
    engines: {node: '>=0.10.0'}

  path-parse@1.0.7:
    resolution: {integrity: sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==}

  raw-body@3.0.2:
    resolution: {integrity: sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==}
    engines: {node: '>= 0.10'}

  rechoir@0.6.2:
    resolution: {integrity: sha512-HFM8rkZ+i3zrV+4LQjwQ0W+ez98pApMGM3HUrN04j3CqzPOzl9nmP15Y8YXNm8QHGv/eacOVEjqhmWpkRV0NAw==}
    engines: {node: '>= 0.10'}

  resolve@1.22.11:
    resolution: {integrity: sha512-RfqAvLnMl313r7c9oclB1HhUEAezcpLjz95wFH4LVuhk9JF/r22qmVP9AMmOU4vMX7Q8pN8jwNg/CSpdFnMjTQ==}
    engines: {node: '>= 0.4'}
    hasBin: true

  safer-buffer@2.1.2:
    resolution: {integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==}

  setprototypeof@1.2.0:
    resolution: {integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==}

  shelljs@0.8.5:
    resolution: {integrity: sha512-TiwcRcrkhHvbrZbnRcFYMLl30Dfov3HKqzp5tO5b4pt6G/SezKcYhmDg15zXVBswHmctSAQKznqNW2LO5tTDow==}
    engines: {node: '>=4'}
    hasBin: true

  shx@0.3.4:
    resolution: {integrity: sha512-N6A9MLVqjxZYcVn8hLmtneQWIJtp8IKzMP4eMnx+nqkvXoqinUPCbUFLp2UcWTEIUONhlk0ewxr/jaVGlc+J+g==}
    engines: {node: '>=6'}
    hasBin: true

  statuses@2.0.2:
    resolution: {integrity: sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==}
    engines: {node: '>= 0.8'}

  supports-preserve-symlinks-flag@1.0.0:
    resolution: {integrity: sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==}
    engines: {node: '>= 0.4'}

  toidentifier@1.0.1:
    resolution: {integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==}
    engines: {node: '>=0.6'}

  typescript@5.9.3:
    resolution: {integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==}
    engines: {node: '>=14.17'}
    hasBin: true

  undici-types@6.21.0:
    resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}

  unpipe@1.0.0:
    resolution: {integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==}
    engines: {node: '>= 0.8'}

  wrappy@1.0.2:
    resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

  zod@3.25.76:
    resolution: {integrity: sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==}

snapshots:

  '@modelcontextprotocol/sdk@1.0.1':
    dependencies:
      content-type: 1.0.5
      raw-body: 3.0.2
      zod: 3.25.76

  '@types/minimist@1.2.5': {}

  '@types/node@22.19.3':
    dependencies:
      undici-types: 6.21.0

  balanced-match@1.0.2: {}

  brace-expansion@1.1.12:
    dependencies:
      balanced-match: 1.0.2
      concat-map: 0.0.1

  bytes@3.1.2: {}

  concat-map@0.0.1: {}

  content-type@1.0.5: {}

  depd@2.0.0: {}

  fs.realpath@1.0.0: {}

  function-bind@1.1.2: {}

  glob@7.2.3:
    dependencies:
      fs.realpath: 1.0.0
      inflight: 1.0.6
      inherits: 2.0.4
      minimatch: 3.1.2
      once: 1.4.0
      path-is-absolute: 1.0.1

  hasown@2.0.2:
    dependencies:
      function-bind: 1.1.2

  http-errors@2.0.1:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.2
      toidentifier: 1.0.1

  iconv-lite@0.7.1:
    dependencies:
      safer-buffer: 2.1.2

  inflight@1.0.6:
    dependencies:
      once: 1.4.0
      wrappy: 1.0.2

  inherits@2.0.4: {}

  interpret@1.4.0: {}

  is-core-module@2.16.1:
    dependencies:
      hasown: 2.0.2

  minimatch@3.1.2:
    dependencies:
      brace-expansion: 1.1.12

  minimist@1.2.8: {}

  once@1.4.0:
    dependencies:
      wrappy: 1.0.2

  path-is-absolute@1.0.1: {}

  path-parse@1.0.7: {}

  raw-body@3.0.2:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.1
      iconv-lite: 0.7.1
      unpipe: 1.0.0

  rechoir@0.6.2:
    dependencies:
      resolve: 1.22.11

  resolve@1.22.11:
    dependencies:
      is-core-module: 2.16.1
      path-parse: 1.0.7
      supports-preserve-symlinks-flag: 1.0.0

  safer-buffer@2.1.2: {}

  setprototypeof@1.2.0: {}

  shelljs@0.8.5:
    dependencies:
      glob: 7.2.3
      interpret: 1.4.0
      rechoir: 0.6.2

  shx@0.3.4:
    dependencies:
      minimist: 1.2.8
      shelljs: 0.8.5

  statuses@2.0.2: {}

  supports-preserve-symlinks-flag@1.0.0: {}

  toidentifier@1.0.1: {}

  typescript@5.9.3: {}

  undici-types@6.21.0: {}

  unpipe@1.0.0: {}

  wrappy@1.0.2: {}

  zod@3.25.76: {}

```
---


## File: tsconfig.json
### URL: https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/tsconfig.json

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "allowJs": true,
    "checkJs": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": [
    "./**/*.ts"
  ]
}
```
---


# Crawl Statistics

- **Source:** https://github.com/shaneholloman/mcp-knowledge-graph/blob/main/README.md
- **Repository:** shaneholloman/mcp-knowledge-graph
- **Branch:** main
- **Depth:** 3
- **Files processed:** 13
- **Total files found:** 13
- **Duration:** 2.92 seconds
- **Crawl completed:** 3/15/2026, 8:15:54 PM

