# Setup Detector

## Purpose

Convert validated market analysis into a standardized trade setup.

The detector may output `WAIT` if entry conditions are not currently met.

## Supported setup families

- TREND_CONTINUATION
- BREAKOUT_RETEST
- LIQUIDITY_SWEEP
- FAILED_BREAKOUT
- RANGE_REVERSION
- MOMENTUM_EXPANSION
- REVERSAL
- MEAN_REVERSION

Do not force a setup into a family when the structure does not fit.

## Required fields

```text
Symbol
Direction
Setup type
Market regime
Trigger
Entry zone
Stop
Invalidation condition
TP1
TP2
Optional runner target
Expected R:R
Risk %
Timeframe
Evidence
Contradictions
Expiry condition
Status
```

## Entry discipline

Prefer an entry zone with an explicit trigger over an arbitrary current price.

A setup expires when:

- price reaches the invalidation;
- the expected trigger does not occur within a defined context;
- market regime materially changes;
- liquidity/execution quality deteriorates;
- new information contradicts the thesis.

## No chasing

If price has already moved substantially beyond the planned entry zone, do not rewrite the entry to justify chasing.

Return:

`SETUP EXPIRED — WAIT FOR NEW STRUCTURE`

## Minimum approval

A setup cannot proceed unless:

- direction is defined;
- invalidation is defined;
- position risk can be calculated;
- expected R:R passes `config/risk-config.md`;
- no critical contradiction exists.
