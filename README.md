# Pack Studio

Create bilingual vocabulary packs from any modern desktop, tablet or phone browser:

https://fishdawg90.github.io/little-word-worlds-studio/

The game lives separately at https://fishdawg90.github.io/little-word-worlds/.

## Use

Enter your own OpenAI API key, choose a topic and number of items, review the English and Italian vocabulary, then generate images and recordings. You can edit the illustration prompt, compare voices and resume partially finished packs. API requests use your API balance; nothing is generated automatically on page load.

The site runs entirely in your browser; there is no local installation, shared API key or hosted generation server. Your key is kept only in the current tab and sent directly to api.openai.com over HTTPS. It is never stored in this repository, browser storage, saved drafts or exported packs. Voice WebSockets use a separately minted short-lived OpenAI token. As with any browser tool where you enter credentials, use a device and extensions you trust. There are no analytics, third-party scripts or CDN dependencies.

The online game catalogue is refreshed before generation/export to avoid existing names and aliases. A bundled snapshot is clearly labelled if the live catalogue is unavailable; you can also upload an updated catalogue. Semantic synonyms still require review, and the game importer checks again against the repository's current catalogue.

Keep the phone unlocked and the page in the foreground while generating. Screen-awake mode is enabled by default and requests a Screen Wake Lock where supported, then releases it after generation and ZIP creation. It cannot override manual locking, low-power restrictions or browser suspension. New requests wait while the page is hidden and continue when visible if the tab survives. Failed or interrupted requests are never retried automatically, because an unknown-outcome request could already have been billed. Drafts save in that browser only. To move between devices, choose **Save draft to file**, transfer the JSON file and use **Open draft / pack file** on the other device. Re-enter your key there; it is never included in the transfer. Returning to the studio also recovers the latest saved draft automatically. A recovered draft never starts paid generation by itself: re-enter your key and click Generate missing images & voices to continue. Browser storage may be evicted, particularly in private browsing, so keep a file backup.

On completion, the studio automatically creates a compressed ZIP containing a finished `.pack.json` and attempts to download it. If the browser blocks the automatic download, tap **Download finished ZIP**. You can also create the ZIP again or export plain JSON for the game’s browser importer. Attach the ZIP to Codex to publish it for everyone. Pack generation and voice previews are billed by OpenAI. Legacy Fable speech remains an optional compatibility mode while the older Speech API is available. Existing recordings in the game are unaffected by model changes.

## Extend an existing pack

Choose a pack under **Extend a pack from the game** and click **Load pack**, or open a previously exported JSON/ZIP using **Open draft / pack JSON or ZIP**. Published packs load their existing images and recordings without OpenAI calls. The original words and media are protected. Enter **Words to add**, click **Suggest extra vocabulary**, review the additions, then generate missing media. Suggestions append to the list, and generation reuses every finished asset. Packs can contain up to 200 words, with 1–52 additions per suggestion request.

Prompts, models, image quality, voices and voice direction travel with exports in `pack.authoring`. Each item's `generation` also records the settings actually used for its image and recordings, so changing the defaults for additions does not rewrite an older asset's provenance. Only known authoring fields are kept; API keys are excluded. A loaded draft retains the source pack ID and original item keys. Its export updates that same pack; **Start a new pack** returns to a blank draft.

Fruit & Vegetables includes the original settings recovered from its uploaded draft. The original Animals illustration prompt was not recorded; the editor labels it unavailable and offers its editable default for additions. Its known voice choices and Italian recording instructions are preserved. Existing recordings are never regenerated just by loading a pack.

Attach the finished extended ZIP to Codex and ask to update the published pack. Plain JSON can also update a locally imported pack in the game. If another version has added words since your copy, load the latest published pack first so additions are not lost.

## Default models

New packs use `gpt-6-luna` for vocabulary and translations, and `gpt-image-2.5-flare` for images. These remain editable under Advanced model settings. Restoring an older draft preserves its saved model choices.

## Hosting and verification

Static GitHub Pages from `main`, repository root. All assets and imports are relative to this project's URL. `npm test` checks direct API requests, catalogue fallback, name validation and short-lived voice token handling with simulated responses; no test uses a live paid API key. OpenAI CORS preflight checks were verified for the browser origin. Paid generation still requires testing with your own project's API access.

Official documentation: [Realtime browser WebSockets](https://developers.openai.com/api/docs/guides/voice-websockets), [client tokens](https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create), [images](https://developers.openai.com/api/docs/guides/image-generation).
