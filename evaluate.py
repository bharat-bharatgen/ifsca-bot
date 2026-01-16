#!/usr/bin/env python3
"""
IFSCA LightRAG Evaluation Script

Usage:
    python3 evaluate.py                              # Run all questions with defaults
    python3 evaluate.py --mode hybrid                # Use hybrid mode (default)
    python3 evaluate.py --mode local                 # Use local mode
    python3 evaluate.py --mode global                # Use global mode
    python3 evaluate.py --mode naive                 # Use naive mode
    python3 evaluate.py --mode mix                   # Use mix mode
    python3 evaluate.py --top-k 10                   # Set top_k parameter
    python3 evaluate.py --compare                    # Compare all modes
    python3 evaluate.py 0 5                          # Run questions 1-5
    python3 evaluate.py --output results             # Save to evaluations/results.txt
"""

import requests
import json
import pandas as pd
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

# Configuration
LIGHTRAG_URL = "http://localhost:9621/query"
CHAT_API_URL = "http://localhost:4000/api/chat"
EVAL_FILE = Path(__file__).parent / "evaluations" / "IFSCA_Chatbot_GUI-based_Manual_Eval_02jan26_eval.xlsx"
OUTPUT_DIR = Path(__file__).parent / "evaluations"
TIMEOUT_SECONDS = 120


