# Alt2 Team C WeChat capture

This folder contains a local WeChat capture for `Alt2 Team C`.

- `participants.csv` is the seven-member roster read from the group info panel.
- `message_media_map.csv` pairs confirmed media with date, time, sender, bubble context, and a confidence level. `workspace_copy` points to the copy that another agent can read inside this folder.
- `media_original/` preserves the original WeChat `.dat` files without recompression.
- `media_manifest.csv` records the copied relative path, month folder, media kind, byte size, and filesystem modification time.
- `decoded_media/` contains readable derivatives that were available locally, including the confirmed video thumbnail.
- `pairing_status.md` records the 481-entry indexed-history boundary and the remaining low-confidence rows.
- `transcript_partial.md` contains manually verified text sections; it is explicitly marked partial.
- `transcript_with_media.html` and `transcript_with_media.md` place readable image/video files beside each media record; videos are linked as playable files where the format supports it.

The `.dat` extension is the original WeChat storage format. Files shown by WeChat as expired/deleted are not fabricated; when a local original or thumbnail exists it remains preserved and is linked in the mapping.
