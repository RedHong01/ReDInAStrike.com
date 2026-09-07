#!/bin/bash
# Build ~/Applications/ReDInAStrikE.app — a one-click launcher that guarantees a
# single local server for this project and shows the site in its own window.
#
# Re-run this after moving the project or changing public/favicon.svg.

set -euo pipefail

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="ReDInAStrikE"
APP="${HOME}/Applications/${APP_NAME}.app"
LAUNCHER="${PROJECT}/scripts/serve-local.sh"

[ -x "$LAUNCHER" ] || { echo "缺少 $LAUNCHER" >&2; exit 1; }

echo "项目: $PROJECT"
echo "目标: $APP"

rm -rf "$APP"
mkdir -p "${APP}/Contents/MacOS" "${APP}/Contents/Resources"

# --- icon ------------------------------------------------------------------
echo "生成图标…"
/usr/bin/python3 "${PROJECT}/scripts/svg-to-icns.py" \
  "${PROJECT}/public/favicon.svg" "${APP}/Contents/Resources/AppIcon.icns"

# --- Info.plist ------------------------------------------------------------
cat > "${APP}/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>${APP_NAME}</string>
  <key>CFBundleDisplayName</key><string>${APP_NAME}</string>
  <key>CFBundleIdentifier</key><string>com.redinastrike.local-preview</string>
  <key>CFBundleExecutable</key><string>${APP_NAME}</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
  <!-- launcher only: do the work, then get out of the way -->
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
  <!-- the project lives under ~/Desktop, which macOS gates behind TCC -->
  <key>NSDesktopFolderUsageDescription</key>
  <string>需要读取桌面上的 ReDInAStrikE 项目文件，才能在本地预览这个网站。</string>
  <key>NSDocumentsFolderUsageDescription</key>
  <string>需要读取 ReDInAStrikE 项目文件，才能在本地预览这个网站。</string>
  <!-- Safari has no --app mode; AppleScript is how the window gets reused -->
  <key>NSAppleEventsUsageDescription</key>
  <string>需要控制浏览器，才能打开或切回本地预览窗口。</string>
</dict>
</plist>
PLIST

# --- executable ------------------------------------------------------------
# Must be a real Mach-O binary, not a script: macOS will not show a TCC prompt
# for an app whose executable is /bin/bash, so a script-based bundle can never
# gain access to the project under ~/Desktop. See scripts/app-launcher.c.
echo "编译启动器…"
/usr/bin/clang -arch arm64 -arch x86_64 -O2 -Wall \
  -DLAUNCHER_PATH="\"${LAUNCHER}\"" \
  -o "${APP}/Contents/MacOS/${APP_NAME}" \
  "${PROJECT}/scripts/app-launcher.c"
chmod +x "${APP}/Contents/MacOS/${APP_NAME}"

/usr/bin/plutil -lint "${APP}/Contents/Info.plist" >/dev/null

# Ad-hoc sign so the bundle has a stable identity. Without it macOS treats every
# launch as a new app: the Desktop-access prompt never sticks and the launcher
# dies with "Operation not permitted" (the project lives under ~/Desktop).
echo "签名…"
/usr/bin/codesign --force --deep --sign - "$APP"
/usr/bin/codesign --verify --deep --strict "$APP" && echo "  签名有效"

# Refresh the icon cache so Finder/Dock pick the new artwork up immediately.
touch "$APP"

echo "完成: $APP"
