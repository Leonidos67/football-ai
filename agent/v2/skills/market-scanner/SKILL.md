# Market Scanner

## Purpose

Find futures markets and situations worth deeper analysis.

This skill is a discovery layer, not an execution layer.

## Workflow

1. Load the allowed symbol universe from `config/symbols.md`.
2. Reject contracts that fail liquidity or data-quality requirements.
3. Collect current market data.
4. Compare current state with recent context.
5. Classify market regime.
6. Detect unusual or potentially actionable conditions.
7. Produce candidates.
8. Pass candidates to `market-analysis`.

## Scan dimensions

### Price
- percentage change
- ATR / realized volatility
- displacement
- range expansion
- breakout / breakdown
- rejection
- distance from key levels

### Volume
- relative volume
- volume expansion/contraction
- abnormal volume
- volume confirmation or divergence

### Derivatives
- open interest and OI change
- funding rate
- liquidation activity
- basis where available
- long/short positioning metrics where reliable

### Structure
- HH/HL
- LH/LL
- BOS
- CHoCH
- range
- trend
- compression
- expansion

## Candidate threshold

Do not output a candidate simply because price moved.

A candidate should have a concrete reason such as:

- structure break with confirmation;
- breakout followed by meaningful participation;
- liquidity sweep with reversal evidence;
- volatility expansion from a defined compression;
- trend continuation at a well-defined retracement;
- abnormal derivatives activity that materially changes the market context.

## Output

```text
CANDIDATE
Symbol:
Regime:
Timeframes:
Observed event:
Why it matters:
Supporting evidence:
Potential direction:
Potential setup:
Contradicting evidence:
Data timestamp:
Status: REQUIRES_VALIDATION
```

Do not provide an entry until the setup has been validated.
