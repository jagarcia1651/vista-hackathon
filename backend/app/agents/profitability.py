from strands import Agent, tool


@tool
def profitability_agent(query: str) -> str:
    try:
        agent = Agent(
            name="profitability",
            system_prompt="Give me advice on how to improve the profitability of my business based on the user's query",
            tools=[],
        )

        # Call the agent and return its response
        response = agent(query)
        return str(response)
    except Exception as e:
        return f"Error in profitability agent: {str(e)}"
