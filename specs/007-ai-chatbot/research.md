# AI Chatbot Integration - Technology Research (2026)

**Date:** 2026-02-10
**Status:** Complete
**Scope:** OpenAI Agents SDK, MCP SDK, and ChatKit integration research for FastAPI backend

---

## Executive Summary

This research covers the 2026 current state of three key technologies for building an AI chatbot integration:

1. **OpenAI Agents SDK (Python)** - For creating AI agents with system prompts and MCP tool integration
2. **MCP SDK (Python)** - For building Model Context Protocol servers with custom tools
3. **OpenAI ChatKit (React)** - For frontend chat UI with Next.js App Router support

All three technologies are actively maintained with recent updates in February 2026, indicating production readiness.

---

## 1. OpenAI Agents SDK (Python)

### Overview
A lightweight, powerful framework for building multi-agent workflows. Provider-agnostic, supporting OpenAI Responses/Chat Completions APIs and 100+ other LLMs.

### Installation
```bash
pip install openai-agents
```

**Requirements:** Python 3.9 or newer
**Latest Version:** 0.8.1 (released Feb 6, 2026)
**PyPI Package:** `openai-agents`

### Core Capabilities

- **Function Tools:** Automatic schema generation with Pydantic validation
- **MCP Server Integration:** Built-in MCP tool calling
- **Sessions:** Persistent memory layer for agent loops
- **Human-in-the-Loop:** Built-in mechanisms for human involvement
- **Tracing:** Visualization, debugging, and monitoring support
- **Realtime Agents:** Voice agent support with interruption detection

### Creating an Agent with System Prompt

```python
from agents import Agent, Runner

# Basic agent with instructions (system prompt)
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant that provides concise answers."
)

# Run the agent
result = await Runner.run(agent, "Write a haiku about recursion")
print(result.final_output)
```

### Synchronous vs Async Execution

```python
# Async (recommended)
result = await Runner.run(agent, "What is the weather?")

# Synchronous wrapper
result = Runner.run_sync(agent, "What is the weather?")

# Streaming
async for event in Runner.run_streamed(agent, "Tell me a story"):
    # Process streaming events
    pass
```

### Conversation History Management

#### Option 1: Manual History (Simple)
```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="Reply concisely."
)

# First interaction
result = await Runner.run(agent, "What is 2+2?")

# Continue conversation - append new input to prior results
new_input = result.to_input_list() + [
    {"role": "user", "content": "What about 3+3?"}
]
result = await Runner.run(agent, new_input)
```

#### Option 2: Session-Based (Automatic)
```python
from agents import Agent, Runner
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main():
    agent = Agent(
        name="Assistant",
        instructions="Reply concisely."
    )

    # Create a conversation
    conversation = await client.conversations.create()
    conv_id = conversation.id

    # Reuse conversation ID for subsequent calls
    # Session automatically retrieves history before each run
    # and stores new messages after each run
```

### Response Object Structure

The `RunResult` object returned by `Runner.run()` contains:

- **`final_output`** (str): The agent's complete response text
- **`interruptions`** (list): Tool call details (agent name, tool name, arguments)
- **`to_input_list()`** (method): Converts result to input format for continuation
- **`to_state()`** (method): For processing interruptions and tool approvals

Example:
```python
result = await Runner.run(agent, "Hello")
print(result.final_output)  # "Hi! How can I help you today?"
```

### Attaching MCP Tools to Agents

The SDK supports multiple MCP transport mechanisms:

#### Stdio Transport (Local Development)
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from pathlib import Path

async with MCPServerStdio(
    name="Filesystem Server",
    params={
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", str(Path.cwd())],
    },
) as server:
    agent = Agent(
        name="Assistant",
        instructions="Use the MCP tools to answer questions.",
        mcp_servers=[server],
    )
    result = await Runner.run(agent, "List available files.")
    print(result.final_output)
```

#### HTTP Transport (Remote/Production)
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

async with MCPServerStreamableHttp(
    name="HTTP MCP Server",
    params={
        "url": "http://localhost:8000/mcp",
        "headers": {"Authorization": f"Bearer {token}"},
        "timeout": 10,
    },
    cache_tools_list=True,
) as server:
    agent = Agent(
        name="Assistant",
        instructions="Use the MCP tools to perform calculations.",
        mcp_servers=[server],
    )
    result = await Runner.run(agent, "Add 7 and 22.")
```

