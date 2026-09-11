# Discord export

Files:
- `transcript.md`: chronological transcription and interpretation.
- `manifest.csv`: media/link inventory with sender, timestamp, channel, source URL, and local path.
- `media/`: original files saved locally so far.
- `derived/`: reserved for OCR and audio/video derivatives.

Discord CDN downloads from the shell were unavailable in this environment (`cdn.discordapp.com` DNS was blocked), so most attachments are recorded with their exact exposed Discord URL and filename but remain to be downloaded through Discord UI or a later network-enabled pass.

## Added scope: Text Channels category

On 2026-09-11 the export was extended with the five channels shown in the supplied Discord screenshot: `😃║general_chat`, `📚║class-assignments`, `🤡║random-af`, `⁉️║questions-for-instructors`, and `🛠️║tool-checkout`. Their message text, timestamps, senders, thread counts, links, attachment names, and visible media placeholders are now in `transcript.md` and `manifest.csv`. Discord exposed exact CDN URLs for two general-chat videos; the remaining media are retained as filename/placeholder references because the local UI did not provide stable URLs or downloadable originals. The forum’s 64-message Arduino/DFPlayer thread was opened and transcribed at message level; the other five forum threads are represented by their indexed opening posts and message counts.
