# Alt2 Team C media capture

This folder contains the media files copied from the local WeChat account storage for the conversation media container identified while browsing `Alt2 Team C`.

- `media_original/` preserves the original WeChat `.dat` files without recompression.
- `media_manifest.csv` records the copied relative path, month folder, media kind, byte size, and filesystem modification time.
- Files shown by WeChat as expired/deleted were not added through the UI; existing local files are preserved as-is.

The `.dat` extension is the original WeChat storage format. Message-level sender/time pairing and human-readable decoding are handled in the transcript pass.
