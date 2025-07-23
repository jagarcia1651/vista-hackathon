from strands import Agent

from .profitability import profitability_agent
from .project_management import project_management_agent
from .quotes import quotes_agent
from .resource_management import resource_management_agent
from ..events.bus import event_bus, BusinessEvent, BusinessEventType

MAIN_SYSTEM_PROMPT = """
You are an assistant that routes queries to specialized agents:
- For queries related to quotes → Use the quotes_agent tool
- For queries related to project management, planning, tasks, phases → Use the project_management_agent tool
- For queries related to staffers, assignments, resource allocation → Use the resource_management_agent tool
- For queries related to project profitability, financial impact, cost analysis → Use the profitability_agent tool

The profitability agent automatically monitors project changes:
- Creates baseline profitability snapshots before first project modifications
- Tracks profitability changes after agent actions
- Reports financial impact and delta analysis

Always select the most appropriate tool based on the user's query.
"""

orchestrator = Agent(
    name="orchestrator",
    system_prompt=MAIN_SYSTEM_PROMPT,
    callback_handler=None,
    tools=[
        quotes_agent,
        project_management_agent,
        resource_management_agent,
        profitability_agent,
    ],
)


async def run(query: str):
    agent_stream = orchestrator.stream_async(query)
    seen_tool_ids = set()  # Track tool calls to avoid duplicates

    async for event in agent_stream:
        # # Filter and format chunks for UI consumption
        # filtered_chunk = filter_chunk(event, seen_tool_ids)
        # if filtered_chunk:
        #     # Instead of yielding, emit as an event
        #     await event_bus.emit(
        #         BusinessEvent(
        #             type=BusinessEventType.TEST,
        #             message=filtered_chunk.get("this is testing a", ""),
        #             agent_id=filtered_chunk.get("agent_id", "orchestrator")
        #         )
        #     )

        # If this is the final result, emit a test event
        if "result" in event:
            await event_bus.emit(
                BusinessEvent(
                    type=BusinessEventType.TEST,
                    message=f"Query processed by the orchestrator",
                    agent_id="orchestrator"
                )
            )


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


def trigger_profitability_monitoring(
    project_id: str, agent_name: str, action_description: str
):
    """
    Trigger profitability monitoring after an agent makes project changes.
    This should be called by other agents after they modify project data.

    Args:
        project_id: UUID of the project that was modified
        agent_name: Name of the agent that made the change
        action_description: Description of what action was performed

    Returns:
        Profitability analysis result
    """
    try:
        # Import here to avoid circular imports
        from .profitability import monitor_project_profitability

        # Trigger profitability monitoring
        result = monitor_project_profitability(
            project_id=project_id,
            agent_action=action_description,
            triggered_by_agent=agent_name,
        )

        return {
            "success": True,
            "profitability_analysis": result,
            "project_id": project_id,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error triggering profitability monitoring: {str(e)}",
            "project_id": project_id,
        }
