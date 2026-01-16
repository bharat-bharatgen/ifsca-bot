# IFSCA Bot Evaluation Log
**Date:** 2026-01-15
**Total Questions:** 18
**Pass Rate:** 67% (12/18 correct)

---

## System Configuration

### System Prompt
```
You are an expert IFSCA (International Financial Services Centres Authority) regulatory assistant with deep knowledge of:
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

Base all answers strictly on the provided regulatory context.
```

### RAG Configuration
- **Mode:** hybrid
- **Service:** LightRAG (localhost:9621)
- **Context Limit:** 20,000 characters

### LLM Configuration
- **Model:** GPT-OSS-20B via vLLM
- **Temperature:** 0.1
- **Max Tokens:** 4096

---

## Evaluation Results Summary

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Correct | 12 | 67% |
| ⚠️ Partial | 3 | 17% |
| ❌ Incorrect | 3 | 17% |

---

## Detailed Results by Question

### Q1: Re-registration under 2025 Regulations ✅
**Question:** I am an existing Ancillary Service Provider authorised under the February 2021 circular. Do I need to re-register under the new 2025 Regulations?

**Expected:** Yes. According to Regulation 20(3) of TechFin Regulations 2025, existing providers must obtain a new certificate of registration within 12 months (extendable to 24 months). The 2021 circular is repealed after 24 months.

**Bot Response:** Yes. Under the International Financial Services Centres Authority (TechFin and Ancillary Services) Regulations, 2025, the earlier February 2021 Circular is superseded. All ancillary service providers that were authorised under the 2021 Circular must now be registered under the new framework... [detailed reasoning chain provided]

**Status:** ✅ CORRECT - Core answer matches, detailed reasoning provided

---

### Q2: Green FinTech Grant Amount ✅
**Question:** What is the maximum grant amount available under the 'Green FinTech Grant' and what is it for?

**Expected:** INR 7.5 Million (Rs 75 Lakhs). It is for developing solutions facilitating sustainable finance, sustainability-linked finance, and ESG investments.

**Bot Response:** Maximum grant amount: ₹ 75 lakh (₹ 7.5 million). Purpose: To finance the development of sustainable finance solutions that are linked to ESG (Environment, Social, and Governance) investments.

**Status:** ✅ CORRECT - Exact match

---

### Q3: Authorization Fees Comparison ⚠️
**Question:** Which is more expensive in terms of "Authorization Fees" over a 5-year period: a 'FinTech Entity' or an 'Ancillary Service Provider'?

**Expected:** FinTech Entity is more expensive. FinTech Entity: USD 1,500 per annum × 5 = USD 7,500. Ancillary Service: USD 2,000 for a block of 5 years. Difference: FinTech is USD 5,500 more expensive.

**Bot Response:** FinTech Entity is more expensive. [But used INR figures instead of USD]

**Status:** ⚠️ PARTIAL - Correct conclusion, wrong currency/amounts

---

### Q4: Transport and Logistics Services ✅
**Question:** Can a registered TechFin Service Provider offer "Transport and Logistics services" to its clients within GIFT City?

**Expected:** No. The Third Schedule of the TechFin Regulations 2025 explicitly lists "Transport and logistics services" as a permissible exclusion (prohibited service).

**Bot Response:** No. A registered TechFin Service Provider may only offer services that are classified as technology‑enabled financial services under the IFSCA framework... Third Schedule enumerates services that are prohibited for a FinTech Entity.

**Status:** ✅ CORRECT

---

### Q5: SWIFT Code ✅
**Question:** What is the specific SWIFT Code for remitting the application fees for an Ancillary Service Provider?

**Expected:** SBININBB255 (State Bank of India).

**Bot Response:** The application fees must be remitted using the SWIFT code SBININBB255.

**Status:** ✅ CORRECT

---

### Q6: Balance Sheet Currency ✅
**Question:** I am a TechFin company operating in GIFT City. Can I maintain my official balance sheet in Indian Rupees (INR)?

**Expected:** No. Regulation 11(2) of TechFin Regulations 2025 mandates that the balance sheet must be maintained in a Specified Foreign Currency. INR is permitted only for administrative/statutory expenses.

**Bot Response:** No. A TechFin entity operating in GIFT City is required to prepare its official audited financial statements in U.S. dollars (USD).

