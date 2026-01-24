# Songs Folder

Drop your audio files in this folder.

## Automatic playlist (recommended)

The player now tries to auto-load songs in this order:

1. `songs/playlist.json` (if present)
2. Directory listing at `songs/` (works on local dev servers that show listings)
3. Fallback list in `script.js`

### Option A: playlist.json

Create or update `songs/playlist.json`:

```json
[
  {
    "title": "Until I Found You",
    "src": "songs/Stephen Sanchez - Until I Found You (Official Video) [GxldQ9eX2wo].webm"
  },
  {
    "title": "Bhalobashar Morshum",
    "src": "songs/Bhalobashar Morshum (ভালবাসার মরশুম) ｜ X=Prem ｜ Shreya Ghoshal ｜ Sanai ｜ Srijit ｜ SVF [7NLfpsNHmZI].webm"
  }
]
```

### Option B: directory listing

If you run a local server that shows directory listings (like `python -m http.server`),
the player will automatically detect audio files in this folder.

## Notes

- Supported formats: `.mp3`, `.ogg`, `.wav`, `.webm`, `.m4a`, `.aac`
- Songs play randomly on each page refresh
- When a song ends, the next one starts automatically
- Keep file sizes reasonable for faster loading
