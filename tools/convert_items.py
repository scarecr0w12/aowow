#!/usr/bin/env python3
"""
Batch convert item models using pre-built mapping.
Reads /tmp/item-m2-mapping.json (model_name -> M2_path).
Outputs GLBs to /var/www/aowow/static/models/item/
"""

import json
import os
import sys
import time

sys.path.insert(0, '/var/www/aowow/tools')
from m2_to_glb import MPQManager, convert_model

CLIENT_DATA = '/var/www/clientdata/Data'
OUTPUT_DIR = '/var/www/aowow/static/models/item'

def main():
    # Load mapping
    with open('/tmp/item-m2-mapping.json') as f:
        mapping = json.load(f)

    print(f"Items to convert: {len(mapping)}")
    print("Loading MPQ archives...")
    mpq_mgr = MPQManager(CLIENT_DATA)
    print(f"Indexed {len(mpq_mgr.file_index)} files\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    success = 0
    failed = 0
    skipped = 0
    start_time = time.time()

    total = len(mapping)
    for i, (name, m2_path) in enumerate(sorted(mapping.items())):
        output_path = os.path.join(OUTPUT_DIR, f"{name}.glb")

        # Convert with backslashes
        m2_path = m2_path.replace('/', '\\')

        if convert_model(mpq_mgr, m2_path, output_path, model_type='item'):
            success += 1
        else:
            failed += 1

        # Progress every 200 items
        done = success + failed
        if done % 200 == 0:
            elapsed = time.time() - start_time
            rate = done / elapsed if elapsed > 0 else 0
            eta = (total - done) / rate if rate > 0 else 0
            print(f"\n--- Progress: {done}/{total} ({success} ok, {failed} fail) "
                  f"[{rate:.1f}/s, ETA: {eta/60:.1f}min] ---\n")

    elapsed = time.time() - start_time
    print(f"\n=== DONE: {success} success, {failed} failed in {elapsed:.0f}s ===")

if __name__ == '__main__':
    main()
