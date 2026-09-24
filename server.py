"""
Micro-servidor API local para Dashboard Actividades IDIC
=========================================================
Expone un endpoint HTTP local con CORS para alimentar el Dashboard React
directamente desde Google Sheets en tiempo real mediante la Service Account.

Endpoint:
    GET http://localhost:5001/api/activities

Uso:
    python server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import sys
from sync_sheets import build_activities, OUTPUT_JSON

PORT = 5001


class SheetsApiHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/activities") or self.path == "/":
            try:
                data = build_activities()
                # Actualizar también la copia local de respaldo
                os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
                with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                print(f"[GET {self.path}] 200 OK — Sincronizadas {len(data)} actividades desde Google Sheets.")
            except Exception as e:
                err_msg = json.dumps({"error": str(e)}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_msg)))
                self.end_headers()
                self.wfile.write(err_msg)
                print(f"[GET {self.path}] 500 Error: {e}", file=sys.stderr)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Desactivar logs estándar ruidosos
        pass


def run(port=PORT):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, SheetsApiHandler)
    print(f"===========================================================")
    print(f"  API Google Sheets activa en: http://localhost:{port}/api/activities")
    print(f"  Conectada con: google_key.json")
    print(f"  Google Sheet: Modelo_Registro_Actividades")
    print(f"===========================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(port)