#### Hosted MCP Tools (OpenAI Infrastructure)
```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    tools=[
        HostedMCPTool(
            server_url="https://your-mcp-server.com",
            server_label="my-server"
        )
    ]
)
```

**Note:** `mcp_servers` is a list, so you can connect multiple MCP servers to one agent. The agent aggregates all tools from connected servers.

### Tool Filtering
```python
from agents.mcp import create_static_tool_filter

server = MCPServerStdio(
    params={...},
    tool_filter=create_static_tool_filter(
        allowed_tool_names=["read_file", "write_file"]
    ),
)
```

---

## 2. Official MCP SDK (Python)

### Overview
The official Python SDK for Model Context Protocol servers and clients. Implements the full MCP specification for exposing resources, tools, and prompts to LLM applications.

### Installation
```bash
pip install mcp
```

**Alternative (Pythonic approach):**
```bash
pip install fastmcp
```

**Package:** `mcp` (official) or `fastmcp` (community)
**Latest Version:** 1.7.1 (mcp)

### Core MCP Concepts

MCP servers expose three types of capabilities:

1. **Resources:** File-like data (API responses, file contents)
2. **Tools:** Functions callable by the LLM (with user approval)
3. **Prompts:** Pre-written templates for specific tasks

### Creating an MCP Server with Stdio Transport

#### Standard Approach
```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from pydantic import BaseModel

# Initialize server
server = Server("my-server")

# Define tool input schema
class WeatherInput(BaseModel):
    city: str

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="get_weather",
            description="Get weather for a city",
            inputSchema={
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"}
                },
                "required": ["city"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "get_weather":
        city = arguments["city"]
        # Perform weather lookup
        return [TextContent(
            type="text",
            text=f"Weather in {city}: Sunny, 72°F"
        )]

# Run server with stdio transport
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )
```

#### FastMCP Approach (Simpler)
```python
from fastmcp import FastMCP

mcp = FastMCP("Demo")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool()
def get_weather(city: str) -> str:
    """Get weather for a city"""
    return f"Weather in {city}: Sunny, 72°F"

# Run server
if __name__ == "__main__":
    mcp.run()
```

### Defining Tools with Parameters

Tools can include:
- **Input Schema:** JSON Schema for parameter validation
- **Output Schema:** Structured output validation
- **Descriptions:** Help LLMs understand tool purpose

Example with validation:
```python
from mcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("weather-server")

class WeatherRequest(BaseModel):
    city: str = Field(..., description="City name")
    units: str = Field("celsius", description="Temperature units (celsius/fahrenheit)")

@mcp.tool()
def get_weather(request: WeatherRequest) -> dict:
    """Get current weather for a city"""
    return {
        "city": request.city,
        "temperature": 72,
        "units": request.units,
        "condition": "sunny"
    }
```

### Critical Stdio Logging Rule

**NEVER write to stdout in stdio-based servers** - it corrupts JSON-RPC messages.

```python
# ❌ BAD - Breaks stdio transport
print("Server started")

# ✅ GOOD - Write to stderr
import sys
print("Server started", file=sys.stderr)

# ✅ GOOD - Use logging
import logging
logging.info("Server started")  # Defaults to stderr
```

### Connecting MCP Server to OpenAI Agent

See section 1 above - agents connect to MCP servers via `MCPServerStdio`, `MCPServerStreamableHttp`, or `HostedMCPTool`.

Example integration:
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

# Start your MCP server process
async with MCPServerStdio(
    name="My Tools",
    params={
        "command": "python",
        "args": ["my_mcp_server.py"],
    },
) as server:
    agent = Agent(
        name="Assistant",
        instructions="Use the available tools to help the user.",
        mcp_servers=[server],
    )

    result = await Runner.run(agent, "What tools do you have?")
    print(result.final_output)
```

---

## 3. OpenAI ChatKit (Frontend)

### Overview
ChatKit is OpenAI's batteries-included framework for building AI-powered chat experiences. It provides pre-built UI components, response streaming, file attachments, thread management, and integration with Agent Builder.

### Installation

```bash
npm install @openai/chatkit-react
```

**Package Name:** `@openai/chatkit-react` (React bindings)
**Also Available:** `@openai/chatkit-js` (framework-agnostic)

**Additional Requirement:** Include CDN script tag
```html
<script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async></script>
```

### Next.js App Router Compatibility

**Yes, fully compatible** with Next.js App Router (Next.js 15+).

The component must be marked as a Client Component:
```tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
```

### Basic Chat UI Setup

#### Step 1: Backend Session Endpoint (Required)

ChatKit requires a backend endpoint to generate session tokens:

```python
# FastAPI example
from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

