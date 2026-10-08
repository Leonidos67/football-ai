# Trading Configuration

This file contains adjustable policy. Skills should reference it instead of hard-coding values.

## Mode

```yaml
mode: PAPER
live_execution: false
```

Allowed modes:

- ANALYSIS
- PAPER
- LIVE

LIVE requires explicit human authorization and working exchange execution tooling.

## Default market

```yaml
market_type: perpetual_futures
settlement: USDT
exchange: CONFIGURE
```

## Timeframes

```yaml
higher: 4h
middle: 1h
entry: 15m
execution: 5m
```

These are defaults, not mandatory settings.

## Allowed order types

```yaml
entry:
  - LIMIT
  - MARKET

protection:
  - STOP_MARKET
  - TAKE_PROFIT_MARKET
```

Use exchange-native protective mechanisms where supported and verify their actual state.

## Signal freshness

```yaml
max_market_data_age_seconds: 10
max_signal_age_seconds: 60
```

Adjust to the actual data source and strategy.

## Default symbols

See `symbols.md`.

## Reporting

```yaml
telegram:
  enabled: true
  report_only_material_events: true
```
