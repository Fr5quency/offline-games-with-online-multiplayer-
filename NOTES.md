# Outpost Games: project notes

Read this first in a new session. **Update it with every change** (sections + change log).

## What it is
The games part of [Outpost](https://github.com/Fr5quency/outpost) as its own app. Live at **https://fr5quency.github.io/offline-games-with-online-multiplayer-/** (GitHub Pages, `main`, repo root). Static files, no build step.

## Where the code comes from
`index.html`, `games-more.js`, `puzzles.json`, `pieces/`, `firebase/`, `stockfish/`, `peerjs*` are copied from the Outpost repo (2026-11-17), then changed by a script:
- title / brand "OUTPOST games · offline & online", Open Graph tags, footer
- bottom bar = Games · Chess · Puzzles · Lessons · Stats (`data-gx` = the `S.game` screen to open; `markTabs()` highlights the right one)
- `show()` always shows the `games` view (the pocket-kit views are still in the code but unreachable; their data files are not included)
- hero card on the games home (Play online / Play a friend / Daily puzzle)
- its own `UPDATES` list and its own "seen" key `outpost.seenUpdateGames`; the update system is the same as Outpost's (What's new window once after each update, reload bar when an update arrives while open) and the ✨ What's new button sits at the top of the Games home (`updchip`)

The Outpost repo's NOTES.md documents everything inside (chess engine, Stockfish review, bots, puzzles, lessons, online, sync…). When a game feature changes in Outpost, copy the same change here (or the other way round).

## Shared with Outpost (same website: fr5quency.github.io)
- **localStorage** (prefix `outpost.`): chess Elo, history, puzzles, lessons, settings and sign-in are the same in both apps.
- **Cache store**: each service worker deletes only its own old caches (`outpost-games-vN` here, `outpost-vN` in Outpost). The Stockfish cache `outpost-engine-sf18` is shared.
- **Firebase** project `outpost-f3a72` and Firestore document `users/{uid}`: same account data. `fr5quency.github.io` is already an authorized domain, so Google sign-in works here without changes.
- **Online lobbies** (PeerJS) are the same, so players of both apps can meet.

## Files
| File | What |
|---|---|
| `index.html` | the app |
| `games-more.js` | Sudoku, Minesweeper, Four in a Row, Merge, Solitaire, Dominoes, Backgammon |
| `sw.js` | offline cache, **bump `CACHE` every release** |
| `manifest.json`, `icon-180.png`, `icon-512.png` | home-screen app |
| `art/banner.png`, `art/icon-512.png` | README / social picture (rendered from HTML with Playwright) |

## Release checklist
1. Change the code, add Arabic strings to `AR`.
2. Add an entry at the top of `UPDATES` (time in UTC).
3. Bump `CACHE` in `sw.js`.
4. Test in a phone-sized browser (`window.__miss` empty, no errors).
5. Commit and push to `main`; update this file.