@app.post("/api/chatkit/session")
async def create_chatkit_session():
    session = client.chatkit.sessions.create({
        # Session configuration
    })
    return {"client_secret": session.client_secret}
```

#### Step 2: Frontend Component

```tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // Implement session refresh if needed
          return existing;
        }

        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return (
    <ChatKit
      control={control}
      className="h-[600px] w-[320px]"
    />
  );
}
```

### Message Format

ChatKit uses OpenAI's message format structure. The framework handles:
- **User messages** (input from the chat UI)
- **Assistant messages** (AI responses)
- **Tool calls** (function execution requests)
- **Tool outputs** (function execution results)

The SDK abstracts message management - you typically don't manually construct messages when using ChatKit.

### Loading States

ChatKit provides built-in loading indicators:

1. **Response Streaming:** Automatic typing indicators during AI response generation
2. **Progress Updates:** Long-running tools can stream progress via `ProgressUpdateEvent`
3. **Widget Loading:** Displays loading state when rendering interactive widgets

Example of streaming events:
- `ThreadCreatedEvent`
- `ThreadUpdatedEvent`
- `ThreadItemAddedEvent`
- `ThreadItemUpdated`
- `ProgressUpdateEvent` (for tool progress)
- `ErrorEvent`
- `NoticeEvent`

### Streaming Events

ChatKit uses Server-Sent Events (SSE) for real-time updates:

```typescript
// Backend sends events like:
{
  event: "thread.item.added",
  data: {
    type: "message",
    role: "assistant",
    content: [{ type: "text", text: "Hello!" }]
  }
}
```

### Key Features

- **Deep UI Customization:** Styling and branding options
- **Response Streaming:** Natural conversation flow
- **Tool/Workflow Integration:** Agentic actions support
- **Rich Widgets:** Interactive elements within chat
- **File/Image Upload:** Built-in attachment handling
- **Thread Management:** Conversation persistence
- **Source Annotations:** Citation and entity tagging

### Backend Integration Options

ChatKit can work with:
1. **OpenAI-hosted backend** (workflows from Agent Builder)
2. **Custom backend** (your own infrastructure using ChatKit Python SDK)

For custom backend integration, you control the inference stack and routing logic while ChatKit handles the UI and streaming.

---

## Integration Architecture for Todo App

### Recommended Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ChatKit Component (@openai/chatkit-react)         │ │
│  │  - Handles UI, streaming, file uploads             │ │
│  │  - Manages threads and message display             │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (session tokens)
                       ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI Python)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  OpenAI Agents SDK (openai-agents)                 │ │
│  │  - Agent with system prompt                        │ │
│  │  - Conversation history management (sessions)      │ │
│  │  - MCP server integration                          │ │
│  └──────────────────┬─────────────────────────────────┘ │
│                     │                                    │
│  ┌──────────────────↓─────────────────────────────────┐ │
│  │  MCP Server (mcp or fastmcp)                       │ │
│  │  - Todo CRUD tools (create, read, update, delete)  │ │
│  │  - Database integration (Neon PostgreSQL)          │ │
│  │  - Authentication context (user_id from JWT)       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Implementation Flow

1. **Frontend:** ChatKit component renders chat UI
2. **Session Creation:** ChatKit calls `/api/chatkit/session` to get client token
3. **User Input:** User types message in ChatKit UI
4. **Backend Processing:** FastAPI receives message, passes to OpenAI Agent
5. **Agent Reasoning:** Agent decides if MCP tools are needed
6. **Tool Execution:** Agent calls MCP server tools (e.g., create_todo, list_todos)
7. **Database Operations:** MCP tools interact with Neon PostgreSQL
8. **Response Generation:** Agent formulates natural language response
9. **Streaming Response:** Response streams back to ChatKit UI via SSE
10. **Display:** ChatKit displays assistant response with typing animation

### Example FastAPI Endpoint Structure

```python
from fastapi import FastAPI, Depends
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from openai import OpenAI

app = FastAPI()
client = OpenAI()

# Initialize MCP server with todo tools
async def get_mcp_server():
    return MCPServerStdio(
        name="Todo Tools",
        params={
            "command": "python",
            "args": ["todo_mcp_server.py"],
        },
    )

