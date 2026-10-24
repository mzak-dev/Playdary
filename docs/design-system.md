# Design system (Plogamer)

Source: the Plogamer design system artifact. Tokens live in `packages/design-system/src/tokens.css` as shadcn variables plus `highlight`, `success`, `rating`, `cover-*`.

## Usage rules

- One `primary` action per view; `highlight` (yellow) only for the quote banner and featured badge.
- `success` for scores 75+, `destructive` below 50; always with a number or word.
- Radii: `xl` banner, `lg` cards and rows, `md` thumbnails and menus, `sm` badges, `pill` buttons.
- UI language is Polish, second person, no exclamation marks or emoji.
- Dark theme is default; light via the `light` class on `html`.

## Component status

| Component | Status |
| --- | --- |
| Button, ScoreBadge, Countdown, Avatar | ported |
| Badge, Rating, ListButton, FriendNotice | to port |
| GameCover, GameCard, GameRow | to port |
| QuoteBanner, NavBar, SubNav, SearchField | to port |

## Libraries

- shadcn/ui: add components with the CLI into `packages/design-system`.
- React Bits: copy-paste only (SpotlightCard for GameCard, SplitText for QuoteBanner, CountUp for follows).
- anime.js: gallery transitions and list reordering; respect `prefers-reduced-motion`.

## Profile

- `/profile` has three sections: Przegląd (taste histogram, shelf, genres, friends), Oceny (all ratings) and Ustawienia (account, theme, notifications, privacy).
- Level, XP and achievements from the prototype are not built; they need backend data.
- `profiles.privacy` and `profiles.notifications` are stored but not enforced yet; enforcement arrives with the friends system.
- Theme choice lives in `localStorage` (`playdary:theme`) and toggles the `light` class on `html`.

## Search and mobile menu

- Enter in the nav search opens `/search?q=`; results come from `search_games` (60 rows) and are filtered and sorted on the client.
- Below `sm` the nav collapses to a Menu button that opens the staggered panel (links, search, shortcuts).
