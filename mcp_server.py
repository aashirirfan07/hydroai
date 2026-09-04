#!/usr/bin/env python3
"""
HydroSentinel AI™ - Standalone Stdio Model Context Protocol (MCP) Server
========================================================================
Standard JSON-RPC 2.0 stdio server for Claude Desktop, Cursor, Antigravity,
and other MCP-compliant clients.

Usage in Claude Desktop / Cursor config:
{
  "mcpServers": {
    "hydrosentinel": {
      "command": "python",
      "args": ["<path-to-repo>/mcp_server.py"]
    }
  }
}
"""

import sys
import os
import json
import logging

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.mcp_service import mcp_service

# Direct logging to stderr so it does not corrupt stdout JSON-RPC messages
logging.basicConfig(stream=sys.stderr, level=logging.INFO, format="[MCP %(levelname)s] %(message)s")


def main():
    logging.info("HydroSentinel AI Model Context Protocol Server (Stdio) Initialized.")
    
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            
            line = line.strip()
            if not line:
                continue

            request_body = json.loads(line)
            response = mcp_service.handle_jsonrpc(request_body)
            
            # Send single-line JSON-RPC response to stdout
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except json.JSONDecodeError:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": "Parse error: Invalid JSON"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()
        except Exception as e:
            logging.error(f"Fatal error in stdio loop: {str(e)}")
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32603, "message": f"Internal error: {str(e)}"}
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
