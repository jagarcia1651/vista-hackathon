FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy poetry files
COPY pyproject.toml ./

# Configure poetry: don't create a virtual environment
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-root --only=main

# Copy application code
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 