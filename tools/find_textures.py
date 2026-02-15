#!/usr/bin/env python3
"""Find texture component files in MPQ archives."""
import mpyq, os, sys

data_path = '/var/www/clientdata/Data'
search = sys.argv[1].lower() if len(sys.argv) > 1 else 'mail_a_01'

results = set()
for mpq_name in ['patch-3.MPQ', 'patch-2.MPQ', 'patch.MPQ', 'lichking.MPQ', 'expansion.MPQ', 'common-2.MPQ', 'common.MPQ']:
    path = os.path.join(data_path, mpq_name)
    if os.path.exists(path):
        try:
            archive = mpyq.MPQArchive(path)
            for f in archive.files:
                name = f.decode('utf-8', 'ignore') if isinstance(f, bytes) else f
                if search in name.lower() and 'texturecomponents' in name.lower():
                    results.add(name)
        except Exception as e:
            print(f"Error: {mpq_name}: {e}", file=sys.stderr)

for r in sorted(results):
    print(r)
print(f"\nTotal unique: {len(results)}", file=sys.stderr)
