# Crypto Signal App — Project Handoff

## Purpose

This document transfers the project context to another ChatGPT account.

The new ChatGPT should read this file before suggesting changes. The GitHub repository and local project files are the source of truth.

## 1. User background and guidance style

The user is a beginner developer working on Windows with VS Code, PowerShell, GitHub, and Codex.

Guidance should be:

- one small step at a time
- beginner friendly
- explained before commands are given
- based on exact file paths
- based on PowerShell commands
- verified with lint, tests, build, Git diff, commit, push, and clean Git status
- careful not to make unrelated changes
- suitable for Codex prompts when useful

Do not assume a task succeeded until the user shares the terminal output.

When the user is confused, provide the complete replacement file instead of many fragmented edits.

## 2. Project goal

The project is a cryptocurrency signal prediction web application.

The application currently displays live and historical cryptocurrency market data.

The long-term goal is to generate crypto trading signals using:

- live market data
- technical indicators
- AI or machine learning
- RSI
- MACD
- moving averages
- volume
- market momentum
- sentiment
- volatility
- multiple timeframes

Example future signal output:

```text
Direction: Bullish
Confidence: 84%
Expected Move: +3% to +6% in the next 24 hours
Volatility: High
Signal: Buy
Risk: Medium
Reason: Rising volume, bullish momentum, and improving market sentiment.
```

The application should eventually support BTC, ETH, SOL, multiple timeframes, signal direction, confidence, expected move, volatility, risk, explanation, live updates, and no account requirement for the first version.

## 3. Repository information

Repository:

```text
https://github.com/trsiam/crypto-signal-app
```

Local project path:

```text
C:\Users\siamj\Documents\Projects\crypto-signal-app
```

Branch:

```text
main
```

Latest known commit at handoff:

```text
f7fb75d
```

Commit message:

```text
refactor: extract technical indicator calculations
```

Latest known Git state:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Before continuing, always run:

```powershell
git status
```

## 4. Technology stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router
- Vitest
- React Testing Library
- jsdom

Frontend location:

```text
apps/web
```

### Backend

- Python 3.14
- FastAPI
- Uvicorn
- Pydantic
- pydantic-settings
- httpx
- psycopg
- redis
- pytest
- Ruff
- mypy

Backend location:

```text
apps/prediction-api
```

### Tools

- pnpm
- uv
- Docker
- Docker Compose
- Git
- GitHub
- VS Code
- Codex

## 5. Important versions

```text
Node: 24.18.0
npm: 11.16.0
Corepack: 0.35.0
pnpm: 11.17.0
Python: 3.14.6
uv: 0.12.0
Docker: 29.6.2
Docker Compose: 5.3.1
```

VS Code Python interpreter:

```text
apps\prediction-api\.venv\Scripts\python.exe
```

## 6. Important repository structure

```text
crypto-signal-app/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── package.json
│   └── prediction-api/
│       ├── src/
│       │   └── prediction_api/
│       ├── tests/
│       └── pyproject.toml
├── docs/
│   └── PROJECT_HANDOFF.md
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── .env.example
```

## 7. Root scripts

```json
{
  "dev:web": "pnpm --filter web dev",
  "build:web": "pnpm --filter web build",
  "lint:web": "pnpm --filter web lint",
  "test:web": "pnpm --filter web test",
  "verify:web": "pnpm lint:web && pnpm test:web && pnpm build:web",
  "dev:api": "uv run --project apps/prediction-api uvicorn prediction_api.app:app --app-dir apps/prediction-api/src --reload --port 8001",
  "check:api": "uv run --project apps/prediction-api ruff check apps/prediction-api/src",
  "compile:api": "uv run --project apps/prediction-api python -m compileall apps/prediction-api/src",
  "test:api": "uv run --project apps/prediction-api pytest apps/prediction-api/tests",
  "verify:api": "pnpm check:api && pnpm compile:api && pnpm test:api",
  "verify": "pnpm verify:web && pnpm verify:api"
}
```

## 8. Local infrastructure

Docker services:

- PostgreSQL 17
- Redis 8

Container names:

