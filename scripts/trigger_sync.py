import subprocess
import json

# Esperar a que el servidor esté listo
print("[v0] Esperando servidor...")
subprocess.run(["sleep", "3"], check=False)

# Hacer POST request al endpoint de sync
print("[v0] Llamando endpoint POST /api/admin/sync-drivers...")
result = subprocess.run([
    "curl", "-X", "POST", 
    "http://localhost:3000/api/admin/sync-drivers",
    "-H", "Content-Type: application/json"
], capture_output=True, text=True)

print("[v0] Response status:")
print(result.stdout)
if result.stderr:
    print("[v0] Error:", result.stderr)

# Esperar un momento
subprocess.run(["sleep", "2"], check=False)

# Verificar cuántos conductores hay ahora
print("\n[v0] Verificando cantidad de conductores...")
result2 = subprocess.run([
    "curl", "-s",
    "http://localhost:3000/api/drivers"
], capture_output=True, text=True)

try:
    data = json.loads(result2.stdout)
    count = len(data.get("drivers", []))
    print(f"[v0] Total de conductores en BD: {count}")
except:
    print("[v0] Response:", result2.stdout[:200])
