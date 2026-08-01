const http = require('http');
const path = require('path');

let handler;
try {
    handler = require('/app/handler');
} catch (err) {
    console.error("Failed to load handler.js:", err.message);
}

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    if (!handler || typeof handler.main !== 'function') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Handler error: 'handler.js' with 'main(event)' export not found." }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        let event = {};
        try {
            if (body) event = JSON.parse(body);
        } catch (e) {
            event = { raw_body: body };
        }

        try {
            const result = await handler.main(event);
            const responseData = JSON.stringify({ success: true, result });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(responseData);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: err.message,
                stack: err.stack
            }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`Node.js Runtime listening on port ${PORT}...`);
});