```text
crypto-signal-postgres
crypto-signal-redis
```

Useful commands:

```powershell
docker compose up -d
docker compose ps
docker compose stop
docker compose start
docker compose down
```

Avoid deleting volumes unless explicitly intended:

```powershell
docker compose down -v
```

## 9. Backend features completed

### Health endpoint

Checks PostgreSQL and Redis.

### Live price endpoint

```text
GET /market/price/{symbol}
```

Features:

- Binance market data
- uppercase symbol normalization
- alphanumeric symbol validation
- 422 for invalid input
- 502 for upstream failure
- numeric price conversion

Main file:

```text
apps/prediction-api/src/prediction_api/market_data.py
```

### Historical candle endpoint

```text
GET /market/candles/{symbol}?interval=1h&limit=100
```

Main file:

```text
apps/prediction-api/src/prediction_api/candles.py
```

Returns:

```text
open_time
open
high
low
close
volume
close_time
```

Validation:

- symbol must be alphanumeric
- limit must be between 1 and 1000
- upstream failure returns 502

## 10. Frontend API routes completed

```text
/api/health
/api/market/price/[symbol]
/api/market/candles/[symbol]
```

The candle proxy forwards symbol, interval, and limit.

Default backend URL:

```text
http://127.0.0.1:8001
```

## 11. Frontend hooks completed

### Live price hook

```text
apps/web/src/hooks/use-market-price.ts
```

Features:

- current price loading
- automatic refresh every 5 seconds
- manual refresh
- symbol changes
- loading and refresh states
- last updated time
- keeps old data after refresh failure
- ignores stale requests

### Historical candle hook

```text
apps/web/src/hooks/use-market-candles.ts
```

Features:

- loads candles
- accepts symbol, interval, and limit
- manual refresh
- loading and refresh states
- keeps old data after refresh failure
- ignores stale requests

## 12. Frontend page features completed

Main page:

```text
apps/web/src/app/page.tsx
```

Supported symbols:

```text
BTCUSDT
ETHUSDT
SOLUSDT
```

Current features:

- cryptocurrency selector
- live price
- last updated time
- manual price refresh
- automatic refresh
- historical chart
- manual chart refresh
- loading and error states
- timeframe controls

Supported intervals:

```text
15m
1h
4h
1d
```

The chart loads the last 100 candles.

## 13. Chart features completed

Chart component:

```text
apps/web/src/components/price-chart.tsx
```

Features:

- responsive SVG closing-price chart
- low and high labels
- closing-price legend
- SMA 20
- RSI 14 with 70 and 30 levels
- MACD 12, 26, 9
- MACD line
- signal line
- positive and negative histogram bars
- zero reference line
- accessibility labels

Browser testing confirmed BTC, ETH, SOL, 15m, 1h, 4h, 1d, SMA, RSI, and MACD all work.

## 14. Technical indicator utilities

Utility file:

```text
apps/web/src/lib/technical-indicators.ts
```

Exported functions:

```text
calculateSma
calculateRsi
calculateEma
calculateMacd
```

Exported type:

```text
MacdPoint
```

Behavior:

- SMA uses a simple moving window
- RSI uses simple average gains and losses
- EMA starts with the simple average of the first full period
- MACD defaults to 12, 26, 9

The chart now imports these functions instead of containing the math directly.

## 15. Current test coverage

Latest known counts:

```text
Frontend: 30
Backend: 14
Total: 44
```

Frontend test files:

```text
apps/web/src/app/api/health/route.test.ts
apps/web/src/app/api/market/price/[symbol]/route.test.ts
apps/web/src/app/api/market/candles/[symbol]/route.test.ts
apps/web/src/hooks/use-market-price.test.tsx
apps/web/src/hooks/use-market-candles.test.tsx
apps/web/src/app/page.test.tsx
apps/web/src/components/price-chart.test.tsx
```

There is not yet a dedicated test file for:

```text
apps/web/src/lib/technical-indicators.ts
```

## 16. Exact stopping point

The project was paused after extracting technical indicator calculations into:

```text
apps/web/src/lib/technical-indicators.ts
```

The refactor passed:

