# Trade Validator

## Purpose

Final gate before a signal is approved.

This skill does not improve a bad setup. It rejects bad setups.

## Validation ladder

### Gate 0 — Data
- current data available?
- timestamps acceptable?
- no critical source contradiction?

### Gate 1 — Market
- symbol allowed?
- liquidity sufficient?
- spread acceptable?
- contract stable enough?

### Gate 2 — Regime
- regime identified?
- timeframe context coherent?

### Gate 3 — Structure
- direction supported by structure?
- invalidation objective?

### Gate 4 — Setup
- recognized setup family?
- trigger explicit?
- entry zone defined?

### Gate 5 — Risk
- risk within policy?
- R:R acceptable?
- portfolio exposure acceptable?

### Gate 6 — Contradictions
- major opposing evidence?
- major event risk?
- excessive extension?
- correlated exposure?

### Gate 7 — Execution
- order type appropriate?
- protective order plan defined?
- expected slippage acceptable?

## Decision

If any critical gate fails:

`NO TRADE`

Otherwise:

`APPROVED`

## Output

```text
TRADE VALIDATION

Symbol:
Direction:
Setup:

G0 Data: PASS/FAIL
G1 Market: PASS/FAIL
G2 Regime: PASS/FAIL
G3 Structure: PASS/FAIL
G4 Setup: PASS/FAIL
G5 Risk: PASS/FAIL
G6 Contradictions: PASS/FAIL
G7 Execution: PASS/FAIL

Critical failure:
Final decision:
Confidence:
```
