# Custom mockups

Place your transparent PNG mockup files in this folder, then register each asset in `manifest.json`.

Recommended structure:

- `overlays/`: foreground mockup PNG files with transparent cutout areas.
- `images/`: optional local sample/user-image references for future testing. Runtime uploads are still handled in the browser and are not sent to a server.

```json
{
  "mockups": [
    {
      "id": "phone-dark",
      "label": "Dark phone",
      "category": "Phone",
      "src": "mockups/overlays/phone-dark.png"
    }
  ]
}
```
