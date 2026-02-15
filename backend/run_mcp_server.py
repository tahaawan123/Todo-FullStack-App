#!/usr/bin/env python3
"""
Entry point to run the MCP server standalone (for testing).
Normally the agent spawns this as a subprocess via MCPServerStdio.
"""
from app.mcp.todo_tools import mcp

if __name__ == "__main__":
    mcp.run()
