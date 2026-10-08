#!/usr/bin/env python3
"""Look up New York law text in the Open US Law Parquet files.

Usage:
  python3 law_lookup.py DATA_DIR cite "N.Y. LLC Law § 206"
  python3 law_lookup.py DATA_DIR search "publication" [--law LLC] [--limit 10]
  python3 law_lookup.py DATA_DIR rule "22 NYCRR § 137.1"

DATA_DIR holds the us_ny_*.parquet files (download them from the
CHREGGIE/Datasets bucket or https://oss-data-us.vaquill.ai/v2026.09.1/).
Requires: pip install duckdb
"""
import argparse
import duckdb

FILES = ["us_ny_statutes", "us_ny_court_rules", "us_ny_guidance",
         "us_ny_ag_opinion", "us_ny_constitutions"]


def connect(data_dir):
    con = duckdb.connect()
    paths = ", ".join("'" + f"{data_dir}/{f}.parquet".replace("'", "''") + "'" for f in FILES)
    con.execute(f"create view law as select * from read_parquet([{paths}], union_by_name=true)")
    return con


def show(rows, max_chars):
    if not rows:
        print("NOT FOUND — treat the claim as unverified.")
    for cit, title, status, url, note, text in rows:
        print(f"## {cit} — {title or ''}")
        print(f"status: {status} | source: {url} | currency: {note or 'not stated'}")
        print(text[:max_chars] + ("…" if len(text) > max_chars else ""))
        print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("data_dir")
    ap.add_argument("mode", choices=["cite", "rule", "search"])
    ap.add_argument("query")
    ap.add_argument("--law", help="limit search to a code, e.g. LLC, GBS, LAB, JUD, TAX")
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--chars", type=int, default=3000)
    a = ap.parse_args()
    con = connect(a.data_dir)
    cols = "citation, section_title, act_status, source_url, currency_note, text"
    if a.mode in ("cite", "rule"):
        rows = con.execute(f"select {cols} from law where citation = ?", [a.query]).fetchall()
        if not rows:
            rows = con.execute(f"select {cols} from law where citation ilike ? limit ?",
                               [f"%{a.query}%", a.limit]).fetchall()
        show(rows, a.chars)
    else:
        sql = f"select {cols} from law where text ilike ?"
        params = [f"%{a.query}%"]
        if a.law:
            sql += " and citation ilike ?"
            params.append(f"N.Y. {a.law} Law §%")
        sql += " limit ?"
        params.append(a.limit)
        rows = con.execute(sql, params).fetchall()
        for cit, title, status, url, *_ in rows:
            print(f"{cit} | {title} | {status} | {url}")
        if not rows:
            print("No matches.")


if __name__ == "__main__":
    main()
