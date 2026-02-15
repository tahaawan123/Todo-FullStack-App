"""
Todo AI Agent using Google Gemini 2.5 Flash with MCP Tools

Uses the google-genai SDK with the MCP client (stdio transport)
to spawn the MCP tool server as a subprocess and bridge tool calls.
"""

import os
import sys
import logging
from typing import Tuple, List

from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

logger = logging.getLogger(__name__)

# Resolve paths for the MCP subprocess
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MCP_SCRIPT = os.path.join(BACKEND_DIR, "app", "mcp", "todo_tools.py")

SYSTEM_PROMPT = """You are a friendly and concise AI assistant for managing todo tasks.

RULES:
- For task operations (add, list, complete, delete, update), use the available tools.
- Always pass user_id "{user_id}" to every tool call.
- For greetings and non-task questions, respond directly without using tools.
- When multiple operations are requested in one message, call tools sequentially and combine results into one response.
- Always confirm what actions you took.
- Be concise but helpful."""

MAX_TOOL_ROUNDS = 10


def _mcp_tools_to_gemini(mcp_tools) -> list:
    """Convert MCP tool definitions to Gemini FunctionDeclaration list."""
    type_map = {
        "string": "STRING",
        "integer": "INTEGER",
        "number": "NUMBER",
        "boolean": "BOOLEAN",
    }
    declarations = []
    for tool in mcp_tools:
        schema = tool.inputSchema or {}
        properties = {}
        for name, prop_schema in schema.get("properties", {}).items():
            gemini_type = type_map.get(prop_schema.get("type", "string"), "STRING")
            properties[name] = types.Schema(
                type=gemini_type,
                description=prop_schema.get("description", ""),
            )
        declarations.append(
            types.FunctionDeclaration(
                name=tool.name,
                description=tool.description or "",
                parameters=types.Schema(
                    type="OBJECT",
                    properties=properties,
                    required=schema.get("required", []),
                ),
            )
        )
    return declarations


async def run_agent(user_id: str, input_messages: list) -> Tuple[str, List[str]]:
    """
    Run the Todo Assistant agent with MCP tools via Gemini.

    Args:
        user_id: The authenticated user's ID (injected into system prompt)
        input_messages: List of message dicts [{"role": "user"|"assistant", "content": "..."}]

    Returns:
        Tuple of (response_text, list_of_tool_names_called)
    """
    env = dict(os.environ)
    env["PYTHONPATH"] = BACKEND_DIR

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[MCP_SCRIPT],
        env=env,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as mcp_session:
            await mcp_session.initialize()

            # Discover MCP tools and convert to Gemini format
            tools_result = await mcp_session.list_tools()
            func_declarations = _mcp_tools_to_gemini(tools_result.tools)
            gemini_tools = [types.Tool(function_declarations=func_declarations)]

            # Build Gemini client
            client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

            # Build contents from conversation history
            contents = []
            for msg in input_messages:
                role = "user" if msg["role"] == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])],
                    )
                )

            tool_calls_made: List[str] = []

            for _ in range(MAX_TOOL_ROUNDS):
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT.format(user_id=user_id),
                        tools=gemini_tools,
                        temperature=0.7,
                    ),
                )

                candidate = response.candidates[0]

                # Collect any function calls from the response
                function_calls = [
                    p.function_call
                    for p in candidate.content.parts
                    if p.function_call
                ]

                if not function_calls:
                    # Final text response — return it
                    text_parts = [
                        p.text for p in candidate.content.parts if p.text
                    ]
                    return "\n".join(text_parts), tool_calls_made

                # Append the model's response (with function_call parts)
                contents.append(candidate.content)

                # Execute each function call via MCP and build response parts
                response_parts = []
                for fc in function_calls:
                    tool_calls_made.append(fc.name)
                    args = dict(fc.args) if fc.args else {}
                    mcp_result = await mcp_session.call_tool(fc.name, args)

                    result_text = "".join(
                        item.text
                        for item in mcp_result.content
                        if hasattr(item, "text")
                    )
                    response_parts.append(
                        types.Part.from_function_response(
                            name=fc.name,
                            response={"result": result_text},
                        )
                    )

                contents.append(
                    types.Content(role="user", parts=response_parts)
                )

            return (
                "I processed your request but reached the maximum number of steps.",
                tool_calls_made,
            )
