# Watchlist Monitor

## Purpose

Monitor previously selected futures symbols and setups and report material changes rather than repeating the same market summary.

## State comparison

For every watched symbol compare:

- previous price structure;
- key levels;
- regime;
- OI;
- funding;
- volume;
- volatility;
- liquidation context;
- active setup;
- invalidation;
- last alert.

## Report only material changes

Examples:

- resistance broken and accepted;
- support lost;
- trend changed;
- OI regime changed;
- funding became extreme;
- major liquidity event;
- setup activated;
- setup invalidated;
- volatility regime changed;
- execution conditions deteriorated.

If nothing material changed:

`NO MATERIAL CHANGE`

## Output

```text
WATCHLIST UPDATE

Symbol:
Previous state:
Current state:

Material change:
Evidence:
Trading implication:
Setup status:
Action:
```

Never generate a new trade merely because the watchlist job is running.
