# Alt2 Team C pairing status

## Participant roster

The group info panel reports exactly seven members; the canonical display names are in `participants.csv`.

## Chat-history coverage

WeChat's local Chat History view currently reports 481 indexed entries while paging from the latest message toward the oldest. The view includes text, images, video, audio, files, stickers, recalls, and system rows with timestamps. `message_media_map.csv` records every media pairing confirmed so far and keeps confidence explicit.

## Pairing method

Each confirmed row was paired from the main chat UI using the visible date/time divider, sender name/avatar, bubble side/position, and the matching local attachment timestamp. Raw attachments remain under `media_original/`; readable derivatives are under `decoded_media/`. WeChat `.dat` originals are preserved because the local container is not a standard image/video file and cannot be safely relabeled as a decoded asset.

## Current boundary

The roster is complete and the indexed-history count is confirmed. The main chat was scrolled back to the group creation boundary on 2026-01-28 and forward-scanned through the latest locally indexed history; the screen-verified transcript now contains 96 dated frames and 760 ordered entry bullets. Message-level media pairing remains confidence-labeled in `message_media_map.csv`; one low-confidence row remains because the exact bubble position has not yet been visually resolved. Deleted/expired UI items are recorded as unavailable when encountered and are not fabricated.

## Current screen-OCR additions

The transcript now includes screen-verified sections from the group creation date (2026-01-28) through the latest indexed history. The HTML and Markdown companions embed or link the available readable media beside the transcript and preserve original `.dat`/file attachments.