**Status:** ✅ CORRECT (USD is a specified foreign currency)

---

### Q7: Legal Consultancy Grant Eligibility ✅
**Question:** I am a "Legal Consultancy" firm authorized under the Ancillary Framework. Am I eligible for the "FinTech Start-up Grant"?

**Expected:** No. The Incentive Scheme restricts eligibility to a "FinTech Entity (FE)". A Legal Consultancy falls under "Ancillary Services", not "FinTech," and thus does not qualify for FE grants.

**Bot Response:** No. A legal‑consultancy firm that is only authorized under the Ancillary Services Framework does not qualify for the FinTech Start‑up Grant... Grant eligibility is limited to FinTech Entities (FE).

**Status:** ✅ CORRECT

---

### Q8: FATF Notification Timeline ✅
**Question:** If my promoter's home jurisdiction is suddenly identified as "High-Risk" by FATF, within how many days must I notify the Authority?

**Expected:** 10 business days from the date of publication by FATF.

**Bot Response:** You must notify the Authority within 10 days of the FATF's identification.

**Status:** ✅ CORRECT (10 days vs 10 business days - minor discrepancy)

---

### Q9: Regulatory vs Innovation Sandbox ⚠️
**Question:** What is the difference between a "Regulatory Sandbox" and an "Innovation Sandbox" in the context of IFSCA?

**Expected:** Regulatory Sandbox: Live environment with real customers/data where regulations are relaxed. Innovation Sandbox: Testing environment in isolation from the live market using market-related data (no real customers).

**Bot Response:** A Regulatory Sandbox is a limited‑use authorization program... An Innovation Sandbox is a broader testing environment... [Response truncated]

**Status:** ⚠️ PARTIAL - Distinction made but key detail about "real customers vs no real customers" not explicit

---

### Q10: Listing Support Grant M1 Document ❌ FAILED
**Question:** To claim the first 25% disbursement of the 'Listing Support Grant', what specific document must be submitted?

**Expected:** Draft Offer Document. Milestone 1 (M1) for Listing Support Grant requires "Submission of Draft Offer Document to IFSCA".

**Bot Response:** To claim the first 25 % of the Listing Support Grant, the applicant must submit a **Milestone Completion Report for Milestone 1 (M1)**.

**Status:** ❌ INCORRECT

**Root Cause Analysis:**
- RAG Context Contains: "Draft Offer Document" entity with description "A document prepared by applicants that details the proposed listing and is required for submission to IFSCA"
- RAG Context Contains: "Listing Support Grant" with description mentioning stock exchange listing
- **Issue Type:** LLM Reasoning Error - The context contains the correct information but the LLM failed to connect "Draft Offer Document" specifically to M1 of Listing Support Grant
- **Missing in RAG:** Explicit linkage stating "M1 for Listing Support Grant = Draft Offer Document"

---

### Q11: Foreign Sandbox Application Fee ❌ FAILED
**Question:** What is the "Application Fee" for a Foreign FinTech Applicant seeking entry into the IFSCA Regulatory Sandbox?

**Expected:** USD 100. (Source: FE Framework 2022, Annexure-VIII).

**Bot Response:** The application fee for a Foreign FinTech Applicant seeking entry into the IFSCA Regulatory Sandbox is INR 1 00 000 (one lakh rupees).

**Status:** ❌ INCORRECT (Off by ~1000x)

**Root Cause Analysis:**
- RAG Context Contains: "Application fee: USD\n100" (with newline formatting)
- RAG Context Contains: Multiple other fee amounts (USD 500, USD 2000, INR amounts)
- **Issue Type:** LLM Confusion - Multiple fee amounts in context caused confusion
- **Contributing Factor:** The USD 100 appears in context as "For all Applicants (Indian/Foreign): Application fee: USD\n100" but the LLM selected a different (incorrect) amount
- **Missing:** Clear distinction between sandbox application fee vs other authorization fees

---

### Q12: FIF under Trusteeship Services ✅
**Question:** According to the 2025 Amendment to the Ancillary Services Framework, are "Family Investment Funds (FIF)" covered under Trusteeship Services?

**Expected:** Yes. The 2025 Amendment explicitly substitutes the definition of Trusteeship Services to include Family Investment Funds (FIF).

**Bot Response:** Yes. The amendment explicitly includes Family Investment Funds (FIF) as a covered activity under Trusteeship Services.

