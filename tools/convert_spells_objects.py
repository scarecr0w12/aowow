#!/usr/bin/env python3
"""
Batch convert spell and object models using pre-built mappings.
"""

import json
import os
import sys
import time

sys.path.insert(0, '/var/www/aowow/tools')
from m2_to_glb import MPQManager, convert_model

CLIENT_DATA = '/var/www/clientdata/Data'

def convert_batch(mpq_mgr, mapping_file, output_dir, model_type):
    with open(mapping_file) as f:
        mapping = json.load(f)

    print(f"\n=== Converting {model_type} models: {len(mapping)} ===\n")
    os.makedirs(output_dir, exist_ok=True)

    success = 0
    failed = 0
    start_time = time.time()

    for name, m2_path in sorted(mapping.items()):
        output_path = os.path.join(output_dir, f"{name}.glb")
        m2_path = m2_path.replace('/', '\\')

        if convert_model(mpq_mgr, m2_path, output_path, model_type=model_type):
            success += 1
        else:
            failed += 1

    elapsed = time.time() - start_time
    print(f"\n=== {model_type}: {success} success, {failed} failed in {elapsed:.0f}s ===")
    return success, failed


def main():
    print("Loading MPQ archives...")
    mpq_mgr = MPQManager(CLIENT_DATA)
    print(f"Indexed {len(mpq_mgr.file_index)} files\n")

    convert_batch(mpq_mgr, '/tmp/spell-m2-mapping.json',
                  '/var/www/aowow/static/models/spell', 'spell')

    convert_batch(mpq_mgr, '/tmp/object-m2-mapping.json',
                  '/var/www/aowow/static/models/object', 'object')


if __name__ == '__main__':
    main()
