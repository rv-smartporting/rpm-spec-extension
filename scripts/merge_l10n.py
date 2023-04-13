#!/usr/bin/env python3
#! -*- coding: utf-8 -*-

import os
import json
from typing import List, Dict

def merge_l10n(base_dir: str):
    bd_path = os.path.join(base_dir, 'bundle.l10n.json')
    if not os.path.exists(bd_path):
        print("bundle.l10n.json not exists, exited")
        exit(1)
    
    # Load base bundle
    with open(bd_path, 'r', encoding='utf-8') as f:
        bd_base: Dict[str, str] = json.load(f)
    with open(bd_path, 'w', encoding='utf-8') as f:
        json.dump(bd_base, f, indent=4, sort_keys=True, ensure_ascii=False)

    for f_item in os.listdir(base_dir):
        if not f_item.startswith('bundle.l10n') or f_item == 'bundle.l10n.json':
            continue

        f_path = os.path.join(base_dir, f_item)
        with open(f_path, 'r', encoding='utf-8') as f:
            bd_current: Dict[str, str] = json.load(f)
        
        current_keys = list(bd_current.keys())

        # Add new keys
        for key, val in bd_base.items():
            if key not in bd_current:
                bd_current[key] = val
        
        # Remove keys
        for key in current_keys:
            if key not in bd_base:
                bd_current.pop(key)
        
        # Save merged result
        with open(f_path, 'w', encoding='utf-8') as f:
            json.dump(bd_current, f, indent=4, sort_keys=True, ensure_ascii=False)

        print("Updated {}".format(f_item))

if __name__ == '__main__':
    merge_l10n(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'l10n'))