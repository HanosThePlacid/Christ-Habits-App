# Christ Habits

A phone app for building the habits that make a Christian strong in the Spirit: Scripture, prayer,
obeying the Holy Spirit, guarding the heart, serving. Built on the Atomic Habits rulebook
(identity, cues, 2-minute floors, never miss twice).

Expo (React Native) + TypeScript. Offline-first: all data stays on the device (SQLite).

## Run it on your phone

1. Install **Expo Go** from the Play Store / App Store.
2. `npm install`
3. `npm start -- --tunnel` (the tunnel is needed under WSL)
4. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Scripts

| Command                                 | What it does       |
| --------------------------------------- | ------------------ |
| `npm start`                             | Dev server         |
| `npm test`                              | Unit tests (Jest)  |
| `npm run lint` / `typecheck` / `format` | Code quality       |
| `npm run check`                         | Everything CI runs |

## Layout

```
src/app/            screens (expo-router: every file is a route)
src/features/       habits, events (obedience log), review (weekly reflection) — logic + DB access
src/db/             migrations + seed data
src/lib/            dates, reminders
src/components/     shared UI
```

## CI/CD

- **ci.yml**: every push/PR runs lint, typecheck, format, tests, expo-doctor and an Android bundle.
- **preview.yml**: every PR publishes an EAS Update and comments a QR code.
- **build.yml**: `main` builds an installable Android APK; tag `v*` builds production.

EAS jobs switch on when the repo variable `EAS_ENABLED=true` and the secret `EXPO_TOKEN` are set.
Store submission switches on with `STORE_SUBMIT=true` once Play/App Store credentials are in EAS.

## Releasing

```sh
npm version patch        # bumps version, creates tag vX.Y.Z
git push --follow-tags   # triggers production build
```

JS-only fixes can go out without store review: `npx eas-cli@latest update --channel production`.

See `CONTENT_GUIDELINES.md` before adding spiritual content.
