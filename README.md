# Fluffy Content Vault

This app is a personal writing vault for shayari/poems and other content types.  
It is a static app (`index.html`) that runs on GitHub Pages and now supports:

- `Google Sheets` backend (recommended)
- Session-only Google Sheets connection in the browser
- PWA install support for mobile devices
- One-time import from the repository `vault.json`

## Product Model

Each piece tracks:

- `title`, `type`, `lang`
- `content`, `notes`, `tags`
- `status`: `draft | wip | ready | recorded | posted`
- `platforms`
- `createdAt`, `updatedAt`

Archive tracking is built in, so you can separate active vs archived pieces and later publish selected work.
The UI now focuses on a simpler writing flow:

- no local browser storage
- no visible category system
- a dedicated Published Shelf for posted work
- Google Sheets as the one connected source of truth

## Google Sheets Setup (Recommended)

1. Create a Google Sheet with two tabs:
- `vault`
- `archive`

Both tabs should use these headers in row 1:
- `id`
- `title`
- `type`
- `lang`
- `content`
- `notes`
- `status`
- `platforms`
- `tags`
- `createdAt`
- `updatedAt`
- `deletedAt`

2. Open `Extensions -> Apps Script` in that Sheet.

3. Paste code from [`google-apps-script.gs`](/Users/manthangandhi/Documents/agents/fluffy-content-vault/fluffy-content-vault/google-apps-script.gs).

4. Update `SHEET_ID` and `SECRET_KEY` in the script.

5. Deploy:
- `Deploy -> New deployment -> Web app`
- Execute as: `Me`
- Access: `Anyone` (or anyone with link)

6. Copy the Web App URL.

7. In the app (`Setup` button):
- Paste Web App URL
- Paste Shared Key
- Save settings

8. If you want to seed the sheet with the repository data:
- Open `Setup`
- Click `Import repo JSON`
- Confirm the overwrite

This reads `vault.json` from the same published site and pushes it into the `vault` tab.

## Data Shape in Sheet

- One row = one piece.
- `platforms` is stored as comma-separated values (example: `ig,x,yt`).
- `deletedAt` is `0`/blank for active rows and timestamp for archive rows.

## API Contract Used by App

The frontend sends POST JSON:

- `{ action: "load", key: "..." }` -> returns `{ ok, vault, archive }`
- `{ action: "save", key: "...", vault: [...], archive: [...] }` -> returns `{ ok: true }`

## QA Checklist

After setup, verify:

1. Create a new poem and save.
2. Refresh page and ensure it loads from Sheets.
3. Edit and save; check update persisted.
4. Archive a piece; check archive list.
5. Restore from archive.
6. Permanent delete from archive.
7. Open on another device/browser and confirm synced data.

## Notes

- For personal use, shared key auth is typically enough.
- Keep local JSON backups using `Download Backup`.
- The Sheets connection is session-only, so you will reconnect on each device or browser session.
- Apps Script auto-ensures header row on save/load, so header drift is corrected.
- The app can be installed on mobile as a standalone PWA once hosted over HTTPS.
