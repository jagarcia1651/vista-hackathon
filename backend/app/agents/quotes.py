from strands import Agent, tool


@tool
def quotes_agent(query: str) -> str:
    try:
        # Strands Agents SDK makes it easy to create a specialized agent
        agent = Agent(
            name="quotes",
            system_prompt="Tell a joke related to the user's query",
            tools=[],
        )

        # Call the agent and return its response
        response = agent(query)
        return str(response)
    except Exception as e:
        return f"Error in quotes agent: {str(e)}"
