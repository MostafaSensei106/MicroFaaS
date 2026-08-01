FROM node:20-alpine

ORKDIR /app

COPY server.js /app/server.js
COPY handler.js /app/handler.js

RUN chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "/app/server.js"]