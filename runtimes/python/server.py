import http.server
import json
import os
import sys
import traceback

sys.path.append("/app")


try:
    import handler
except ImportError:
    handler = None


class FaasHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if not handler or not hasattr(handler, "main"):
            self.send_error_response(
                500,
                "Handler error: 'handler.py' with 'main(event)' function not found.",
            )
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = (
            self.rfile.read(content_length).decode("utf-8")
            if content_length > 0
            else "{}"
        )

        try:
            event = json.loads(body) if body else {}
        except json.JSONDecodeError:
            event = {"raw_body": body}

        try:
            result = handler.main(event)
            response_data = json.dumps({"success": True, "result": result}).encode(
                "utf-8"
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_data)))
            self.end_headers()
            self.wfile.write(response_data)

        except Exception as e:
            error_trace = traceback.format_exc()
            self.send_error_response(500, f"Execution Error: {e!s}\n{error_trace}")

    def send_error_response(self, code, message):
        response_data = json.dumps({"success": False, "error": message}).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_data)))
        self.end_headers()
        self.wfile.write(response_data)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    server_address = ("", port)
    httpd = http.server.HTTPServer(server_address, FaaSHTTPRequestHandler)
    print(f"Python Runtime listening on port {port}...")
    httpd.serve_forever()
