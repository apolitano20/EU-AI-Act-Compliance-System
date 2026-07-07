#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compile results/*.json into eu-ai-act-modules/report.md.

Handles real-world shape drift across the 6 independent research agents that
produced these files: Title-Case vs snake_case category keys, module id/name
as two fields vs one, and questionnaire/rules content wrapped in an extra
{"questions": [...]} / {"rules": [...]} layer for some files but not others.
"""

import json
from pathlib import Path

import yaml

BASE = Path(__file__).parent
RESULTS_DIR = BASE.parent / "results"
FIELDS_PATH = BASE / "fields.yaml"
OUTLINE_PATH = BASE / "outline.yaml"
REPORT_PATH = BASE / "report.md"

# Category names as they appear in fields.yaml, mapped to every key variant
# actually observed across the 12 result files.
CATEGORY_MAPPING = {
    "Questionnaire": ["Questionnaire", "questionnaire"],
    "Deterministic Rules": ["Deterministic Rules", "deterministic_rules"],
    "Result Object": ["Result Object", "result_object"],
    "UI Pattern": ["UI Pattern", "ui_pattern"],
}
ALL_CATEGORY_KEYS = {v for keys in CATEGORY_MAPPING.values() for v in keys}
# Only keys actually rendered in the header block above each section -
# everything else (flowchart_section_note, guidance_status, source_version_date,
# "new", etc.) falls through to "Other Info" instead of being silently dropped.
MODULE_META_KEYS = {
    "module_id", "module_name", "module", "flowchart_section",
    "legal_basis", "depends_on", "description",
}
SKIP_KEYS = {"_source_file", "uncertain"} | MODULE_META_KEYS | ALL_CATEGORY_KEYS


def is_uncertain(value):
    if value is None:
        return True
    if isinstance(value, str) and (not value.strip() or "[uncertain]" in value):
        return True
    return False


def slugify_anchor(text):
    """Match GitHub's heading-anchor algorithm so TOC links resolve without
    needing an explicit {#anchor} attribute (which GitHub renders as literal
    text, not markup)."""
    text = text.lower()
    kept = "".join(c for c in text if c.isalnum() or c in " -_")
    return kept.replace(" ", "-")


def numeric_confidence(value):
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str) and len(value) <= 6 and any(ch.isdigit() for ch in value):
        return value
    return None


def format_scalar(value):
    text = str(value)
    if len(text) > 100:
        return text.replace("\n", "<br>")
    return text


def format_list(items, uncertain_names, indent=""):
    if not items:
        return ""
    if all(not isinstance(i, (dict, list)) for i in items):
        items = [i for i in items if not is_uncertain(i)]
        joined = ", ".join(str(i) for i in items)
        if len(joined) <= 100:
            return f"{indent}{joined}\n"
        return "".join(f"{indent}- {i}\n" for i in items)
    lines = []
    for item in items:
        if isinstance(item, dict):
            lines.append(format_dict_as_line(item, uncertain_names, indent))
        elif isinstance(item, list):
            lines.append(format_list(item, uncertain_names, indent + "  "))
        else:
            if not is_uncertain(item):
                lines.append(f"{indent}- {item}\n")
    return "".join(lines)


def format_dict_as_line(d, uncertain_names, indent=""):
    parts = []
    for k, v in d.items():
        if k in uncertain_names or is_uncertain(v):
            continue
        if isinstance(v, (dict, list)):
            continue
        parts.append(f"**{k}**: {format_scalar(v)}")
    line = f"{indent}- " + " | ".join(parts) + "\n" if parts else ""
    for k, v in d.items():
        if isinstance(v, list) and v:
            line += format_list(v, uncertain_names, indent + "  ")
        elif isinstance(v, dict) and v:
            line += format_dict(v, uncertain_names, indent + "  ")
    return line


def format_dict(d, uncertain_names, indent=""):
    lines = []
    for k, v in d.items():
        if k in uncertain_names or is_uncertain(v):
            continue
        if isinstance(v, dict):
            lines.append(f"{indent}- **{k}**:\n")
            lines.append(format_dict(v, uncertain_names, indent + "  "))
        elif isinstance(v, list):
            lines.append(f"{indent}- **{k}**:\n")
            lines.append(format_list(v, uncertain_names, indent + "  "))
        else:
            lines.append(f"{indent}- **{k}**: {format_scalar(v)}\n")
    return "".join(lines)


def render_category(value, uncertain_names):
    """Render a category's raw JSON value regardless of its wrapper shape."""
    if isinstance(value, list):
        return format_list(value, uncertain_names)
    if isinstance(value, dict):
        return format_dict(value, uncertain_names)
    if is_uncertain(value):
        return ""
    return format_scalar(value) + "\n"


def get_category_value(data, category_name):
    for key in CATEGORY_MAPPING.get(category_name, [category_name]):
        if key in data:
            return data[key]
    return None


