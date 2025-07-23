from agents import Agent, Runner

from ...events.bus import AgentType, BusinessEvent, BusinessEventType, event_bus
from .project_management import handle_project_management, project_management_agent
from .resource_management import handle_resource_management, resource_management_agent

MAIN_SYSTEM_PROMPT = """
You are an assistant that routes queries to specialized agents:
- For queries related to project management, planning, tasks, phases → Use the project_management_agent tool
- For queries related to staffers, assignments, resource allocation → Use the resource_management_agent tool

Always select the most appropriate tool based on the user's query.

The resource_management_agent specializes in staffer reassignment scenarios and returns structured responses.
"""

# Create the orchestrator using the specialized agents as tools
orchestrator = Agent(
    name="orchestrator",
    instructions=MAIN_SYSTEM_PROMPT,
    tools=[
        project_management_agent.as_tool(
            tool_name="project_management_agent",
            tool_description="Handle project management queries including planning, tasks, phases, and project tracking",
        ),
        resource_management_agent.as_tool(
            tool_name="resource_management_agent",
            tool_description="Handle resource allocation, staffer assignments, and time-off reassignment scenarios",
        ),
    ],
)


async def run(query: str):
    """
    Run the orchestrator with a query and emit results through the event bus.

    Args:
        query: The user's query to process

    Returns:
        str: The orchestrator's response to the query
    """
    try:
        # Emit start event
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.TEST,
                message=f"Starting to process query: {query[:50]}...",
                agent_id=AgentType.PROJECT,
            )
        )

        # Run the orchestrator agent
        result = await Runner.run(orchestrator, input=query)

        # Emit result event
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.TEST,
                message=f"Query processed successfully: {str(result)[:200]}...",
                agent_id=AgentType.PROJECT,
            )
        )

        # Return the actual result
        return str(result)

    except Exception as e:
        # Emit error event
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.TEST,
                message=f"Error processing query: {str(e)}",
                agent_id=AgentType.PROJECT,
            )
        )
        # Re-raise the exception so the caller can handle it
        raise e
