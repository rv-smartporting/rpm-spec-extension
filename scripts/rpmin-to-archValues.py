#!/usr/bin/env python3
#! -*- coding: utf-8 -*-

import requests
import json
import re
import typing

PROXIES = {
    'http': 'http://127.0.0.1:7890',
    'https': 'http://127.0.0.1:7890',
}

def fetch_arch_canons() -> typing.List[str]:
    url = "https://github.com/rpm-software-management/rpm/raw/master/rpmrc.in"
    in_content = requests.get(url, proxies=PROXIES).text
    res: typing.Set[str] = set()
    arch_canons = re.findall(r'arch_canon:\s*(?P<archName>[^:]+):\s*(?P<canonName>[^\s]+)\s+(?P<value>\d+)', in_content)
    for arch_canon in arch_canons:
        arch_name, canon_name, value = arch_canon
        res.add(canon_name)
    return list(sorted(res))

def fetch_arch_shortcuts() -> typing.List[str]:
    url = "https://github.com/rpm-software-management/rpm/raw/master/macros.in"
    in_content = requests.get(url, proxies=PROXIES).text
    res: typing.Set[str] = set()
    
    c_begin = in_content.find("arch macro")
    c_end = in_content.find("#---", in_content.rfind("arch macro"))
    c_arch = in_content[c_begin:c_end]
    
    arch_shortcuts = re.findall(r'\n%(?P<name>[^\s]+)\s+(?P<shortcuts>.*)\n', c_arch)
    for arch_shortcut in arch_shortcuts:
        s_name, shortcuts = arch_shortcut
        res.add(s_name)
    return list(sorted(res))

if __name__ == "__main__":
    with open('./resource/rpmspec.tmLanguage.json', 'r', encoding='utf-8') as f:
        lang_json = json.load(f)
    
    # Update arch values
    arch_values = "\\b({})\\b".format('|'.join(fetch_arch_canons()))
    lang_json['repository']['archValues']['match'] = arch_values
    
    # Update arch shortcuts
    arch_shortcuts = "\\b%({})\\b".format('|'.join(fetch_arch_shortcuts()))
    lang_json['repository']['archShortcuts']['match'] = arch_shortcuts

    # Save
    with open('./resource/rpmspec.tmLanguage.json', 'w', encoding='utf-8') as f:
        json.dump(lang_json, f, indent=4, ensure_ascii=False)

    print("Done")
