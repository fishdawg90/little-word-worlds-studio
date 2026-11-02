# Pack Studio

Create bilingual vocabulary packs from any modern desktop, tablet or phone browser:

https://fishdawg90.github.io/little-word-worlds-studio/

The game lives separately at https://fishdawg90.github.io/little-word-worlds/.

## Use

Enter your own OpenAI API key, choose a topic and number of items, review the English and Italian vocabulary, then generate images and recordings. You can edit the illustration prompt, compare voices and resume partially finished packs. API requests use your API balance; nothing is generated automatically on page load.

The site runs entirely in your browser; there is no local installation, shared API key or hosted generation server. Your key is kept only in the current tab and sent directly to api.openai.com over HTTPS. It is never stored in this repository, browser storage, saved drafts or exported packs. Voice WebSockets use a separately minted short-lived OpenAI token. As with any browser tool where you enter credentials, use a device and extensions you trust. There are no analytics, third-party scripts or CDN dependencies.

The online game catalogue is refreshed before generation/export to avoid existing names and aliases. A bundled snapshot is clearly labelled if the live catalogue is unavailable; you can also upload an updated catalogue. Semantic synonyms still require review, and the game importer checks again against the repository's current catalogue.

Keep the page in the foreground while generating on a phone. Drafts save in that browser only. To move between devices, choose **Save draft to file**, transfer the JSON file and use **Open draft / pack file** on the other device. Re-enter your key there; it is never included in the transfer. Browser storage may be evicted, particularly in private browsing, so keep a file backup.

Export the finished `.pack.json` and attach it to Codex to import into the game's GitHub repository. Pack generation and voice previews are billed by OpenAI. Legacy Fable speech remains an optional compatibility mode while the older Speech API is available. Existing recordings in the game are unaffected by model changes.

## Default models

New packs use `gpt-6-luna` for vocabulary and translations, and `gpt-image-2.5-flare` for images. These remain editable under Advanced model settings. Restoring an older draft preserves its saved model choices.

## Hosting and verification

Static GitHub Pages from `main`, repository root. All assets and imports are relative to this project's URL. `npm test` checks direct API requests, catalogue fallback, name validation and short-lived voice token handling with simulated responses; no test uses a live paid API key. OpenAI CORS preflight checks were verified for the browser origin. Paid generation still requires testing with your own project's API access.

Official documentation: [Realtime browser WebSockets](https://developers.openai.com/api/docs/guides/voice-websockets), [client tokens](https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create), [images](https://developers.openai.com/api/docs/guides/image-generation).
