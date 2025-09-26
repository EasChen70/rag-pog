import re
import os
from typing import List, Optional

def camel_case(text: str) -> str:
    # "render settings" -> "RenderSettings"
    clean = re.sub(r'[^A-Za-z0-9]+', ' ', text).strip()
    return ''.join(p.capitalize() for p in clean.split())

def apply_rules(name: str, suffix: str = "Panel", extension: str = ".po.js") -> str:
    # Always end with "Panel.po.js"
    if not name.endswith(suffix):
        name += suffix
    if not name.endswith(extension):
        name += extension
    return name

def infer_filename(query: str, sources: Optional[List[str]] = None) -> str:
    query = query.strip()

    # 1. Generate/create/make phrasing → new panel names
    m = re.search(r'(?:generate|create|make)\s+(?:an?\s+)?(.+?)\s+(?:scaffold|page\s*object|po)', query, re.I)
    if m:
        return apply_rules(camel_case(m.group(1)))

    # 2. Explicit *.po.js in query
    m = re.search(r'([\w\-.]+)\.po\.js', query, re.I)
    if m:
        return apply_rules(re.sub(r'\.po\.js$', '', m.group(1), flags=re.I))

    # 3. Explicit SomethingPanel mention
    m = re.search(r'(\w+)Panel', query, re.I)
    if m:
        return apply_rules(m.group(1))

    # 4. Fallback → combine source base names
    if sources:
        bases = []
        for s in sources:
            base = os.path.basename(s)
            base = re.sub(r'\.po\.js$', '', base, flags=re.I)
            base = re.sub(r'Panel$', '', base, flags=re.I)
            if base and base not in bases:
                bases.append(base)
        if bases:
            return apply_rules("".join(bases))

    # 5. Final fallback
    return apply_rules("Generated")
