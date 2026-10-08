# Position Monitor

## Purpose

Monitor open futures positions without rewriting the original thesis to fit new price action.

## On every monitoring cycle

Collect:

- position size;
- side;
- average entry;
- mark price;
- unrealized PnL;
- realized PnL;
- stop/TP orders;
- liquidation price;
- leverage;
- margin;
- funding;
- current structure;
- current volume;
- OI;
- relevant market context.

## Thesis preservation

Store the original thesis at entry.

Example:

```text
Thesis:
LONG after breakout + retest + volume confirmation.

Invalidation:
Price closes back below the reclaimed level.
```

If invalidation occurs:

`THESIS INVALIDATED`

Do not invent a new bullish explanation merely because the position is losing.

## Stop rules

Never:

- widen the stop to avoid a loss;
- add size to a losing trade unless explicitly authorized by strategy;
- remove protective orders without a documented reason.

A stop may be tightened only if the strategy explicitly permits it and the change is consistent with the original risk framework.

## Alerts

Alert on:

- thesis invalidation;
- protective order missing;
- unexpected fill;
- abnormal slippage;
- liquidation risk deterioration;
- major structure change;
- extreme funding;
- significant OI/price divergence;
- exchange/API inconsistency.

## Output

```text
POSITION STATUS
Symbol:
Side:
Entry:
Mark:
PnL:
Original thesis:
Current structure:
Thesis status:
SL status:
TP status:
Risk status:
Action:
```
