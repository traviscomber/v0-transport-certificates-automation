import requests
import subprocess
import time
import sys

# Start the dev server in the background
print("Starting dev server...")
proc = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd="/vercel/share/v0-project",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Wait for server to start
time.sleep(10)

print("Calling /api/admin/sync-missing-drivers...")

try:
    response = requests.post(
        "http://localhost:3000/api/admin/sync-missing-drivers",
        timeout=60
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json() if response.status_code in [200, 201] else response.text}")
    
except Exception as e:
    print(f"Error: {e}")

finally:
    # Kill the server
    proc.terminate()
    proc.wait(timeout=5)
