FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --default-timeout=100 --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create a data directory for SQLite persistence
RUN mkdir -p /app/data

# Default environment variables
ENV MQTT_BROKER=mosquitto
ENV MQTT_PORT=1883
ENV DATABASE_URL=sqlite:///./data/smartbell.db

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
