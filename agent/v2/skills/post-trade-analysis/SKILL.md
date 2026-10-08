# Post-Trade Analysis

## Purpose

Turn every completed trade into structured feedback.

This skill evaluates the process, not just the PnL.

## Record

- trade ID
- symbol
- direction
- setup
- timeframe
- market regime
- entry
- exit
- stop
- targets
- planned R:R
- realized R
- fees
- funding
- slippage
- execution latency if available
- thesis
- invalidation
- result

## Classify the result

### Good win
Thesis valid, execution disciplined, positive outcome.

### Good loss
Thesis was valid and risk was controlled, but outcome was negative.

### Bad win
Trade made money despite violating the process.

### Bad loss
Trade violated the process or was based on weak evidence.

Do not let a profitable mistake become a recommended behavior.

## Review questions

1. Was the market regime classified correctly?
2. Was the setup objectively present?
3. Was the entry disciplined?
4. Was invalidation correct?
5. Was position sizing correct?
6. Were fees/funding/slippage underestimated?
7. Did the trade conflict with another position?
8. Was there a better no-trade decision?
9. Did execution differ from the plan?
10. What should change in the skill/config?

## Output

```text
POST-TRADE REVIEW

Trade:
Result:
R:
Process quality:
Thesis quality:
Execution quality:
Risk quality:

What worked:
What failed:
Mistake:
Lesson:
Actionable rule:
```

Only promote a lesson to a permanent rule after repeated evidence or explicit human approval.