def normalize_text(text: str) -> str:
    """Normalize Unicode characters to ASCII equivalents."""
    replacements = {
        '"': '"', '"': '"',
        ''': "'", ''': "'",
        '–': '-', '—': '-',
        '…': '...',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def query_lightrag(
    question: str,
    mode: str = 'hybrid',
    only_need_context: bool = False,
    top_k: Optional[int] = None,
    top_chunk_k: Optional[int] = None,
    max_token_for_text_unit: Optional[int] = None,
    max_token_for_local_context: Optional[int] = None,
    max_token_for_global_context: Optional[int] = None,
) -> Dict[str, Any]:
    """Query LightRAG directly with configurable parameters."""
    question = normalize_text(question)

    payload = {
        "query": question,
        "mode": mode,
        "only_need_context": only_need_context,
    }

    # Add optional parameters
    if top_k is not None:
        payload["top_k"] = top_k
    if top_chunk_k is not None:
        payload["chunk_top_k"] = top_chunk_k
    if max_token_for_text_unit is not None:
        payload["max_token_for_text_unit"] = max_token_for_text_unit
    if max_token_for_local_context is not None:
        payload["max_token_for_local_context"] = max_token_for_local_context
    if max_token_for_global_context is not None:
        payload["max_token_for_global_context"] = max_token_for_global_context

    start_time = datetime.now()

    try:
        response = requests.post(LIGHTRAG_URL, json=payload, timeout=TIMEOUT_SECONDS)
        latency_ms = (datetime.now() - start_time).total_seconds() * 1000

        if response.ok:
            result = response.json()
            return {
                "response": result.get("response", ""),
                "success": True,
                "latency_ms": latency_ms,
                "config": payload,
            }
        else:
            return {
                "response": f"[ERROR: {response.status_code}] {response.text}",
                "success": False,
                "latency_ms": latency_ms,
                "config": payload,
            }
    except requests.exceptions.Timeout:
        return {
            "response": "[TIMEOUT]",
            "success": False,
            "latency_ms": TIMEOUT_SECONDS * 1000,
            "config": payload,
        }
    except requests.exceptions.ConnectionError:
        return {
            "response": "[CONNECTION ERROR - Is LightRAG running on port 9621?]",
            "success": False,
            "latency_ms": 0,
            "config": payload,
        }
    except Exception as e:
        return {
            "response": f"[ERROR: {e}]",
            "success": False,
            "latency_ms": 0,
            "config": payload,
        }


def query_chatbot(question: str) -> Dict[str, Any]:
    """Query the chatbot API (for comparison)."""
    question = normalize_text(question)

    payload = {
        "messages": [{"role": "user", "content": question}]
    }

    start_time = datetime.now()

    try:
        response = requests.post(CHAT_API_URL, json=payload, stream=True, timeout=TIMEOUT_SECONDS)

        full_response = ""
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('0:'):
                    try:
                        text = json.loads(line_str[2:])
                        if isinstance(text, str):
                            full_response += text
                    except json.JSONDecodeError:
                        pass

        latency_ms = (datetime.now() - start_time).total_seconds() * 1000

        return {
            "response": full_response.strip() if full_response else "[EMPTY RESPONSE]",
            "success": bool(full_response),
            "latency_ms": latency_ms,
            "config": {"source": "chatbot"},
        }

    except requests.exceptions.Timeout:
        return {"response": "[TIMEOUT]", "success": False, "latency_ms": TIMEOUT_SECONDS * 1000, "config": {}}
    except requests.exceptions.ConnectionError:
        return {"response": "[CONNECTION ERROR]", "success": False, "latency_ms": 0, "config": {}}
    except Exception as e:
        return {"response": f"[ERROR: {e}]", "success": False, "latency_ms": 0, "config": {}}


def format_result(idx: int, question: str, expected: str, result: Dict[str, Any], mode: str = "") -> str:
    """Format a single test result."""
    response = result["response"]
    latency = result.get("latency_ms", 0)
    mode_str = f" [{mode}]" if mode else ""

    return f"""
{'='*80}
Question {idx + 1}{mode_str}:
{'='*80}
{question}

{'-'*40}
Expected Answer:
{'-'*40}
{expected}

{'-'*40}
LightRAG Response (latency: {latency:.0f}ms):
{'-'*40}
{response[:2000] if len(response) > 2000 else response}

{'='*80}

"""


def run_evaluation(
    start_idx: int = 0,
    end_idx: Optional[int] = None,
    output_file: Optional[str] = None,
    mode: str = 'hybrid',
    top_k: Optional[int] = None,
    top_chunk_k: Optional[int] = None,
    use_chatbot: bool = False,
):
    """Run evaluation on specified questions."""

    if not EVAL_FILE.exists():
        print(f"Error: Evaluation file not found: {EVAL_FILE}")
        sys.exit(1)

    df = pd.read_excel(EVAL_FILE)
    total_questions = len(df)

    if end_idx is None:
        end_idx = total_questions

    end_idx = min(end_idx, total_questions)

    source = "Chatbot API" if use_chatbot else "LightRAG API"
    print(f"{'='*80}")
    print(f"IFSCA Evaluation - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")
    print(f"Source: {source}")
    if not use_chatbot:
        print(f"Mode: {mode}")
        if top_k:
            print(f"top_k: {top_k}")
        if top_chunk_k:
            print(f"top_chunk_k: {top_chunk_k}")
    print(f"Questions: {start_idx + 1} to {end_idx} (of {total_questions})")
    print(f"Timeout: {TIMEOUT_SECONDS}s per question")
    print("-" * 80)

    results = []
    total_latency = 0
    success_count = 0

    for idx in range(start_idx, end_idx):
        row = df.iloc[idx]
        question = str(row['Question'])
        expected = str(row['Probable Answer'])

        print(f"[{idx + 1}/{end_idx}] Processing...", end=" ", flush=True)

        if use_chatbot:
            result = query_chatbot(question)
        else:
            result = query_lightrag(
                question,
                mode=mode,
                top_k=top_k,
                top_chunk_k=top_chunk_k,
            )

        status = "OK" if result["success"] and not result["response"].startswith("[") else "ISSUE"
        if result["success"]:
            success_count += 1
        total_latency += result.get("latency_ms", 0)

        print(f"{status} ({result.get('latency_ms', 0):.0f}ms)")

        formatted = format_result(idx, question, expected, result, mode if not use_chatbot else "chatbot")
        results.append({
            "idx": idx,
            "question": question,
            "expected": expected,
            "response": result["response"],
            "success": result["success"],
            "latency_ms": result.get("latency_ms", 0),
            "formatted": formatted,
        })
        print(formatted)

    # Print summary
    avg_latency = total_latency / (end_idx - start_idx) if (end_idx - start_idx) > 0 else 0
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total Questions: {end_idx - start_idx}")
    print(f"Successful: {success_count}")
    print(f"Failed: {end_idx - start_idx - success_count}")
    print(f"Average Latency: {avg_latency:.0f}ms")
    print(f"Total Time: {total_latency/1000:.1f}s")

    # Save results if output file specified
    if output_file:
        output_path = OUTPUT_DIR / f"{output_file}.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"Evaluation Run: {datetime.now().isoformat()}\n")
            f.write(f"Source: {source}\n")
            if not use_chatbot:
                f.write(f"Mode: {mode}\n")
            f.write(f"Questions: {start_idx + 1} to {end_idx}\n")
            f.write(f"Average Latency: {avg_latency:.0f}ms\n")
            f.write("=" * 80 + "\n")
            for r in results:
                f.write(r["formatted"])
        print(f"\nResults saved to: {output_path}")

    return results


def compare_modes(
    start_idx: int = 0,
    end_idx: Optional[int] = None,
    output_file: Optional[str] = None,
    modes: Optional[list] = None,
):
    """Compare different LightRAG modes on the same questions."""

    if modes is None:
        modes = ['hybrid', 'local', 'global', 'naive']

    if not EVAL_FILE.exists():
        print(f"Error: Evaluation file not found: {EVAL_FILE}")
        sys.exit(1)

    df = pd.read_excel(EVAL_FILE)
    total_questions = len(df)

    if end_idx is None:
        end_idx = total_questions

    end_idx = min(end_idx, total_questions)

    print(f"{'='*80}")
    print(f"IFSCA Mode Comparison - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")
    print(f"Modes: {', '.join(modes)}")
    print(f"Questions: {start_idx + 1} to {end_idx} (of {total_questions})")
    print("-" * 80)

    all_results = {mode: [] for mode in modes}
    mode_stats = {mode: {"total_latency": 0, "success_count": 0} for mode in modes}

    for idx in range(start_idx, end_idx):
        row = df.iloc[idx]
        question = str(row['Question'])
        expected = str(row['Probable Answer'])

        print(f"\n[Q{idx + 1}] {question[:60]}...")

        for mode in modes:
            print(f"  [{mode:8}] ", end="", flush=True)
            result = query_lightrag(question, mode=mode)

            status = "OK" if result["success"] and not result["response"].startswith("[") else "ISSUE"
            latency = result.get("latency_ms", 0)
            resp_len = len(result["response"])

            print(f"{status} | {latency:6.0f}ms | {resp_len:5} chars")

            all_results[mode].append({
                "idx": idx,
                "question": question,
                "expected": expected,
                "response": result["response"],
                "success": result["success"],
                "latency_ms": latency,
            })

            mode_stats[mode]["total_latency"] += latency
            if result["success"] and not result["response"].startswith("["):
                mode_stats[mode]["success_count"] += 1

    # Print comparison summary
    num_questions = end_idx - start_idx
    print(f"\n{'='*80}")
    print("MODE COMPARISON SUMMARY")
    print(f"{'='*80}")
    print(f"{'Mode':<10} | {'Success':>8} | {'Avg Latency':>12} | {'Total Time':>12}")
    print("-" * 50)
    for mode in modes:
        stats = mode_stats[mode]
        avg_latency = stats["total_latency"] / num_questions if num_questions > 0 else 0
        success_rate = f"{stats['success_count']}/{num_questions}"
        print(f"{mode:<10} | {success_rate:>8} | {avg_latency:>10.0f}ms | {stats['total_latency']/1000:>10.1f}s")

    # Save results if output file specified
    if output_file:
        output_path = OUTPUT_DIR / f"{output_file}.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"Mode Comparison: {datetime.now().isoformat()}\n")
            f.write(f"Modes: {', '.join(modes)}\n")
            f.write(f"Questions: {start_idx + 1} to {end_idx}\n")
            f.write("=" * 80 + "\n\n")

            for idx in range(start_idx, end_idx):
                row = df.iloc[idx]
                question = str(row['Question'])
                expected = str(row['Probable Answer'])

                f.write(f"{'='*80}\n")
                f.write(f"Question {idx + 1}:\n")
                f.write(f"{'='*80}\n")
                f.write(f"{question}\n\n")
                f.write(f"Expected: {expected}\n\n")

                for mode in modes:
                    result = all_results[mode][idx - start_idx]
                    f.write(f"--- {mode.upper()} ({result['latency_ms']:.0f}ms) ---\n")
                    f.write(f"{result['response'][:1000]}\n\n")

                f.write("\n")

            # Summary
            f.write(f"\n{'='*80}\n")
            f.write("SUMMARY\n")
            f.write(f"{'='*80}\n")
            for mode in modes:
                stats = mode_stats[mode]
                avg_latency = stats["total_latency"] / num_questions if num_questions > 0 else 0
                f.write(f"{mode}: {stats['success_count']}/{num_questions} success, {avg_latency:.0f}ms avg\n")

        print(f"\nResults saved to: {output_path}")

    return all_results, mode_stats


def main():
    parser = argparse.ArgumentParser(
        description="IFSCA LightRAG Evaluation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 evaluate.py --all                    # Run all with hybrid mode
    python3 evaluate.py --all --mode local       # Run all with local mode
    python3 evaluate.py --compare                # Compare all modes
    python3 evaluate.py --compare --modes hybrid local  # Compare specific modes
    python3 evaluate.py 0 5 --mode global        # Run Q1-5 with global mode
    python3 evaluate.py --chatbot                # Use chatbot API instead
        """
    )
    parser.add_argument("start", nargs="?", type=int, default=0, help="Start question index (0-based)")
    parser.add_argument("end", nargs="?", type=int, default=None, help="End question index (exclusive)")
    parser.add_argument("--output", "-o", type=str, help="Output filename (saved to evaluations/)")
    parser.add_argument("--all", "-a", action="store_true", help="Run all questions")
    parser.add_argument("--mode", "-m", type=str, default="hybrid",
                        choices=['local', 'global', 'hybrid', 'naive', 'mix'],
                        help="LightRAG query mode (default: hybrid)")
    parser.add_argument("--top-k", type=int, help="top_k parameter for retrieval")
    parser.add_argument("--top-chunk-k", type=int, help="top_chunk_k parameter for retrieval")
    parser.add_argument("--compare", "-c", action="store_true", help="Compare all modes")
    parser.add_argument("--modes", nargs="+", help="Modes to compare (use with --compare)")
    parser.add_argument("--chatbot", action="store_true", help="Use chatbot API instead of LightRAG directly")

    args = parser.parse_args()

    # Determine question range
    if args.all or args.compare:
        start_idx = 0
        end_idx = None
    elif args.end is None and args.start is not None:
        start_idx = args.start
        end_idx = args.start + 1
    else:
        start_idx = args.start
        end_idx = args.end

    # Auto-generate output filename
    output_file = args.output
    if (args.all or args.compare) and not output_file:
        mode_suffix = "compare" if args.compare else args.mode
        output_file = f"eval_{mode_suffix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Run evaluation
    if args.compare:
        modes = args.modes if args.modes else ['hybrid', 'local', 'global', 'naive']
        compare_modes(start_idx, end_idx, output_file, modes)
    else:
        run_evaluation(
            start_idx,
            end_idx,
            output_file,
            mode=args.mode,
            top_k=args.top_k,
            top_chunk_k=args.top_chunk_k,
            use_chatbot=args.chatbot,
        )


if __name__ == "__main__":
    main()