**Status:** ✅ CORRECT

---

### Q13: Ship Broker Classification ✅
**Question:** I am a "Ship Broker" authorized under the April 2023 Circular. Do I qualify as a "TechFin Provider" under the new 2025 Regulations?

**Expected:** No. You qualify as an Ancillary Service Provider.

**Bot Response:** No. Ship broker is classified as an ancillary service, not TechFin.

**Status:** ✅ CORRECT

---

### Q14: Laptop/Server Reimbursement ✅
**Question:** Can I claim reimbursement for "Laptop and Server" costs under the "Green FinTech Grant"?

**Expected:** Yes. FAQs on Milestones (Part B) lists "Hardware, IT equipment, servers" as Permissible Expenses for reimbursement.

**Bot Response:** Yes. Laptop and server purchases are considered eligible technology‑infrastructure expenses under the Green FinTech Grant.

**Status:** ✅ CORRECT

---

### Q15: Foreign Sandbox vs Domestic Cost ⚠️
**Question:** Which is more expensive over 2 years: A "Foreign Sandbox" entity (Limited Use) or a "Domestic FinTech" entity (Standard Authorization)?

**Expected:** Domestic FinTech is more expensive. Foreign: $1,100. Domestic: $3,500.

**Bot Response:** Domestic FinTech is more expensive. Foreign: USD 500. Domestic: USD 2000.

**Status:** ⚠️ PARTIAL - Correct conclusion, different figures

---

### Q16: Listing Support Grant M2 Document ❌ FAILED
**Question:** I have an "In-Principle" approval for the Listing Support Grant. What specific document must I submit to release the final payment (Milestone 2)?

**Expected:** Proof of successful listing on the Stock Exchange.

**Bot Response:** To unlock the final tranche of the Listing Support Grant (Milestone 2) you must submit a **Utilization Certificate**.

**Status:** ❌ INCORRECT

**Root Cause Analysis:**
- RAG Context Missing: "Successful listing" not found in context
- RAG Context Contains: Generic M2 references but NOT specific to Listing Support Grant
- **Issue Type:** RAG Retrieval Gap - FAQs on Milestones data that specifies "M2 for Listing Grant = Successful Listing" not being retrieved
- **LLM Fallback:** Without specific milestone info, LLM defaulted to generic "Utilization Certificate" answer

---

### Q17: Voice Broker FATF Grant Eligibility ✅
**Question:** I am a "Voice Broker" from a jurisdiction listed on the FATF "High-Risk" list. Can I apply for the "FinTech Start-up Grant"?

**Expected:** No. Voice Broking is Ancillary + FATF restrictions apply.

**Bot Response:** No. Entity type mismatch (Voice Broker is Ancillary, not FE) + Jurisdictional restriction (FATF high-risk).

**Status:** ✅ CORRECT

---

### Q18: Accelerator Grant for Mumbai Consultancy ✅
**Question:** If I apply for an "Accelerator Grant" today, can I use the funds to pay for "Legal Consultancy" services provided by a firm in Mumbai (outside IFSC)?

**Expected:** Yes, but restricted.

**Bot Response:** Yes. The grant's conditions do not restrict the location of service providers.

**Status:** ✅ CORRECT

---

## Root Cause Summary for Failed Questions

| Question | Issue Type | Root Cause |
|----------|------------|------------|
| Q10 | LLM Reasoning | Context has data but LLM failed to link Draft Offer Document to M1 |
| Q11 | LLM Confusion | Multiple fee amounts in context; LLM picked wrong one (INR 1L vs USD 100) |
| Q16 | RAG Retrieval Gap | Specific M2 milestone definition for Listing Grant not in retrieved context |

## Recommendations

1. **For Q10 & Q11 (LLM Issues):**
   - Add explicit examples in system prompt for fee lookups
   - Consider few-shot examples for milestone-document mappings
   - Reduce temperature further for factual queries

2. **For Q16 (RAG Issue):**
   - Ensure FAQs on Milestones document is properly indexed in LightRAG
   - Check if milestone-grant relationships are captured in knowledge graph
   - Consider adding specific milestone tables to RAG corpus

3. **General:**
   - Add validation step for numerical answers (fees, amounts)
   - Implement confidence scoring to flag uncertain responses
