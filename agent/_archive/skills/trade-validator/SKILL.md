Вот здесь я бы сделал систему многоступенчатого допуска.

Например:

LEVEL 0
Market data valid?

↓ YES

LEVEL 1
Liquidity sufficient?

↓ YES

LEVEL 2
Market regime identified?

↓ YES

LEVEL 3
Structure supports direction?

↓ YES

LEVEL 4
Setup identified?

↓ YES

LEVEL 5
Entry defined?

↓ YES

LEVEL 6
Invalidation defined?

↓ YES

LEVEL 7
R:R acceptable?

↓ YES

LEVEL 8
Risk acceptable?

↓ YES

LEVEL 9
No major contradiction?

↓ YES

TRADE APPROVED

Если любой critical check = FAIL:

NO TRADE