Аналог Tracker/Memory.

Но я бы не хранил всю торговую историю в одном markdown.

Лучше:

memory/
├── trading-memory.md
├── mistakes.md
├── winning-setups.md
├── losing-setups.md
└── market-regimes.md

А основную историю — SQLite.

В исходной архитектуре Tracker как раз нужен для того, чтобы агент не считал уже известную информацию новой и мог сравнивать текущее состояние с прошлым.