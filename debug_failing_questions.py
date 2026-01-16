#!/usr/bin/env python3
"""Debug script to investigate failing questions by checking RAG context."""

import requests
import json
import pandas as pd
from datetime import datetime

LIGHTRAG_URL = "http://localhost:9621/query"
CHAT_API_URL = "http://localhost:4000/api/chat"

SYSTEM_PROMPT = """You are an expert IFSCA (International Financial Services Centres Authority) regulatory assistant with deep knowledge of:
- TechFin Regulations 2025 and its Schedules (First, Second, Third)
- Ancillary Services Framework (2021 Circular, 2023 Circular, 2025 Amendments)
- FinTech Entity (FE) Framework 2022
- IFSCA FinTech Incentive Scheme 2022 and FAQs on Milestones
- Regulatory Sandbox and Innovation Sandbox frameworks

## RESPONSE GUIDELINES:

1. **Direct Answer First**: Always start with a clear "Yes" or "No" when the question requires it, followed by the explanation.

2. **Cite Specific Sources**: Reference exact regulation numbers, schedule names, circular dates, and section numbers. Examples:
   - "According to Regulation 20(3) of TechFin Regulations 2025..."
   - "As per the Third Schedule of TechFin Regulations 2025..."
   - "The February 2021 Circular states..."

3. **Multi-Hop Reasoning**: When answering requires connecting information from multiple documents:
   - Explicitly show your reasoning chain
   - Reference each document/regulation used
   - Example: "Step 1: The 2023 Circular classifies X as Ancillary. Step 2: The 2025 Regulations separate Ancillary from TechFin..."

4. **Temporal Awareness**: Be aware of regulatory evolution:
   - 2021 Circular → 2023 Circular → 2025 Regulations
   - Note when older circulars are repealed or superseded
   - Distinguish between "existing providers" vs "new applicants"

5. **Specific Facts**: When citing fees, amounts, timeframes, always include:
   - Exact figures (e.g., "USD 1,500 per annum", "INR 7.5 Million")
   - Specific timeframes (e.g., "within 10 business days", "12 months extendable to 24 months")

6. **Entity Distinctions**: Clearly distinguish between:
   - FinTech Entity (FE) vs Ancillary Service Provider
   - TechFin Provider vs Ancillary Service Provider
   - Regulatory Sandbox vs Innovation Sandbox
   - Domestic vs Foreign applicants

7. **Prohibited vs Permitted**: When discussing permissible activities:
   - Check the Third Schedule for prohibited/excluded services
   - Be explicit about what is NOT allowed

8. **Never Default to "I don't know"**: If context is provided, analyze it thoroughly. Only acknowledge limitations if the specific information is genuinely not in the provided context.

Base all answers strictly on the provided regulatory context."""

# Failing questions
FAILING_QUESTIONS = {
    10: {
        "question": "To claim the first 25% disbursement of the 'Listing Support Grant', what specific document must be submitted?",
        "expected": "Draft Offer Document. Milestone 1 (M1) for Listing Support Grant requires \"Submission of Draft Offer Document to IFSCA\"."
    },
    11: {
        "question": "What is the \"Application Fee\" for a Foreign FinTech Applicant seeking entry into the IFSCA Regulatory Sandbox?",
        "expected": "USD 100. (Source: FE Framework 2022, Annexure-VIII)."
    },
    16: {
        "question": "I have an \"In-Principle\" approval for the Listing Support Grant. What specific document must I submit to release the final payment (Milestone 2)?",
        "expected": "Proof of successful listing on the Stock Exchange. • Hop 1: Incentive Scheme identifies \"Listing Support Grant\".• Hop 2: FAQs on Milestones defines M2 for Listing Grant as \"Successful Listing\".• Hop 3: Document required is implied/stated as proof thereof."
    }
}

def get_rag_context(question: str) -> str:
    """Query LightRAG for context."""
    payload = {
        "query": question,
        "mode": "hybrid",
        "only_need_context": True
    }

    try:
        response = requests.post(LIGHTRAG_URL, json=payload, timeout=60)
        if response.ok:
            return response.json().get("response", "")
        else:
            return f"[RAG ERROR: {response.status_code}]"
    except Exception as e:
        return f"[RAG ERROR: {e}]"

def get_bot_response(question: str) -> str:
    """Get chatbot response."""
    payload = {
        "messages": [{"role": "user", "content": question}]
    }

    try:
        response = requests.post(CHAT_API_URL, json=payload, stream=True, timeout=180)

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

        return full_response
    except requests.exceptions.Timeout:
        return "[TIMEOUT]"
    except Exception as e:
        return f"[ERROR: {e}]"

def investigate_question(q_num: int, q_data: dict) -> dict:
    """Investigate a single failing question."""
    question = q_data["question"]
    expected = q_data["expected"]

    print(f"\n{'='*100}")
    print(f"INVESTIGATING QUESTION {q_num}")
    print(f"{'='*100}")
    print(f"\nQuestion: {question}")
    print(f"\nExpected Answer: {expected}")

    # Get RAG context
    print(f"\n{'-'*50}")
    print("FETCHING RAG CONTEXT...")
    print(f"{'-'*50}")
    rag_context = get_rag_context(question)
    print(f"\nRAG Context (first 5000 chars):\n{rag_context[:5000]}")
    if len(rag_context) > 5000:
        print(f"\n... [truncated, total length: {len(rag_context)} chars]")

    # Get bot response
    print(f"\n{'-'*50}")
    print("FETCHING BOT RESPONSE...")
    print(f"{'-'*50}")
    bot_response = get_bot_response(question)
    print(f"\nBot Response:\n{bot_response}")

    return {
        "question_num": q_num,
        "question": question,
        "expected_answer": expected,
        "rag_context": rag_context,
        "rag_context_length": len(rag_context),
        "bot_response": bot_response,
        "system_prompt": SYSTEM_PROMPT
    }

def main():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = f"evaluations/debug_failing_questions_{timestamp}.json"

    print("="*100)
    print("DEBUGGING FAILING QUESTIONS")
    print(f"Timestamp: {timestamp}")
    print("="*100)

    results = []

    for q_num, q_data in FAILING_QUESTIONS.items():
        result = investigate_question(q_num, q_data)
        results.append(result)

    # Save results to JSON
    output = {
        "timestamp": timestamp,
        "system_prompt": SYSTEM_PROMPT,
        "investigations": results
    }

    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n\n{'='*100}")
    print(f"Results saved to: {log_file}")
    print(f"{'='*100}")

    # Print summary
    print("\n\nSUMMARY OF RAG CONTEXT ANALYSIS:")
    print("-"*50)
    for result in results:
        q_num = result["question_num"]
        rag_len = result["rag_context_length"]
        has_expected_keywords = check_expected_keywords(q_num, result["rag_context"])
        print(f"Q{q_num}: RAG context length = {rag_len} chars")
        print(f"      Expected keywords found: {has_expected_keywords}")
        print()

def check_expected_keywords(q_num: int, rag_context: str) -> dict:
    """Check if expected keywords are present in RAG context."""
    rag_lower = rag_context.lower()

    keywords = {
        10: ["draft offer document", "m1", "milestone 1", "listing support", "25%"],
        11: ["usd 100", "$100", "foreign", "application fee", "sandbox", "annexure-viii", "annexure viii"],
        16: ["m2", "milestone 2", "listing", "successful listing", "proof", "stock exchange"]
    }

    found = {}
    for kw in keywords.get(q_num, []):
        found[kw] = kw.lower() in rag_lower

    return found

if __name__ == "__main__":
    main()
