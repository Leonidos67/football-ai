# Futures Symbol Universe

Start with a small, liquid whitelist.

## Tier 1

```text
BTCUSDT
ETHUSDT
SOLUSDT
```

## Tier 2

Configure only after validating liquidity, data quality and execution behavior.

```text
ADD_SYMBOLS_HERE
```

## Exclusions

Do not trade:

- newly listed contracts without sufficient history;
- contracts with insufficient liquidity;
- contracts with unstable spreads;
- contracts with unreliable market data;
- symbols outside the configured whitelist;
- contracts whose specifications the agent cannot verify.

## Expansion rule

Adding a symbol requires:

1. contract specification verified;
2. historical data available;
3. adequate liquidity;
4. acceptable spread;
5. acceptable funding behavior;
6. quantity/price precision known;
7. risk sizing tested;
8. human approval.
