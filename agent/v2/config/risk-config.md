# Risk Configuration

These are conservative defaults for a research/paper-trading agent. They must be calibrated with historical testing before live use.

## Account risk

```yaml
max_risk_per_trade_pct: 0.50
max_daily_loss_pct: 2.00
max_weekly_loss_pct: 5.00
max_open_positions: 3
```

## Setup requirements

```yaml
minimum_rr: 1.8
preferred_rr: 2.0
```

Do not treat R:R alone as evidence of an edge. A 5R target with a poor probability of reaching it is not automatically superior.

## Exposure

```yaml
max_total_open_risk_pct: 1.50
max_correlated_risk_pct: 1.00
```

## Leverage

```yaml
default_leverage: 3
max_leverage: 5
```

These are exposure constraints, not return targets.

## Execution cost

Reject or downgrade a setup when estimated:

- spread;
- commission;
- funding;
- slippage

materially reduce expected expectancy.

## Circuit breakers

Stop opening new positions when:

- daily loss limit is reached;
- data integrity is compromised;
- exchange connectivity is unstable;
- repeated execution errors occur;
- account state cannot be verified.
