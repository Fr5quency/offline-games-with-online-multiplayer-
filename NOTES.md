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
