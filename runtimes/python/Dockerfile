FROM python:3.11-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY server.py /app/server.py
COPY handler.py /app/handler.py

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["python", "-u", "/app/server.py"]