## Change log
- 2026-11-17: First version: all Outpost games, games-only navigation, hero, new icon and banner, README.
- 2026-11-17: What's new button on the Games home. (sw cache v2)
- 2026-11-17: Reverted the fast-bot change (it made the review slow and lost live brilliant dings). Instead `warmEngines()` runs 1.2 s after the app opens: review Stockfish first (`sfStart`), then the bots' Stockfish (`sfBotReady`) once the review one is ready (or failed / 25 s). The bot still waits up to 2.2 s for your move's analysis before answering. New bots `LEVELS[11]` **Witty Alien** (2600, the streamer's chess.com blitz is listed at 2523–2670; `alien:1`, `book:"alien"`: Alien Gambit and other attacking lines, then `brillPick` played 70 % of the time, `gamblePick` 50 %, else Stockfish limited to 2600) and `LEVELS[12]` **Caro-Kann Defender** (1800, `book:"caro"`, then Outpost Chess at 1800 strength). Opening books: `BOOKS` + `bookMove()` (SAN lines matched against the game so far). In bot vs bot, Witty Alien's opponent also uses `feedBrill`. Brilliant badge + ding everywhere: offline bots, bot vs bot, 1v1 on one phone, online (`liveClass`), puzzles (`puzMove`). **Every update goes to both repos: Outpost and Outpost Games.** (cache v4)
  Also: `sfQueue` sends `stop` to the review engine when a new move arrives while it is still analysing an older game, so your move is analysed in time for its brilliant ding.
- 2026-11-17: Removed the background engine warm-up (`warmEngines`) and the `stop` tweak in `sfQueue`, at the owner's request. Engines start on demand again (review engine with the first move, the bots' Stockfish at the Grandmaster's / Brilliant Mover's first move, which takes a moment). Witty Alien, Caro-Kann Defender and all other updates stay. (cache v5)
- 2026-11-17: Engine tag in bot games (`#engTag` next to `#openTag` in `.gtags`): `botEngineLabel()` = Outpost Chess / Stockfish 18 / Stockfish 18 + Outpost Chess (Brilliant Mover) / "Loading Stockfish…" while `SFB` is starting; redrawn by `engTagDraw()` on every board draw and when the bots' Stockfish starts, becomes ready or fails (`SFB.failed`). (cache v6)
- 2026-11-17: The opening and engine tags are stacked compactly (`.gtags`, max 44px) so the top row keeps its 44px height and the board size never changes (measured: same board size with and without the tag at 390×844, 390×664, 375×667 and in full screen). (cache v7)
- 2026-11-17: Stockfish analyses every standard / no-castling game: a stuck job, a crash or a slow load now calls `sfRestart(job)` (terminate, re-queue, start again; `SF.fails` reset when ready) instead of `sfFail()`; only 3 failed starts in a row fall back to Outpost Chess. Load timeout 90 s. `onAnalysis` never lets an Outpost Chess row replace a Stockfish row, and `startReview` re-queues every move Outpost Chess analysed (`sf:0`) for Stockfish. Chess960 / King of the Hill / Three-check still use Outpost Chess (Stockfish 18 can't play them). (cache v8)
- 2026-11-17: Stockfish for everything chess it can play: Chess960 added (`sfUsable` includes "960"; analysis jobs carry `c960` and set `UCI_Chess960`; `sfBot` sets it from `CH.variant`; the app's 960 castling move = king takes rook, which is UCI_Chess960's format). Only King of the Hill / Three-check stay on Outpost Chess (Stockfish 18 has no such rules). SAN castling fixed for 960 (`(t&7)>(f&7)` = O-O). All 150 puzzles re-verified with Stockfish (depth 20, borderline ones at 26; script verpuz.js in the session scratchpad): 14 old Outpost-Chess-made puzzles had a second solution and were replaced in place (same number, same type, similar rating; the two old "win material" ones became brilliant-sacrifice puzzles): 73, 74, 75, 76, 77, 79, 80, 83, 91, 95, 96, 97, 100, 140. (cache v9)
- 2026-11-17: Review stuck at 0% fixed. `startReview` clears `CH.asked` for positions without an answer before queueing (jobs lost in a restart were never asked again), and a watchdog re-queues missing positions after 6 s without progress; if Stockfish isn't running then, Outpost Chess fills them (`anLocal`) so the review always finishes. Restarts carry `SF.gen`: a job from an older Stockfish can no longer trigger another restart (that chain could kill the fresh engine three times and end in `sfFail`). "Starting Stockfish…" on the review screen while it loads. Load timeout back to 45 s. (cache v10)
- 2026-11-17: Review ready at the end of the game: `SF_MS` 1000 → 700 (played-move search 350); `newCH` starts the review Stockfish (`sfStart`) when a game starts (not puzzles, not saved games; the bots' Stockfish still starts on demand); `finishChess` queues the final position at once; review watchdog runs every 1 s and only re-asks for positions that are not already queued or being analysed. (cache v11)
- 2026-11-17: **Analysis = Stockfish only** (owner's request). `sfFail()` now just restarts Stockfish (old fallback kept as `sfFailOld`, unused); no 3-strikes fallback; worker creation errors retry after 2 s; a failed position is re-queued for Stockfish; the review watchdog never uses Outpost Chess (only King of the Hill / Three-check, which Stockfish can't play, still use it). Stuck = 30 s with no answer (was ~9.6 s, too short for a phone sharing CPU with a Stockfish bot). The bot waits up to 10 s (was 2.2 s) for the analysis of your last move, so the live brilliant badge + ding always comes before its reply. (cache v12)
- 2026-11-17: Bot hard limit: `maybeBot` arms a 10 s timer; if no move was played by then (`CH.pending.taken`), the bots' Stockfish (`SFB`) is terminated and reset and an Outpost Chess move (depth 3) is played. `onBotMove` plays only the first answer per move (`CH.pending.taken`). Reported: Grandmaster stuck on Thinking… in bot vs bot against Witty Alien. (cache v13)
- 2026-11-17: Bot speed: Grandmaster 1 s, Witty Alien 0.7 + 0.5 s, `feedBrill` capped at 1.5 s (top 8 at 250 ms, replies at 180 ms) and stops as soon as its move isn't wanted (`id`); emergency limit 4 s (`window.__botLimitHits` counts uses; 0 in testing). **Stockfish crash fix**: `sfBot` requests are serialised through `SFB.chain` (overlapping `go` commands crashed the wasm with "unreachable", which left bots stuck); a timed-out request terminates only its own worker and only clears its own `SFB.on`. (cache v14)
- 2026-11-17: Live engine tag: `CH.srcTurn` records where the current bot move comes from (`book` / `sf` when an `sfBot` call answers / `oc` from `own()` or the emergency limit); `onBotMove` stores it in `CH.engNow[colour]`; `sideEngine(c)` shows it (or "Loading Stockfish…"). Shown for bot games and bot vs bot (both sides), and in full screen.
- 2026-11-17: From the full test run: the 4 s emergency move for Brilliant Mover / Witty Alien still hunts brilliant moves (Outpost Chess `roots` + `brillPick`, in the worker); the review shows "Stockfish can't start…" after 20 s without Stockfish; `warmBotEngine()` loads the bots' Stockfish when a game against a Stockfish bot (or a bot-vs-bot match with one) starts. (cache v15)
- 2026-11-17: Bug from the test run: Caro-Kann Defender answered 1.e4 with 1...e5 (it picked the next move of a line meant for its White games). `BOOKS` lines now start with `w:` / `b:` and `bookMove` only follows lines for the bot's colour. (cache v16)
