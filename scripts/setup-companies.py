#!/usr/bin/env python3
"""Script to setup companies table in Supabase"""

import os
import subprocess
import sys

# Install required packages
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "supabase"])

from supabase import create_client

# Get environment variables
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

# Create Supabase client
supabase = create_client(supabase_url, supabase_key)

try:
    # Create companies table
    result = supabase.query("""
        CREATE TABLE IF NOT EXISTS public.companies (
          id TEXT PRIMARY KEY,
          rut TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          representative TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          region TEXT,
          password_hash TEXT NOT NULL,
          is_labbe_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_companies_rut ON public.companies(rut);
        CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
        CREATE INDEX IF NOT EXISTS idx_companies_labbe_admin ON public.companies(is_labbe_admin);
    """).execute()
    
    print("✓ Companies table created successfully")
except Exception as e:
    print(f"Error creating table: {e}")
    sys.exit(1)
