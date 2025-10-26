
#!/usr/bin/env python3
"""Tanium Asking Questions Simulator v2 (authoring-grade mock)."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sqlite3
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

SIM_ROOT = Path(__file__).resolve().parent
DB_PATH = SIM_ROOT / "inventory.sqlite"
SAVED_PATH = SIM_ROOT / "saved_questions.json"
DOWNLOADS_DIR = SIM_ROOT / "downloads"

FIELD_MAP: Dict[str, Dict[str, str]] = {
    "computer name": {"key": "computer_name", "type": "text"},
    "computer role": {"key": "role", "type": "text"},
    "role": {"key": "role", "type": "text"},
    "operating system": {"key": "os_platform", "type": "text"},
    "os platform": {"key": "os_platform", "type": "text"},
    "os version": {"key": "os_version", "type": "text"},
    "disk free gb": {"key": "disk_free_gb", "type": "number"},
    "memory gb": {"key": "memory_gb", "type": "number"},
    "cpu percent": {"key": "cpu_percent", "type": "number"},
    "compliance score": {"key": "compliance_score", "type": "number"},
    "group": {"key": "group_name", "type": "text"},
    "group name": {"key": "group_name", "type": "text"},
    "location": {"key": "location", "type": "text"},
    "last reboot": {"key": "last_reboot", "type": "text"},
    "last seen": {"key": "last_seen", "type": "text"},
}

GROUP_ALIASES = {
    "laptops": "Laptops",
    "servers": "Data Center Servers",
    "finance": "Finance Workstations",
    "finance workstations": "Finance Workstations",
    "canary": "Canary Cohort",
    "engineering lab": "Engineering Lab",
}

SAMPLE_ROWS = [
    ("LAPTOP-001", "Workstation", "Windows 11", "22H2", "Laptops", "NA-US", 68.2, 16.0, 32.5, 0.87, "2024-05-18", "2024-05-20"),
    ("LAPTOP-002", "Workstation", "Windows 10", "21H2", "Laptops", "NA-US", 45.4, 8.0, 74.3, 0.62, "2024-05-16", "2024-05-19"),
    ("LAPTOP-003", "Workstation", "Windows 11", "23H1", "Finance Workstations", "NA-US", 120.1, 16.0, 18.9, 0.92, "2024-05-14", "2024-05-18"),
    ("SERVER-API-01", "Server", "Windows Server 2019", "2019", "Data Center Servers", "NA-US", 512.4, 64.0, 42.1, 0.95, "2024-05-12", "2024-05-17"),
    ("SERVER-SQL-01", "Server", "Windows Server 2022", "2022", "Data Center Servers", "NA-US", 312.9, 128.0, 55.3, 0.89, "2024-05-13", "2024-05-17"),
    ("SRV-LNX-01", "Server", "Linux", "RHEL 9", "Data Center Servers", "EU-DE", 212.5, 32.0, 21.7, 0.91, "2024-05-11", "2024-05-15"),
    ("MAC-OPS-01", "Workstation", "macOS", "14.4", "Operations", "NA-US", 180.7, 32.0, 23.4, 0.88, "2024-05-18", "2024-05-20"),
    ("MAC-FIN-02", "Workstation", "macOS", "13.6", "Finance Workstations", "NA-US", 102.6, 16.0, 26.1, 0.93, "2024-05-15", "2024-05-18"),
    ("ENG-LAB-01", "Workstation", "Windows 11", "22H2", "Engineering Lab", "NA-US", 250.8, 32.0, 65.2, 0.77, "2024-05-15", "2024-05-18"),
    ("ENG-LAB-02", "Workstation", "Windows 11", "22H2", "Engineering Lab", "NA-US", 198.4, 32.0, 58.4, 0.75, "2024-05-15", "2024-05-18"),
    ("CANARY-EDGE", "Workstation", "Windows 11", "23H1", "Canary Cohort", "NA-US", 156.4, 16.0, 12.4, 0.98, "2024-05-19", "2024-05-20"),
]


@dataclass
class ParsedQuery:
    columns: List[str]
    aggregations: List[Tuple[str, Optional[str]]]
    scope_type: str
    scope_value: Optional[str]
    filters: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    group_by: Optional[str]
    order_by: Optional[str]
    order_dir: str
    limit: Optional[int]


class ParseError(Exception):
    def __init__(self, message: str, position: int = 0) -> None:
        super().__init__(message)
        self.position = position


# ---------------------------------------------------------------------------
# Bootstrap helpers


def ensure_resources() -> None:
    if not DB_PATH.exists():
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE machines (
                computer_name TEXT,
                role TEXT,
                os_platform TEXT,
                os_version TEXT,
                group_name TEXT,
                location TEXT,
                disk_free_gb REAL,
                memory_gb REAL,
                cpu_percent REAL,
                compliance_score REAL,
                last_reboot TEXT,
                last_seen TEXT
            )
            """
        )
        cur.executemany(
            """
            INSERT INTO machines (
                computer_name, role, os_platform, os_version, group_name, location,
                disk_free_gb, memory_gb, cpu_percent, compliance_score, last_reboot, last_seen
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            SAMPLE_ROWS,
        )
        conn.commit()
        conn.close()
    if not SAVED_PATH.exists():
        SAVED_PATH.write_text(json.dumps({"saved": []}, indent=2), encoding="utf-8")
    DOWNLOADS_DIR.mkdir(exist_ok=True)


def load_rows() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM machines")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows


# ---------------------------------------------------------------------------
# Parsing helpers


def parse_columns(segment: str) -> Tuple[List[str], List[Tuple[str, Optional[str]]]]:
    segment = segment.replace(' and ', ', ')
    raw = [part.strip() for part in segment.split(",") if part.strip()]
    plain: List[str] = []
    aggs: List[Tuple[str, Optional[str]]] = []
    for col in raw:
        lowered = col.lower()
        if lowered == "count()":
            aggs.append(("count", None))
            continue
        if lowered.startswith("count(") and lowered.endswith(")"):
            inner = col[col.find("(") + 1 : col.rfind(")")].strip()
            aggs.append(("count", inner or None))
            continue
        for func in ("avg", "sum", "min", "max"):
            prefix = f"{func}("
            if lowered.startswith(prefix) and lowered.endswith(")"):
                target = col[col.find("(") + 1 : col.rfind(")")].strip()
                aggs.append((func, target or None))
                break
        else:
            plain.append(col)
    return plain, aggs


def find_next_keyword(text: str) -> Optional[Tuple[int, str]]:
    candidates = [" group by ", " order by ", " limit ", " with ", " where "]
    positions = [(text.find(kw), kw) for kw in candidates if text.find(kw) != -1]
    if not positions:
        return None
    return min(positions, key=lambda item: item[0])


def extract_clause(prefix: str, original: str, lower: str) -> Tuple[str, str, str]:
    prefix_len = len(prefix)
    original = original[prefix_len:]
    lower = lower[prefix_len:]
    next_kw = find_next_keyword(lower)
    if next_kw:
        idx = next_kw[0]
        clause = original[:idx].strip()
        original = original[idx:].lstrip()
        lower = lower[idx:].lstrip()
    else:
        clause = original.strip()
        original = ""
        lower = ""
    return clause, original, lower


def map_field(label: str) -> Optional[Dict[str, str]]:
    return FIELD_MAP.get(label.lower().strip())


def parse_filters(question: str, segment: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    filters: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    if not segment:
        return filters, warnings
    segment = segment.strip().rstrip('.')
    clauses = [cl.strip() for cl in re.split(r'\s+and\s+', segment, flags=re.IGNORECASE) if cl.strip()]
    pattern = re.compile(
        r'^(?P<field>[A-Za-z0-9\s]+?)\s+(?P<op>contains|does not contain|equals|is greater than|is less than|starts with)\s+"(?P<val>[^"]+)"$',
        flags=re.IGNORECASE,
    )
    for clause in clauses:
        match = pattern.match(clause)
        if not match:
            pos = question.lower().find(clause.lower())
            raise ParseError(f"Unsupported clause '{clause}'", max(pos, 0))
        field_label = match.group('field').strip()
        field_meta = map_field(field_label)
        if not field_meta:
            pos = question.lower().find(field_label.lower())
            raise ParseError(f"Unknown field '{field_label}'", max(pos, 0))
        op = match.group('op').lower()
        value = match.group('val')
        filters.append({
            "field": field_meta,
            "label": field_label,
            "op": op,
            "value": value,
        })
        if op == "contains" and field_meta["type"] == "number":
            pos = question.lower().find(clause.lower())
            warnings.append(
                {
                    "message": f"Using 'contains' with numeric field '{field_label}' may return unexpected results.",
                    "start": max(pos, 0),
                    "end": max(pos, 0) + len(clause),
                }
            )
    return filters, warnings


def parse_scope(segment: str) -> Tuple[str, Optional[str]]:
    lowered = segment.lower()
    if lowered.startswith("group "):
        name = segment[len("group "):].strip()
        if name.startswith('"') and name.endswith('"'):
            name = name[1:-1]
        return "group", GROUP_ALIASES.get(name.lower(), name)
    return "all", None


def parse_question(question: str) -> ParsedQuery:
    cleaned = question.strip()
    lowered = cleaned.lower()
    if not lowered.startswith("get "):
        raise ParseError("Questions must start with 'Get'.", 0)
    idx_from = lowered.find(" from ")
    if idx_from == -1:
        raise ParseError("Include a scope using 'from'.", lowered.find("get"))
    columns_segment = cleaned[4:idx_from].strip()
    remainder_original = cleaned[idx_from + len(" from "):].strip()
    remainder_lower = lowered[idx_from + len(" from "):].strip()
    if not remainder_original:
        raise ParseError("Provide a scope after 'from'.", idx_from)

    columns, aggregations = parse_columns(columns_segment)

    next_kw = find_next_keyword(remainder_lower)
    if next_kw:
        scope_segment = remainder_original[: next_kw[0]].strip()
        tail_original = remainder_original[next_kw[0]:].lstrip()
        tail_lower = remainder_lower[next_kw[0]:].lstrip()
    else:
        scope_segment = remainder_original
        tail_original = ""
        tail_lower = ""

    scope_type, scope_value = parse_scope(scope_segment)

    filters: List[Dict[str, Any]] = []
    warnings: List[Dict[str, Any]] = []
    group_by: Optional[str] = None
    order_by: Optional[str] = None
    order_dir = "asc"
    limit: Optional[int] = None

    while tail_original:
        lower_tail = tail_lower.lower()
        if lower_tail.startswith("group by "):
            clause, tail_original, tail_lower = extract_clause("group by ", tail_original, tail_lower)
            if not clause:
                raise ParseError("Group by requires a column.", question.lower().find("group by"))
            if not map_field(clause):
                pos = question.lower().find(clause.lower())
                raise ParseError(f"Unknown group by column '{clause}'", max(pos, 0))
            group_by = clause
            continue
        if lower_tail.startswith("order by "):
            clause, tail_original, tail_lower = extract_clause("order by ", tail_original, tail_lower)
            tokens = clause.split()
            if not tokens:
                raise ParseError("Order by requires a column.", question.lower().find("order by"))
            if tokens[-1].lower() in {"asc", "desc"}:
                order_dir = tokens[-1].lower()
                tokens = tokens[:-1]
            order_by = " ".join(tokens)
            if not map_field(order_by):
                pos = question.lower().find(order_by.lower())
                raise ParseError(f"Unknown order by column '{order_by}'", max(pos, 0))
            continue
        if lower_tail.startswith("limit "):
            clause, tail_original, tail_lower = extract_clause("limit ", tail_original, tail_lower)
            try:
                limit = int(clause.split()[0])
            except (ValueError, IndexError) as exc:
                pos = question.lower().find("limit")
                raise ParseError("Limit must be a number.", max(pos, 0)) from exc
            continue
        if lower_tail.startswith("with "):
            clause, tail_original, tail_lower = extract_clause("with ", tail_original, tail_lower)
            filt, warn = parse_filters(question, clause)
            filters.extend(filt)
            warnings.extend(warn)
            continue
        if lower_tail.startswith("where "):
            clause, tail_original, tail_lower = extract_clause("where ", tail_original, tail_lower)
            filt, warn = parse_filters(question, clause)
            filters.extend(filt)
            warnings.extend(warn)
            continue
        pos = question.lower().find(tail_original.lower())
        raise ParseError(f"Unsupported clause near '{tail_original[:20]}'", max(pos, 0))

    return ParsedQuery(
        columns=columns,
        aggregations=aggregations,
        scope_type=scope_type,
        scope_value=scope_value,
        filters=filters,
        warnings=warnings,
        group_by=group_by,
        order_by=order_by,
        order_dir=order_dir,
        limit=limit,
    )


# ---------------------------------------------------------------------------
# Evaluation helpers


def apply_scope(rows: List[Dict[str, Any]], query: ParsedQuery) -> List[Dict[str, Any]]:
    if query.scope_type == "group" and query.scope_value:
        return [row for row in rows if row.get("group_name") == query.scope_value]
    return rows


def matches_filter(row: Dict[str, Any], filt: Dict[str, Any]) -> bool:
    field_meta = filt["field"]
    value = row.get(field_meta["key"])
    if value is None:
        return False
    text_value = str(value)
    op = filt["op"]
    target = filt["value"]
    if op == "contains":
        return target.lower() in text_value.lower()
    if op == "does not contain":
        return target.lower() not in text_value.lower()
    if op == "equals":
        return text_value.lower() == target.lower()
    if op == "starts with":
        return text_value.lower().startswith(target.lower())
    if op == "is greater than":
        try:
            return float(value) > float(target)
        except (TypeError, ValueError):
            return False
    if op == "is less than":
        try:
            return float(value) < float(target)
        except (TypeError, ValueError):
            return False
    return False


def apply_filters(rows: List[Dict[str, Any]], query: ParsedQuery) -> List[Dict[str, Any]]:
    current = rows
    for filt in query.filters:
        current = [row for row in current if matches_filter(row, filt)]
    return current


def resolve_value(row: Dict[str, Any], column: str) -> Any:
    meta = map_field(column)
    if not meta:
        raise ParseError(f"Unknown column '{column}'", 0)
    value = row.get(meta["key"])
    if isinstance(value, float):
        return round(value, 3)
    return value


def exec_agg(func: str, arg: Optional[str], rows: List[Dict[str, Any]]) -> Any:
    func = func.lower()
    if func == "count":
        if arg:
            meta = map_field(arg)
            if not meta:
                raise ParseError(f"Unknown count column '{arg}'", 0)
            return sum(1 for row in rows if row.get(meta["key"]) is not None)
        return len(rows)
    if not arg:
        return None
    meta = map_field(arg)
    if not meta:
        raise ParseError(f"Unknown aggregation column '{arg}'", 0)
    values: List[float] = []
    for row in rows:
        try:
            values.append(float(row.get(meta["key"])) )
        except (TypeError, ValueError):
            continue
    if not values:
        return None
    if func == "min":
        return round(min(values), 3)
    if func == "max":
        return round(max(values), 3)
    if func == "avg":
        return round(sum(values) / len(values), 3)
    if func == "sum":
        return round(sum(values), 3)
    raise ParseError(f"Unsupported aggregation '{func}'", 0)


def build_table(rows: List[Dict[str, Any]], query: ParsedQuery) -> Tuple[List[str], List[List[Any]]]:
    headers = query.columns or ["Computer Name"]
    table: List[List[Any]] = []
    for row in rows:
        table.append([resolve_value(row, col) for col in headers])
    return headers, table


def build_aggregations(rows: List[Dict[str, Any]], query: ParsedQuery) -> Tuple[List[str], List[List[Any]]]:
    headers: List[str] = []
    if query.group_by:
        headers.append(query.group_by)
    if query.aggregations:
        for func, arg in query.aggregations:
            headers.append(f"{func}({arg or ''})".strip())
    else:
        headers.append("count()")

    if query.group_by:
        meta = map_field(query.group_by)
        assert meta is not None
        buckets: Dict[str, List[Dict[str, Any]]] = {}
        for row in rows:
            key = str(row.get(meta["key"]))
            buckets.setdefault(key, []).append(row)
        output: List[List[Any]] = []
        for key, bucket in buckets.items():
            record: List[Any] = [key]
            if query.aggregations:
                for func, arg in query.aggregations:
                    record.append(exec_agg(func, arg, bucket))
            else:
                record.append(len(bucket))
            output.append(record)
        return headers, output

    values: List[Any] = []
    if query.aggregations:
        for func, arg in query.aggregations:
            values.append(exec_agg(func, arg, rows))
    else:
        values.append(len(rows))
    return headers, [values]


def sort_rows(headers: List[str], rows: List[List[Any]], query: ParsedQuery) -> Tuple[List[str], List[List[Any]]]:
    if not query.order_by:
        return headers, rows
    try:
        idx = headers.index(query.order_by)
    except ValueError:
        return headers, rows
    reverse = query.order_dir == "desc"
    rows.sort(key=lambda record: record[idx], reverse=reverse)
    return headers, rows


def apply_limit(rows: List[List[Any]], limit: Optional[int]) -> List[List[Any]]:
    if limit is None:
        return rows
    return rows[:limit]


def to_csv(headers: List[str], rows: List[List[Any]]) -> str:
    from io import StringIO

    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# Saved question helpers


def load_saved() -> Dict[str, Any]:
    try:
        return json.loads(SAVED_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"saved": []}


def save_saved(payload: Dict[str, Any]) -> None:
    SAVED_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def add_saved(name: str, question: str) -> Dict[str, Any]:
    payload = load_saved()
    saved = payload.setdefault("saved", [])
    existing = next((item for item in saved if item["name"].lower() == name.lower()), None)
    entry = {
        "name": name,
        "question": question,
        "savedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if existing:
        existing.update(entry)
    else:
        saved.append(entry)
    save_saved(payload)
    return entry


def list_saved() -> List[Dict[str, Any]]:
    payload = load_saved()
    return payload.get("saved", [])


def find_saved(name: str) -> Optional[Dict[str, Any]]:
    for item in list_saved():
        if item["name"].lower() == name.lower():
            return item
    return None


# ---------------------------------------------------------------------------
# Evaluation entry point


def evaluate(question: str) -> Dict[str, Any]:
    parsed = parse_question(question)
    rows = load_rows()
    scoped = apply_scope(rows, parsed)
    filtered = apply_filters(scoped, parsed)
    if parsed.aggregations:
        headers, table = build_aggregations(filtered, parsed)
    else:
        headers, table = build_table(filtered, parsed)
    headers, table = sort_rows(headers, table, parsed)
    table = apply_limit(table, parsed.limit)
    return {
        "ok": True,
        "question": question,
        "headers": headers,
        "rows": table,
        "rowCount": len(table),
        "execution": {
            "scoped": len(scoped),
            "filtered": len(filtered),
        },
        "warnings": parsed.warnings,
        "metadata": {
            "aggregations": [func for func, _ in parsed.aggregations],
            "groupBy": parsed.group_by,
            "orderBy": parsed.order_by,
            "orderDir": parsed.order_dir,
            "limit": parsed.limit,
            "scope": parsed.scope_value or parsed.scope_type,
        },
    }


# ---------------------------------------------------------------------------
# CLI


def main(argv: Optional[List[str]] = None) -> int:
    ensure_resources()
    parser = argparse.ArgumentParser(description="Tanium simulator")
    parser.add_argument("-q", "--question", help="Question to evaluate")
    parser.add_argument("--json", action="store_true", help="Emit JSON output (default)")
    parser.add_argument("--save", metavar="NAME", help="Save question under NAME")
    parser.add_argument("--list-saved", action="store_true", help="List saved questions")
    parser.add_argument("--run-saved", metavar="NAME", help="Run a saved question")
    parser.add_argument("--out", choices=["csv"], help="Include CSV alongside JSON")
    parser.add_argument("--out-file", metavar="PATH", help="Write JSON payload to a path")
    args = parser.parse_args(argv)

    try:
        if args.list_saved:
            print(json.dumps({"ok": True, "saved": list_saved()}, ensure_ascii=False))
            return 0
        if args.run_saved:
            saved = find_saved(args.run_saved)
            if not saved:
                print(json.dumps({"ok": False, "error": f"No saved question named '{args.run_saved}'."}, ensure_ascii=False))
                return 0
            args.question = saved["question"]
        if not args.question:
            print(json.dumps({"ok": False, "error": "Provide a question with -q."}, ensure_ascii=False))
            return 0
        result = evaluate(args.question)
        if args.save:
            result["saved"] = add_saved(args.save, args.question)
        if args.out == "csv":
            result["csv"] = to_csv(result["headers"], result["rows"])
        if args.out_file:
            out_path = Path(args.out_file)
            if not out_path.is_absolute():
                out_path = DOWNLOADS_DIR / out_path
            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
            result["outputFile"] = str(out_path)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except ParseError as exc:
        payload = {
            "ok": False,
            "error": str(exc),
            "error_pos": getattr(exc, "position", 0),
            "question": args.question,
        }
        print(json.dumps(payload, ensure_ascii=False))
        return 0
    except Exception as exc:  # pylint: disable=broad-except
        print(json.dumps({"ok": False, "error": f"Simulator failure: {exc}"}, ensure_ascii=False))
        return 0


if __name__ == "__main__":
    sys.exit(main())
