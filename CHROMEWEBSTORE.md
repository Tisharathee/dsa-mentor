# Chrome Web Store Listing — DSA Mentor Companion

> Last Updated: 2026-07-02

## Store Listing

**Extension Name**
DSA Mentor Companion

**Short Description**
Graduated AI hints for LeetCode problems. Get conceptual guidance and code diagnosis without spoiling the solution.

**Detailed Description**
DSA Mentor Companion is a developer tool designed to help you build algorithmic reasoning muscles when practicing on LeetCode. 

Most AI assistants simply paste a fully working code solution, which ruins the learning process. DSA Mentor Companion integrates right inside your tab, reasons about your current code attempt, and delivers progressive, graduated hints. 

Key Features:
- Instant Tab Scraper: Grabs the problem statement and Monaco editor contents with a single click.
- Progressive Hinting: Instantly classifies your code blocker (e.g. wrong approach, complexity issue, missed edge case, implementation bug) and provides graduated guidance:
  * Hint 1: A gentle nudge towards the right direction (no technique name).
  * Hint 2: Identifies the exact data structure or technique to consider.
  * Hint 3: Walks through the logic step-by-step in plain English (never writes actual code).
- High-Performance Cyber Design: Features a premium glassmorphic dark-theme side panel.

How to Use:
1. Navigate to any LeetCode problem.
2. Click the DSA Mentor toolbar icon to open the companion side panel.
3. Click "⚡ Sync from LeetCode" to automatically scrape the problem description and your code attempt.
4. Click "Get a Hint" to receive your custom code diagnosis and structured hint.
5. If still stuck, write a brief comment describing what you tried next and click "Get next hint" for the next graduated level of assistance.

**Category**
Developer Tools

**Single Purpose**
Automatically scrapes LeetCode problems and code attempts to provide graduated AI-powered hints.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ⬜ Not created | |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Not created | |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `sidePanel` | permissions | Used to host the graduated hint UI alongside the active coding screen so students can code and read hints simultaneously. |
| `tabs` | permissions | Required to query the active tab's URL to ensure the student is on a valid LeetCode problem page before injecting the content script. |
| `scripting` | permissions | Required to inject the content scraping script (`content.js`) into the active LeetCode tab dynamically when syncing the problem and attempt. |
| `https://leetcode.com/problems/*` | host_permissions | Restricts scripting and DOM access permissions strictly to LeetCode problem pages for user security. |
| `https://*.leetcode.com/problems/*` | host_permissions | Restricts scripting and DOM access to LeetCode subdomains. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Website content | Yes | Yes | The LeetCode problem statement and user's code attempt are sent to the backend LLM service to generate context-specific hints. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-07-02 | Initial version with LeetCode scraping, Side Panel, and graduated hints. | Draft |
