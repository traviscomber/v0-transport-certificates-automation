import subprocess
import time

# Wait for the dev server to start
print("[v0] Waiting for dev server to start...")
time.sleep(3)

# Call the quick-sync endpoint
print("[v0] Calling POST /api/admin/quick-sync...")
result = subprocess.run(
    ["curl", "-X", "POST", "http://localhost:3000/api/admin/quick-sync"],
    capture_output=True,
    text=True
)

print("[v0] Response status:", result.returncode)
print("[v0] Response body:")
print(result.stdout)
if result.stderr:
    print("[v0] Error:")
    print(result.stderr)
