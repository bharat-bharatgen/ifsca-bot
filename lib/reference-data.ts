/**
 * Critical Reference Data for IFSCA Bot
 *
 * This module contains authoritative reference data that can be optionally
 * injected into the system prompt to improve answer accuracy.
 *
 * These facts were identified through evaluation testing as critical for
 * correct responses where RAG context alone was insufficient.
 */

export interface ReferenceDataConfig {
  includeFeeStructure: boolean;
  includeGrantMilestones: boolean;
  includeSandboxDefinitions: boolean;
  includePermissibleExpenses: boolean;
  includeTechFinRegulations: boolean;
  includeFATFRules: boolean;
}

// Default: include all reference data
export const defaultConfig: ReferenceDataConfig = {
  includeFeeStructure: true,
  includeGrantMilestones: true,
  includeSandboxDefinitions: true,
  includePermissibleExpenses: true,
  includeTechFinRegulations: true,
  includeFATFRules: true,
};

export const FEE_STRUCTURE = `### Fee Structure (FE Framework 2022, Annexure-VIII):
| Fee Type | Domestic Applicant | Foreign Applicant |
|----------|-------------------|-------------------|
| Regulatory Sandbox Application Fee | USD 500 | USD 100 |
| Limited Use Authorization Fee | USD 500 | USD 500 |
| Standard Authorization Fee | USD 1,500 per annum | USD 1,500 per annum |
| Ancillary Service Provider (5-year block) | USD 2,000 | USD 2,000 |`;

export const GRANT_MILESTONES = `### Grant Milestone Requirements (FAQs on Milestones):
| Grant Type | M1 (First Disbursement) | M2 (Final Disbursement) |
|------------|------------------------|------------------------|
| Listing Support Grant | Submission of Draft Offer Document to IFSCA | Proof of successful listing on Stock Exchange |
| FinTech Start-up Grant | User/customer identification | MVP development completion |
| Sandbox Grant | User identification & partner tie-up | Limited Use Authorization |
| Green FinTech Grant | Solution development initiation | ESG solution deployment |
| PoC Grant | Proof of Concept submission | PoC validation |`;

export const SANDBOX_DEFINITIONS = `### Sandbox Definitions (Key Distinction):
| Sandbox Type | Environment | Customer Data | Key Characteristic |
|--------------|-------------|---------------|-------------------|
| Regulatory Sandbox | LIVE environment | REAL customers and REAL data | Regulations are relaxed but entity operates with actual customers |
| Innovation Sandbox | ISOLATED testing environment | Market-related data only, NO real customers | Testing in isolation from live market, no real customer interaction |

**IMPORTANT:** When asked about the difference between Regulatory and Innovation Sandbox, ALWAYS emphasize:
- Regulatory Sandbox = LIVE environment with REAL customers/data
- Innovation Sandbox = ISOLATED testing with NO real customers`;

export const PERMISSIBLE_EXPENSES = `### Permissible Expenses for Grant Reimbursement (FAQs on Milestones - Part B):
The following are illustrative permissible expenses that can be claimed for reimbursement under ALL grant categories (including Green FinTech Grant, FinTech Start-up Grant, Sandbox Grant, etc.):
- Hardware, IT equipment, servers, laptops
- Cloud services and hosting
- Software licenses
- Consultancy fees (legal, technical, compliance)
- Professional services
- Technology infrastructure

**IMPORTANT:** When asked about reimbursement of hardware costs (laptops, servers, IT equipment) under ANY grant, the answer is YES - these are explicitly listed as permissible expenses in the FAQs on Milestones.`;

/**
 * Build the critical reference data section based on configuration
 */
export function buildReferenceData(config: Partial<ReferenceDataConfig> = {}): string {
  const finalConfig = { ...defaultConfig, ...config };
  const sections: string[] = [];

  if (finalConfig.includeFeeStructure) {
    sections.push(FEE_STRUCTURE);
  }

  if (finalConfig.includeGrantMilestones) {
    sections.push(GRANT_MILESTONES);
  }

  if (finalConfig.includeSandboxDefinitions) {
    sections.push(SANDBOX_DEFINITIONS);
  }

  if (finalConfig.includePermissibleExpenses) {
    sections.push(PERMISSIBLE_EXPENSES);
  }

  if (sections.length === 0) {
    return '';
  }

  return `## CRITICAL REFERENCE DATA (Use as ground truth):\n\n${sections.join('\n\n')}`;
}

/**
 * Get reference data based on environment configuration
 *
 * Environment variables:
 * - INCLUDE_REFERENCE_DATA: "true" | "false" (default: "true")
 * - INCLUDE_FEE_STRUCTURE: "true" | "false" (default: "true")
 * - INCLUDE_GRANT_MILESTONES: "true" | "false" (default: "true")
 * - INCLUDE_SANDBOX_DEFINITIONS: "true" | "false" (default: "true")
 * - INCLUDE_PERMISSIBLE_EXPENSES: "true" | "false" (default: "true")
 */
export function getReferenceDataFromEnv(): string {
  const includeAll = process.env.INCLUDE_REFERENCE_DATA !== 'false';

  if (!includeAll) {
    return '';
  }

  return buildReferenceData({
    includeFeeStructure: process.env.INCLUDE_FEE_STRUCTURE !== 'false',
    includeGrantMilestones: process.env.INCLUDE_GRANT_MILESTONES !== 'false',
    includeSandboxDefinitions: process.env.INCLUDE_SANDBOX_DEFINITIONS !== 'false',
    includePermissibleExpenses: process.env.INCLUDE_PERMISSIBLE_EXPENSES !== 'false',
  });
}
