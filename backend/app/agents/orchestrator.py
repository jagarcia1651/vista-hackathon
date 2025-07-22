from strands import Agent

from .profitability import profitability_agent
from .quotes import quotes_agent

MAIN_SYSTEM_PROMPT = """
You are an assistant that routes queries to specialized agents:
- For queries related to quotes → Use the quotes_agent tool

Always select the most appropriate tool based on the user's query.
"""

orchestrator = Agent(
    name="orchestrator",
    system_prompt=MAIN_SYSTEM_PROMPT,
    callback_handler=None,
    tools=[quotes_agent, profitability_agent],
)


async def run(query: str):
    agent_stream = orchestrator.stream_async(query)
    seen_tool_ids = set()  # Track tool calls to avoid duplicates

    async for event in agent_stream:
        # Filter and format chunks for UI consumption
        filtered_chunk = filter_chunk(event, seen_tool_ids)
        if filtered_chunk:
            yield filtered_chunk


def filter_chunk(chunk, seen_tool_ids):
    """Filter chunks to only send relevant information to the UI"""
    # 1. Text deltas
    if "data" in chunk:
        return {"type": "text", "content": chunk["data"]}

    # 3. Agent stops processing (final result)
    if "result" in chunk:
        print(chunk)
        return {"type": "agent_stop"}

    # 4. Tool calls (only send once per tool)
    if "current_tool_use" in chunk:
        tool_use = chunk["current_tool_use"]
        print(tool_use)
        tool_id = tool_use.get("toolUseId")
        tool_name = tool_use.get("name")

        # Only send tool call event once per tool ID
        if tool_id and tool_id not in seen_tool_ids:
            seen_tool_ids.add(tool_id)

            # If tool name includes "agent", send agent_start instead
            if tool_name and "agent" in tool_name:
                return {
                    "type": "agent_start",
                    "name": tool_name,
                }
            else:
                return {
                    "type": "tool_call",
                    "tool_name": tool_name,
                    "tool_id": tool_id,
                }

    # Filter out everything else
    return None
