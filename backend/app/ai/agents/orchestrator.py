from agents import Agent, ItemHelpers, Runner

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
    Run the orchestrator with a query, stream events, and emit results through the event bus.

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

        # Run the orchestrator agent with streaming
        result = Runner.run_streamed(starting_agent=orchestrator, input=query)

        print(f"=== Orchestrator Run Starting for query: {query[:100]}... ===")

        final_result = None

        # Stream and process events
        async for event in result.stream_events():
            # Ignore raw response events (token-by-token updates)
            if event.type == "raw_response_event":
                continue

            # Handle agent updates (when agents hand off to each other)
            elif event.type == "agent_updated_stream_event":
                agent_name = (
                    event.new_agent.name if hasattr(event, "new_agent") else "unknown"
                )
                print(f"🔄 Agent handoff: Now using {agent_name}")

                await event_bus.emit(
                    BusinessEvent(
                        type=BusinessEventType.TEST,
                        message=f"Agent handoff: Now using {agent_name}",
                        agent_id=AgentType.PROJECT,
                    )
                )

            # Handle run item events (tool calls, messages, etc.)
            elif event.type == "run_item_stream_event":
                if event.item.type == "tool_call_item":
                    tool_name = (
                        event.item.name
                        if hasattr(event.item, "name")
                        else "unknown_tool"
                    )
                    tool_args = (
                        event.item.arguments if hasattr(event.item, "arguments") else {}
                    )

                    print(f"🔧 Tool Called: {tool_name}")
                    print(f"   Arguments: {tool_args}")

                    await event_bus.emit(
                        BusinessEvent(
                            type=BusinessEventType.TEST,
                            message=f"Tool called: {tool_name} with args: {tool_args}",
                            agent_id=AgentType.PROJECT,
                        )
                    )

                elif event.item.type == "tool_call_output_item":
                    tool_output = (
                        str(event.item.output)[:200]
                        if hasattr(event.item, "output")
                        else "No output"
                    )

                    print(f"✅ Tool Output: {tool_output}...")

                    await event_bus.emit(
                        BusinessEvent(
                            type=BusinessEventType.TEST,
                            message=f"Tool output received: {tool_output}...",
                            agent_id=AgentType.PROJECT,
                        )
                    )

                elif event.item.type == "message_output_item":
                    message_text = ItemHelpers.text_message_output(event.item)

                    print(f"💬 Agent Message Generated:")
                    print(f"   {message_text[:200]}...")

                    # Store the final result
                    final_result = message_text

                    await event_bus.emit(
                        BusinessEvent(
                            type=BusinessEventType.TEST,
                            message=f"Agent response: {message_text[:200]}...",
                            agent_id=AgentType.PROJECT,
                        )
                    )

                else:
                    print(f"📝 Other item type: {event.item.type}")

        print("=== Orchestrator Run Complete ===")

        # Get the final result from the completed run
        if final_result is None:
            final_result = str(await result.get_result())

        # Emit final success event
        await event_bus.emit(
            BusinessEvent(
                type=BusinessEventType.TEST,
                message=f"Query processed successfully: {str(final_result)[:200]}...",
                agent_id=AgentType.PROJECT,
            )
        )

        # Return the actual result
        return str(final_result)

    except Exception as e:
        print(f"❌ Error in orchestrator: {str(e)}")

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
