# LifePoints

LifePoints is a compact personal points app: complete reusable tasks to earn points, spend points on reusable rewards, and review every change in the timeline.

## Pages

- **Tasks** — default/high-frequency page. Shows current balance and total earned points. Tap a multiplier pill to cycle through the configured multipliers, then tap the point value to record completion.
- **Rewards** — spend points on saved rewards.
- **Timeline** — chronological earned/spent history.
- **Settings** — light/pure-black theme, custom multipliers, spending confirmation, haptics, Support me, About, and JSON export.

All data stays on the device in WebView `localStorage`; there is no account or sync service.

## Android

- Package: `com.xiaoyuzhuang.lifepoints`
- Minimum Android: 7.0 / API 24
- The UI is bundled locally as `app/src/main/assets/index.html`, so it does not depend on a website being online.

## Stable release signing

Android can update an installed app in place only when the package name stays the same and every APK is signed by the same release key. GitHub Actions also uses its run number as an increasing `versionCode`.

Add these repository Actions secrets once:

- `LIFEPOINTS_KEYSTORE_BASE64` — base64 text of the release `.jks` file
- `LIFEPOINTS_KEYSTORE_PASSWORD` — keystore password
- `LIFEPOINTS_KEY_PASSWORD` — key password

The key alias is fixed as `lifepoints`.

After the secrets are configured, each push to `main` builds a signed `LifePoints-release` APK artifact automatically. Keep the release keystore backed up permanently; losing it means future APKs cannot update existing installations.
