import json
import os


def get_academic_year():
    from datetime import datetime
    today = datetime.today()
    if today.month >= 6:
        return f"{today.year}-{str(today.year + 1)[-2:]}"
    else:
        return f"{today.year - 1}-{str(today.year)[-2:]}"


def check_eligibility(inputs, scholarships):
    eligible = []

    for scholarship in scholarships:
        elig = scholarship["eligibility"]

        # Check 1 — Domicile
        if not elig["domicile"] or inputs.get("domicile") == elig["domicile"]:
            pass
        else:
            continue

        # Check 2 — Caste
        if elig["caste_categories"] and inputs.get("caste") not in elig["caste_categories"]:
            continue

        # Check 3 — Religion
        if elig["religion"] and inputs.get("religion") not in elig["religion"]:
            continue

        # Check 4 — Gender
        if elig["gender"] and inputs.get("gender") not in elig["gender"]:
            continue

        # Check 8 — Admission Type
        if not elig["admission_types"] or inputs.get("admission_type") in elig["admission_types"] or ("Regular" in elig["admission_types"] and inputs.get("admission_type") == "CAP"):
            pass
        else:
            continue

        # Check 5 — Income
        ic = elig.get("income_criteria")
        if ic:
            if ic.get("max") is not None and inputs.get("income", 0) > ic["max"]:
                continue
            if ic.get("min") is not None and inputs.get("income", 0) < ic["min"]:
                continue
        if elig.get("income_slabs") and inputs.get("income", 0) > 800000:
            continue

        # Check 9 — Disability
        if elig["disability_required"]:
            if not inputs.get("disability") or inputs.get("disability_percentage", 0) < 40:
                continue

        # Check 10 — Employment
        if elig["employment_required"] is not None:
            if inputs.get("employment_status") != "Unemployed":
                continue

        # Check 11 — Percentage
        min_pct = elig["min_previous_percentage"]
        if min_pct is not None and min_pct > 0:
            if inputs.get("percentage") is None or inputs.get("percentage") < min_pct:
                continue

        # Check 12 — Gap Years
        max_gap = elig["max_gap_years"]
        if max_gap is not None:
            if inputs.get("gap_years") is None or inputs.get("gap_years") > max_gap:
                continue

        eligible.append({
            "scheme_id": scholarship["scheme_id"],
            "name": scholarship["name"],
            "department": scholarship["department"],
            "category": scholarship["category"],
            "category_label": scholarship["category_label"],
            "selection_type": scholarship["selection_type"],
            "benefits": scholarship["benefits"],
            "seat_quota": scholarship["seat_quota"],
            "additional_conditions": scholarship["eligibility"]["additional_conditions"],
            "incompatible_with": scholarship["incompatible_with"],
            "compatible_with": scholarship["compatible_with"],
            "dependent_on": scholarship["dependent_on"],
            "documents_required": scholarship["documents_required"],
            "official_link": scholarship["official_link"]
        })

    return eligible