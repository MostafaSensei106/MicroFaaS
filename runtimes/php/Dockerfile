FROM php:8.3-cli-alpine

WORKDIR /app

COPY server.php /app/server.php
COPY handler.php /app/handler.php

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

CMD ["php", "/app/server.php"]