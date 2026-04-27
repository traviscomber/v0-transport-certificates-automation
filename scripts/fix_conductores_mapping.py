#!/usr/bin/env python3
import re

# Transportista RUT to ID mapping from the database
transportistas_mapping = {
    "16181677-9": "9307bfc5-26fa-4355-9d2b-1bde5ddcb7ec",
    "76012346-2": "f2b43050-cdb0-4615-9604-9dc8645d668b",
    "76234568-6": "a40d4dff-ba50-47e6-93a2-445b90bb5102",
    "76260962-2": "18d78ef8-ef28-4633-92aa-2914b228f4bd",
    "76345679-5": "342323c8-4128-451b-8199-9478e1047d2e",
    "76447559-3": "54fc0c8f-4dda-4c56-85d8-f85899af6d12",
    "76461213-2": "59f904ea-ada3-4520-969a-84e7637c4fe5",
    "76463195-1": "3ad7d6e8-2196-4b5d-9403-3280a7671f58",
    "76543211-3": "a29701ee-d5b4-4a26-9227-86c44db0cc7b",
    "76678902-8": "0c521310-def2-4554-ab0e-1eaa11717e97",
    "76789013-9": "39803928-831f-480d-a48d-d7ce4e04f921",
    "76848886-K": "c7aa362a-129a-4cb7-813b-b9a2447a1adf",
    "76901235-1": "3c8c5210-e28a-4718-9eae-2c8a2a197d95",
    "76956797-6": "3106301d-08ff-4e38-bf6c-2022565daf93",
    "77012346-2": "853ce76b-43a2-4701-97e8-68a71975f5f6",
    "77123457-3": "1a11ca74-9118-4e36-8295-9f7ad7afa54e",
    "77243323-9": "e8fe465b-452e-45b5-adfb-3ce1da013f28",
    "77390218-6": "bc96eb72-5a67-4428-ba08-2ada44ff4bea",
    "77416162-7": "dffa8f5d-1d8f-43df-822e-b9f831f98045",
    "77420673-6": "e2d67904-6e40-4aba-be68-617751986b00",
    "77441798-2": "0715228e-9be6-475d-aba0-2ff30fefc7c5",
    "77456780-7": "76364869-ff5f-4978-a891-6b9520a600eb",
    "77456790-6": "2fe86674-cd9f-4a19-80a2-0d09a3f3961a",
    "77490988-5": "af3a8c55-dca2-4c30-8b6d-ca9742d4f670",
    "77624057-5": "e6852cf7-a234-48d4-82ae-10707cfef219",
    "77647991-8": "dba3b43c-d583-4f4a-88f1-681d813a9710",
    "77653071-9": "a519ec4f-db0e-4f15-b07f-d63d44ba8758",
    "77654322-4": "2af21237-11d7-40a0-af90-42a2c4920398",
    "77732652-K": "f155714a-866f-4505-853c-9555182d927a",
    "77765432-1": "ee2e29c7-5d4f-493f-bd01-32da0b0c51f3",
    "77772051-1": "5475bd6d-f888-44fa-9e00-0d55365cefe0",
    "77789013-9": "c8479dc5-1866-4c2e-a9fa-d452d34b80dd",
    "77827992-4": "5fe1002c-e1ab-406d-afea-7f8340a5aa9c",
    "77890124-0": "9dc6ec12-7866-41fd-85ac-09c89c4760aa",
    "78032375-2": "9e557ba3-a13d-4e63-8781-0eba853104c7",
    "78040304-7": "65a86ab3-e2bc-49a0-9962-0bd2242ac2e9",
    "78087308-6": "12703a41-9c4d-44d5-af59-72c20173c943",
    "78101236-K": "2828e43d-2a89-4732-b2e8-9aa0d4dbc348",
    "78123457-3": "d99dfca7-df16-4d72-a92a-b38a885a3a7c",
    "78150214-6": "ead426a9-595d-4c3a-a6e9-ac72d3b381f3",
    "78151772-0": "da5358d7-c591-40e5-b1a8-2ae8cfb9d3f1",
    "78154645-3": "741923d5-fdaf-474b-af6a-75fe69a7de46",
    "78156059-6": "bc90a1e8-0009-40e8-897f-ba677e1fdf1e",
    "78165845-6": "f5c6f54e-8303-4209-be3e-c75a823a9dcd",
    "78190172-5": "7d9096ba-8793-4a01-8151-9e58900cfcad",
    "78234561-2": "5de473d7-8560-4c1c-b28c-0ba5fb1908cc",
    "78234568-4": "d7f93a00-6754-4362-8bfc-f48ec6765163",
    "78234684-9": "1c5a0696-e18d-484b-8d07-c4b16d45f159",
    "78345671-5": "8fe6fedd-6dc7-45ab-b606-2651f742a2e9",
    "78567891-7": "5e528177-105a-4adb-aff0-05cf155082fa",
    "78567891-8": "1f2e4350-6473-4118-8dfd-7336b52f1ac6",
    "78890124-0": "3ec70311-329a-4c6a-bff5-5538c3a662a5",
    "78901235-1": "45bc6c6f-6095-4952-8bf3-4d00bd5b0e86",
}

# Read conductores.txt and parse the data
updates = []
conductor_count = 0

try:
    with open('/vercel/share/v0-project/data/conductores.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Total lines in file: {len(lines)}")
    
    # Parse each conductor entry (assuming pipe-delimited format)
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Rut_Conductor'):  # Skip header
            continue
        
        # Split by | to get columns
        parts = [p.strip() for p in line.split('|')]
        
        if len(parts) >= 2:
            rut_conductor = parts[0]
            # Try to find Rut_Proveedor - it could be at different positions
            rut_proveedor = None
            
            for part in parts:
                if re.match(r'\d{6,8}-[\dKk]', part):
                    # Check if this RUT is in transportistas_mapping
                    if part in transportistas_mapping:
                        rut_proveedor = part
                        break
            
            if rut_proveedor and rut_proveedor in transportistas_mapping:
                transportista_id = transportistas_mapping[rut_proveedor]
                updates.append({
                    'rut_conductor': rut_conductor,
                    'rut_proveedor': rut_proveedor,
                    'transportista_id': transportista_id
                })
                conductor_count += 1
            else:
                print(f"Warning: Could not find transportista for conductor {rut_conductor} with providers: {[p for p in parts if re.match(r'\d{6,8}-[\dKk]', p)]}")
    
    print(f"\nProcessed {conductor_count} conductores")
    
    # Generate SQL UPDATE statement using CASE
    if updates:
        print(f"\n-- Generating UPDATE statement for {len(updates)} conductores")
        
        # Group by transportista_id for efficient updates
        update_groups = {}
        for update in updates:
            tid = update['transportista_id']
            if tid not in update_groups:
                update_groups[tid] = []
            update_groups[tid].append(update['rut_conductor'])
        
        print(f"\nFound {len(update_groups)} different transportistas")
        
        # Print statistics
        for tid, ruts in update_groups.items():
            print(f"  Transportista {tid}: {len(ruts)} conductores")
        
        # Create UPDATE statements
        total_updates = len(updates)
        print(f"\n-- Total conductores to update: {total_updates}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
