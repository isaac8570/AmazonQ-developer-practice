#!/usr/bin/env python3
import http.server
import ssl
import socketserver

PORT = 8443

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map['.js'] = 'application/javascript'

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.check_hostname = False
    context.load_default_certs()
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"HTTPS 서버 시작: https://localhost:{PORT}")
    print("Ctrl+C로 종료")
    httpd.serve_forever()
