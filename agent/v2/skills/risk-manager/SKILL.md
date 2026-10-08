# Risk Manager

## Purpose

Determine whether a proposed trade is financially admissible under the configured risk policy.

## Fundamental rule

Risk is controlled by:

`position size × stop distance`

Leverage only changes required margin and liquidation dynamics; it does not create a valid reason to increase risk.

## Required calculations

Given:

- account equity;
- maximum risk %;
- entry;
- stop;
- contract specifications;
- fees;
- expected slippage;

calculate:

- maximum loss at stop;
- stop distance;
- position notional;
- quantity;
- estimated fees;
- estimated total execution cost;
- required margin under proposed leverage;
- liquidation distance when available;
- R:R.

## Portfolio constraints

Check:

- daily loss;
- weekly loss;
- number of open positions;
- aggregate risk;
- correlated exposure;
- available margin;
- existing unrealized loss;
- funding burden.

## Hard rejects

Reject when:

- stop is undefined;
- risk exceeds configured maximum;
- daily/weekly loss limit is breached;
- liquidity is insufficient;
- position would create prohibited concentration;
- expected R:R is below minimum;
- execution cost makes the setup unattractive;
- liquidation risk is unacceptably close;
- required data is missing.

## Position sizing

Never round quantity upward if doing so exceeds the risk limit.

If exchange quantity precision prevents compliant sizing, round downward.

## Output

```text
RISK CHECK
Equity:
Risk budget:
Entry:
Stop:
Stop distance:
Quantity:
Notional:
Leverage:
Estimated fees:
Estimated slippage:
Maximum loss:
Expected reward:
R:R:
Portfolio risk:
Decision: PASS / FAIL
Reason:
```