```powershell
pnpm lint:web
pnpm --filter web test
```

Result:

```text
7 test files passed
30 tests passed
```

The refactor was committed and pushed.

Latest commit:

```text
f7fb75d
```

## 17. Immediate next task

Create:

```text
apps/web/src/lib/technical-indicators.test.ts
```

Tests should cover:

- calculateSma
- calculateRsi
- calculateEma
- calculateMacd

Before continuing, run:

```powershell
git status
pnpm lint:web
pnpm --filter web test
```

## 18. Standard verification workflow

Frontend:

```powershell
pnpm lint:web
pnpm --filter web test
pnpm verify:web
```

Backend:

```powershell
pnpm verify:api
```

Entire project:

```powershell
pnpm verify
```

Before committing:

```powershell
git diff --check
git status
git diff
```

Stage exact files:

```powershell
git add <exact-file-paths>
```

Inspect:

```powershell
git diff --staged
```

Commit and push:

```powershell
git commit -m "type: clear description"
git push
git status
```

Expected final state:

```text
nothing to commit, working tree clean
```

## 19. Git commit style

Use:

```text
feat:
fix:
test:
refactor:
docs:
chore:
```

## 20. Windows notes

LF-to-CRLF warnings are usually normal on Windows.

Use separate terminals:

Terminal 1:

```powershell
pnpm dev:api
```

Terminal 2:

```powershell
pnpm dev:web
```

Terminal 3:

Use for tests and Git.

Stop each server with:

```text
Ctrl + C
```

## 21. Development URLs

FastAPI:

```text
http://127.0.0.1:8001
```

Next.js:

```text
http://localhost:3000
```

Data flow:

```text
Browser
→ Next.js frontend
→ Next.js API proxy
→ FastAPI
→ Binance
→ response returned to chart
```

## 22. Known warning

Backend tests may show:

```text
StarletteDeprecationWarning:
Using httpx with starlette.testclient is deprecated;
install httpx2 instead.
```

This was considered non-blocking because tests passed.

## 23. Guidance rules for the new ChatGPT

1. Read this file first.
2. Treat GitHub and the repository as the source of truth.
3. Start with `git status`.
4. Never assume unfinished work is committed.
5. Give one small task at a time.
6. Explain what the task does and why.
7. Give exact file paths and PowerShell commands.
8. Ask the user to paste command output.
9. Wait for verification before continuing.
10. Use precise Codex prompts when useful.
11. Do not let Codex commit automatically.
12. Inspect diffs before committing.
13. Stage only intended files.
14. End completed tasks with a clean Git status.
15. Do not skip tests.
16. Do not install packages without explanation.
17. Do not make unrelated edits.
18. Preserve behavior during refactors.
19. Keep the user informed about the current project phase.

## 24. Starter prompt for the new ChatGPT account

```text
You are helping me continue building my Crypto Signal Prediction Web App.

I am a beginner developer using Windows, VS Code, PowerShell, GitHub, pnpm, uv, Docker, and Codex.

Read docs/PROJECT_HANDOFF.md before suggesting the next task.

Guide me one small step at a time.

For every step:
- explain what we are doing
- explain why it matters
- give exact file paths
- give commands I can paste into PowerShell
- give complete replacement code when I am confused
- wait for my terminal output before continuing
- verify lint, tests, build, Git diff, commit, push, and clean Git status
- do not skip steps
- do not make large unrelated changes
- when useful, give me a precise Codex prompt
- do not let Codex commit automatically
- treat GitHub and the repository as the source of truth

Before continuing development, ask me to run:

git status
pnpm lint:web
pnpm --filter web test

The current planned next task is to add direct unit tests for:

apps/web/src/lib/technical-indicators.ts
```

## 25. Final reminder

Do not restart the project from the beginning.

Current direction:

```text
Market data
→ Charts
→ Technical indicators
→ Reusable indicator utilities
→ Indicator unit tests
→ Signal rule engine
→ Signal confidence and reasoning
→ Backend signal API
→ AI or machine-learning enhancements
```

The immediate next step is indicator utility testing, not a new visual indicator.
