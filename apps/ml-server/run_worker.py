#!/usr/bin/env python3
"""Launcher for the AI pipeline worker. Run from apps/ml-server: python run_worker.py"""
import os
import sys

# Unbuffer stdout/stderr so logs show immediately (e.g. under uv run)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(line_buffering=True)
print("Starting AI pipeline worker...", flush=True)

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# Ensure src is on path so "services" resolves
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
print("Loading worker module...", flush=True)

from worker import run_worker

if __name__ == "__main__":
    run_worker()
