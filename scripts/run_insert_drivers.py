#!/usr/bin/env python3
import subprocess
import sys

# Install supabase package
print("Installing supabase package...")
subprocess.run([sys.executable, "-m", "pip", "install", "supabase"], check=True)

# Now import and run the insert script
exec(open('/vercel/share/v0-project/scripts/insert_all_drivers.py').read())
