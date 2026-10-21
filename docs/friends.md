# Friends

## Model

- `friendships(user_id, friend_id, status, created_at)`: `user_id` is the requester. A unique index on the unordered pair blocks duplicate and crossed requests.
- Requests and responses are plain table writes under RLS: insert pending, recipient updates `status`, either side deletes.
- `friend_mutes(user_id, friend_id)`: hides a friend from the activity feed for the owner only.
- `created_at` on `ratings`, `follows`, `list_items` and `friendships` feeds the activity feed; history starts at the migration.

## Privacy

`profiles.privacy` is enforced in one place, `can_view(owner)`:

| Value | Who passes |
| --- | --- |
| `everyone` | any signed-in user |
| `friends` | accepted friends |
| `private` | only the owner |

`friends_on_game`, `friends_on_games`, `friend_cards`, `friend_detail` and `friend_activity` all filter through it, so a `private` friend still appears in lists of friends but shows no counts, taste match, current game or activity.

## RPCs

- Callable by `authenticated`: `friend_cards`, `friend_detail`, `friend_activity`, `friend_requests`, `search_users`.
- Internal helpers (execute revoked): `my_friend_ids`, `can_view`, `mutual_friends`, `taste_match`, `friend_events`.
- Taste match is `1 - avg(|score difference|) / 9` over games both users rated; no common ratings gives `null`.
- "Now playing" is the friend's most recently added game on the `playing` list, not an online status.

## Invite link

`/u/<username>` shows the user with an add or accept button, based on `search_users`.
