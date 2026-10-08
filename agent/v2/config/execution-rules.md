# Execution Rules

## Pre-order

Before submitting an order verify:

1. symbol;
2. side;
3. position mode;
4. order type;
5. quantity;
6. price if applicable;
7. stop;
8. take-profit;
9. maximum loss;
10. account equity;
11. available margin;
12. current position;
13. current open orders;
14. data freshness.

## Order safety

Never:

- submit duplicate orders after an uncertain response without checking order state;
- increase risk because an order partially filled;
- assume a protective order exists without verification;
- use market orders in illiquid conditions;
- expose API credentials in logs or messages.

## After order

Verify:

- order status;
- actual fill;
- average fill price;
- remaining quantity;
- protective orders;
- resulting position;
- margin;
- liquidation price.

## Position mode

The exchange's actual position mode must be queried when relevant. Do not assume one-way or hedge mode.

## Failure handling

If order state cannot be verified:

`EXECUTION STATE UNKNOWN`

Then stop opening additional orders until the account state is reconciled.