# Initialize agent
async def get_agent(mcp_server):
    return Agent(
        name="Todo Assistant",
        instructions="""You are a helpful todo management assistant.
        You can help users create, view, update, and delete todos.
        Always confirm actions before executing them.""",
        mcp_servers=[mcp_server],
    )

@app.post("/api/chatkit/session")
async def create_session():
    session = client.chatkit.sessions.create({})
    return {"client_secret": session.client_secret}

@app.post("/api/chat")
async def chat(
    message: str,
    conversation_id: str | None = None,
    agent: Agent = Depends(get_agent)
):
    result = await Runner.run(agent, message)
    return {
        "response": result.final_output,
        "conversation_id": conversation_id  # Return for continuity
    }
```

---

## Key Considerations

### 1. Authentication Flow
- ChatKit handles frontend authentication via session tokens
- Backend must validate JWT tokens from Better Auth
- MCP tools receive user context (user_id) for database operations

### 2. Error Handling
- Agents SDK provides `ErrorEvent` for failures
- MCP tools should return clear error messages
- ChatKit displays errors in the UI automatically

### 3. Performance
- Use streaming (`Runner.run_streamed`) for long responses
- Cache MCP tool lists (`cache_tools_list=True`)
- Implement session management to avoid re-fetching history

### 4. Security
- Never expose database credentials in MCP server configurations
- Validate all tool inputs in MCP server
- Use Better Auth JWT verification in FastAPI middleware

### 5. Testing
- Test MCP server standalone first (use MCP inspector tools)
- Test Agent with MCP server before integrating ChatKit
- Test ChatKit UI with mock backend responses

---

## Code Examples Summary

### 1. Install Dependencies
```bash
# Backend
pip install openai-agents mcp fastapi uvicorn

# Frontend
npm install @openai/chatkit-react
```

### 2. Create MCP Server (todo_mcp_server.py)
```python
from fastmcp import FastMCP

mcp = FastMCP("todo-tools")

@mcp.tool()
def create_todo(title: str, user_id: str) -> dict:
    """Create a new todo item"""
    # Database logic here
    return {"id": "123", "title": title, "completed": False}

@mcp.tool()
def list_todos(user_id: str) -> list[dict]:
    """List all todos for a user"""
    # Database logic here
    return [{"id": "123", "title": "Sample", "completed": False}]

if __name__ == "__main__":
    mcp.run()
```

### 3. Create Agent in FastAPI
```python
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async with MCPServerStdio(
    name="Todo Tools",
    params={"command": "python", "args": ["todo_mcp_server.py"]},
) as server:
    agent = Agent(
        name="Todo Assistant",
        instructions="Help users manage their todos.",
        mcp_servers=[server],
    )

    result = await Runner.run(agent, "Create a todo: Buy groceries")
    print(result.final_output)
```

### 4. Create ChatKit Component (Next.js)
```tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatPage() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

---

## References

### Documentation
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [OpenAI Agents GitHub](https://github.com/openai/openai-agents-python)
- [MCP Python SDK](https://modelcontextprotocol.github.io/python-sdk/)
- [MCP Build Server Guide](https://modelcontextprotocol.io/docs/develop/build-server)
- [ChatKit GitHub](https://github.com/openai/chatkit-js)
- [ChatKit NPM Package](https://www.npmjs.com/package/@openai/chatkit-react)

### Additional Resources
- [Running Agents](https://openai.github.io/openai-agents-python/running_agents/)
- [MCP Server Concepts](https://modelcontextprotocol.io/docs/learn/server-concepts)
- [Building MCP Agents with OpenAI SDK](https://composio.dev/blog/building-mcp-agents-with-openai-agents-sdk)
- [ChatKit Next.js Integration Guide](https://www.buildwithmatija.com/blog/chatkit-nextjs-integration)

### Key Dates
- OpenAI Agents SDK v0.8.1: Feb 6, 2026
- Research conducted: Feb 10, 2026
- All documentation reflects 2026 current best practices

---

## Next Steps

1. ✅ Research complete - all three technologies are production-ready
2. ⬜ Design database schema for conversation history storage
3. ⬜ Implement MCP server with todo CRUD tools
4. ⬜ Build FastAPI endpoints for ChatKit integration
5. ⬜ Create Next.js ChatKit component
6. ⬜ Test end-to-end flow with authentication