def get_module_identity(data):
    name = data.get("module_name") or data.get("module") or "Unnamed module"
    return name


def get_extra_fields(data):
    return {k: v for k, v in data.items() if k not in SKIP_KEYS}


def main():
    with OUTLINE_PATH.open(encoding="utf-8") as f:
        outline = yaml.safe_load(f)
    with FIELDS_PATH.open(encoding="utf-8") as f:
        fields_def = yaml.safe_load(f)
    category_names = [c["category"] for c in fields_def.get("field_categories", [])]

    items = outline.get("items", [])
    toc_lines = []
    detail_sections = []

    for idx, item in enumerate(items, start=1):
        slug_map = {
            "module-4": "EU_Scope_Applicability",
            "module-5": "Exclusions",
            "module-6": "Prohibited_AI_Practices",
            "module-7": "High_Risk_Classification",
            "module-8": "AI_Literacy",
            "module-9": "Value_Chain_Reclassification",
            "module-10": "GPAI_Obligations",
            "module-11": "Transparency_Obligations",
            "module-12": "Obligations_Matrix",
            "module-13": "Evidence_Readiness_Assessment",
            "module-14": "Remediation_Tracker",
            "module-15": "Final_Report_Generator",
        }
        json_path = RESULTS_DIR / f"{slug_map[item['id']]}.json"
        if not json_path.exists():
            print(f"[WARN] Missing result file for {item['id']}: {json_path}")
            continue
        with json_path.open(encoding="utf-8") as f:
            data = json.load(f)

        uncertain_names = set(data.get("uncertain", []) or [])
        name = get_module_identity(data)
        anchor = slugify_anchor(name)

        result_obj = get_category_value(data, "Result Object") or {}
        confidence_score = result_obj.get("confidence_score") if isinstance(result_obj, dict) else None
        confidence_label = result_obj.get("confidence_label") if isinstance(result_obj, dict) else None
        legal_basis = data.get("legal_basis") or []
        legal_basis_str = ", ".join(legal_basis) if isinstance(legal_basis, list) else str(legal_basis)

        conf_str = ""
        clean_score = numeric_confidence(confidence_score) if not is_uncertain(confidence_score) else None
        clean_label = confidence_label if confidence_label and not is_uncertain(confidence_label) and len(str(confidence_label)) <= 30 else None
        if clean_score is not None:
            conf_str = f"Confidence: {clean_score}"
            if clean_label:
                conf_str += f" ({clean_label})"
        elif clean_label:
            conf_str = f"Confidence: {clean_label}"
        basis_str = f"Basis: {legal_basis_str}" if legal_basis_str else ""
        toc_meta = " | ".join(p for p in (conf_str, basis_str) if p)
        toc_lines.append(f"{idx}. [{name}](#{anchor})" + (f" - {toc_meta}" if toc_meta else ""))

        section = [f"## {idx}. {name}\n"]
        section.append(f"**Module ID**: {item['id']}  \n")
        section.append(f"**Flowchart section**: {data.get('flowchart_section') or '_(not in flowchart — practical add-on)_'}  \n")
        if legal_basis_str:
            section.append(f"**Legal basis**: {legal_basis_str}  \n")
        depends_on = data.get("depends_on") or []
        if depends_on:
            section.append(f"**Depends on**: {', '.join(depends_on)}  \n")
        section.append("\n")
        desc = data.get("description")
        if desc and not is_uncertain(desc):
            section.append(f"{desc}\n\n")

        for category_name in category_names:
            value = get_category_value(data, category_name)
            if value is None:
                continue
            rendered = render_category(value, uncertain_names)
            if not rendered.strip():
                continue
            section.append(f"### {category_name}\n\n{rendered}\n")

        extras = get_extra_fields(data)
        if extras:
            section.append("### Other Info\n\n")
            section.append(format_dict(extras, uncertain_names))
            section.append("\n")

        if uncertain_names:
            section.append("### Not Yet Settled\n\n")
            section.append(
                "The following fields could not be resolved by research alone "
                "(runtime-dependent, or pending finalization of draft/provisional EU guidance):\n\n"
            )
            for name_u in sorted(uncertain_names):
                section.append(f"- {name_u}\n")
            section.append("\n")

        detail_sections.append("".join(section))

    report = ["# EU AI Act Compliance Readiness Dashboard — Remaining Modules (4-15)\n\n"]
    report.append(f"Research report generated from `{OUTLINE_PATH.name}` / `{FIELDS_PATH.name}` and validated `results/*.json`.\n\n")
    report.append("## Table of Contents\n\n")
    report.append("\n".join(toc_lines) + "\n\n")
    report.append("---\n\n")
    report.append("\n---\n\n".join(detail_sections))

    REPORT_PATH.write_text("".join(report), encoding="utf-8")
    print(f"Report written to {REPORT_PATH} ({len(items)} modules)")


if __name__ == "__main__":
    main()
