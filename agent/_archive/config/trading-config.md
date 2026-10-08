Здесь я бы вынес все параметры, которые могут меняться без переписывания Skills.

Например:

account:
  currency: USDT

risk:
  max_risk_per_trade: 0.5%
  max_daily_loss: 2%
  max_weekly_loss: 5%
  max_open_positions: 3

execution:
  allowed_order_types:
    - limit
    - market

market:
  min_volume_24h: ...
  min_open_interest: ...

filters:
  avoid_major_news: true
  avoid_low_liquidity: true