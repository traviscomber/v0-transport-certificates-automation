#!/usr/bin/env python3
import os
import subprocess
import time

# Start dev server in background
print("[v0] Starting dev server...")
proc = subprocess.Popen(['npm', 'run', 'dev'], cwd='/vercel/share/v0-project', stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Wait for server to start
time.sleep(10)

# Call the insert endpoint
import requests
import json

url = 'http://localhost:3000/api/admin/insert-all-drivers'
print(f"[v0] Calling {url}...")

try:
    response = requests.post(url, timeout=60)
    print(f"[v0] Status: {response.status_code}")
    print(f"[v0] Response: {response.text[:500]}")
except Exception as e:
    print(f"[v0] Error: {e}")

# Keep server running for a bit
time.sleep(5)
proc.terminate()
