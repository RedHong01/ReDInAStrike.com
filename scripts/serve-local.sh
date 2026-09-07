#!/bin/bash
# Ensure exactly one local ReDInAStrikE server, then show it in an app window.
#
#   serve-local.sh            start/reuse the server and open the window
#   serve-local.sh --no-open  start/reuse the server only
#   serve-local.sh --status   report what is running
#   serve-local.sh --stop     stop every local server for this project
#
# Deliberately depends on nothing but macOS stock tools (python3, curl, open) so
# it keeps working whether or not node is installed.

set -uo pipefail

PORT="${REDINASTRIKE_PORT:-5173}"
URL="http://127.0.0.1:${PORT}/"
HEALTH="http://127.0.0.1:${PORT}/__redinastrike_health"

PROJECT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY_SERVER="${PROJECT}/scripts/dev-server.py"
NODE_SERVER="${PROJECT}/server.mjs"

STATE="${HOME}/Library/Application Support/ReDInAStrikE"
LOGDIR="${HOME}/Library/Logs/ReDInAStrikE"
CHROME_PROFILE="${STATE}/chrome-profile"
WINDOW_PID_FILE="${STATE}/window.pid"
LOG="${LOGDIR}/server.log"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$STATE" "$LOGDIR"

say() { printf '%s\n' "$*" >&2; }

# --- server identity -------------------------------------------------------

# 0 when our own server answers on $PORT and serves this project.
server_is_ours() {
  local body
  body="$(curl -fsS --max-time 2 "$HEALTH" 2>/dev/null)" || return 1
  [[ "$body" == *'"app": "redinastrike"'* ]] || return 1
  [[ "$body" == *"\"root\": \"${PROJECT}\""* ]]
}

port_busy() { lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; }

port_pids() { lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | sort -u; }

proc_cwd() {
  lsof -a -p "$1" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1
}

# True only for a process running THIS project's server.mjs / dev-server.py.
# Other apps ship files called server.mjs and may even inherit this working
# directory, so the script path is resolved and compared exactly.
is_project_server() {
  local pid="$1" args script cwd
  args="$(ps -o args= -p "$pid" 2>/dev/null)" || return 1
  [ -n "$args" ] || return 1

  # shellcheck disable=SC2086
  script="$(printf '%s\n' $args | grep -m1 -E '(^|/)(server\.mjs|dev-server\.py)$')"
  [ -n "$script" ] || return 1

  case "$script" in
    /*)
      [ "$script" = "$NODE_SERVER" ] || [ "$script" = "$PY_SERVER" ]
      ;;
    *)
      cwd="$(proc_cwd "$pid")"
      [ -n "$cwd" ] || return 1
      script="${script#./}"
      [ "${cwd}/${script}" = "$NODE_SERVER" ] || [ "${cwd}/${script}" = "$PY_SERVER" ]
      ;;
  esac
}

# Only processes that actually hold a listening TCP socket are considered, so
# stdio helpers that merely happen to be named server.mjs are never touched.
project_server_pids() {
  local pid
  for pid in $(lsof -nP -iTCP -sTCP:LISTEN -t 2>/dev/null | sort -u); do
    is_project_server "$pid" && printf '%s\n' "$pid"
  done
  return 0
}

stop_all_servers() {
  local pids
  pids="$(project_server_pids)"
  [ -z "$pids" ] && return 0
  say "  停止本项目的服务进程: $(echo "$pids" | tr '\n' ' ')"
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 0.2
    [ -z "$(project_server_pids)" ] && return 0
  done
  pids="$(project_server_pids)"
  # shellcheck disable=SC2086
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null
  return 0
}

# Kill every project server except the one PID given.
prune_duplicates() {
  local keep="$1" pid extra=""
  for pid in $(project_server_pids); do
    [ "$pid" = "$keep" ] && continue
    extra="$extra $pid"
  done
  if [ -n "$extra" ]; then
    say "  发现多余的服务实例，正在关闭:$extra"
    # shellcheck disable=SC2086
    kill $extra 2>/dev/null
  fi
}

start_server() {
  say "  启动服务 (python3, root=${PROJECT})"
  : > "$LOG"
  nohup /usr/bin/python3 "$PY_SERVER" "$PROJECT" "$PORT" >>"$LOG" 2>&1 &
  disown 2>/dev/null
  for _ in $(seq 1 40); do
    sleep 0.25
    server_is_ours && return 0
  done
  say "服务启动失败。日志: $LOG"
  tail -20 "$LOG" >&2
  return 1
}

ensure_single_server() {
  if server_is_ours; then
    local pid
    pid="$(port_pids | head -1)"
    say "  服务已在运行 (pid ${pid}, 端口 ${PORT})，复用它"
    prune_duplicates "$pid"
    return 0
  fi

  if port_busy; then
    local pids cmd
    pids="$(port_pids)"
    if [ -n "$(project_server_pids)" ]; then
      say "  端口 ${PORT} 被本项目的旧服务占用，替换它"
      stop_all_servers
    else
      cmd="$(ps -o comm= -p "$(echo "$pids" | head -1)" 2>/dev/null)"
      say "端口 ${PORT} 被无关进程占用: pid $(echo "$pids" | tr '\n' ' ')(${cmd:-未知})"
      say "换个端口再试:  REDINASTRIKE_PORT=5174 $0"
      return 1
    fi
  else
    stop_all_servers   # clear servers parked on other ports
  fi

  start_server
}

# --- app window ------------------------------------------------------------
# REDINASTRIKE_BROWSER=default|safari|chrome|system  (default: follow the system
# default browser). Safari has no --app mode, so it gets an AppleScript that
# reuses an existing tab instead of piling up windows.

BROWSER_PREF="${REDINASTRIKE_BROWSER:-default}"

default_browser_id() {
  local plist="${HOME}/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist"
  [ -f "$plist" ] || return 0
  /usr/bin/plutil -convert json -o - "$plist" 2>/dev/null | /usr/bin/python3 -c '
import json, sys
try:
    handlers = json.load(sys.stdin).get("LSHandlers", [])
except Exception:
    sys.exit(0)
for h in handlers:
    if h.get("LSHandlerURLScheme") == "https":
        print((h.get("LSHandlerRoleAll") or "").lower())
        break
' 2>/dev/null
}

resolve_browser() {
  local choice="$BROWSER_PREF"
  if [ "$choice" = "default" ]; then
    case "$(default_browser_id)" in
      *safari*) choice="safari" ;;
      *chrome*) choice="chrome" ;;
      "")       choice="safari" ;;
      *)        choice="system" ;;
    esac
  fi
  printf '%s' "$choice"
}

chrome_window_alive() {
  [ -f "$WINDOW_PID_FILE" ] || return 1
  local pid
  pid="$(cat "$WINDOW_PID_FILE" 2>/dev/null)"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

open_safari() {
  # Focus an existing tab on this URL, otherwise open one new window.
  if osascript - "$URL" >/dev/null 2>&1 <<'APPLESCRIPT'
on run argv
  set targetURL to item 1 of argv
  tell application "Safari"
    activate
    set found to false
    try
      repeat with w in windows
        try
          repeat with t in tabs of w
            if (URL of t as string) starts with targetURL then
              set current tab of w to t
              set index of w to 1
              set found to true
              exit repeat
            end if
          end repeat
        end try
        if found then exit repeat
      end repeat
    end try
    if not found then
      make new document with properties {URL:targetURL}
    end if
  end tell
end run
APPLESCRIPT
  then
    say "  已在 Safari 中打开/切回"
    return 0
  fi
  say "  Safari 自动化不可用，改用普通方式打开"
  open -a Safari "$URL"
}

open_chrome() {
  if chrome_window_alive; then
    say "  窗口已打开，切到前台"
    osascript -e "tell application \"System Events\" to set frontmost of (first process whose unix id is $(cat "$WINDOW_PID_FILE")) to true" >/dev/null 2>&1
    return 0
  fi
  say "  打开 Chrome 应用窗口"
  "$CHROME" \
    --app="$URL" \
    --user-data-dir="$CHROME_PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-features=Translate,ChromeWhatsNewUI \
    >/dev/null 2>&1 &
  echo $! > "$WINDOW_PID_FILE"
  disown 2>/dev/null
}

open_window() {
  case "$(resolve_browser)" in
    safari) open_safari ;;
    chrome)
      if [ -x "$CHROME" ]; then open_chrome; else open "$URL"; fi
      ;;
    *)
      say "  用默认浏览器打开"
      open "$URL"
      ;;
  esac
}

# --- entry point -----------------------------------------------------------

case "${1:-}" in
  --stop)
    stop_all_servers
    if chrome_window_alive; then kill "$(cat "$WINDOW_PID_FILE")" 2>/dev/null; fi
    rm -f "$WINDOW_PID_FILE"
    say "已全部停止。"
    ;;
  --status)
    say "项目:   $PROJECT"
    say "地址:   $URL"
    if server_is_ours; then
      say "服务:   运行中 · 本脚本的 python 服务 (pid $(port_pids | tr '\n' ' '))"
    elif port_busy; then
      _p="$(port_pids | head -1)"
      if is_project_server "$_p"; then
        say "服务:   运行中 · 本项目的其它服务 (pid ${_p})，下次启动会被替换"
      else
        say "服务:   端口被无关进程占用 (pid ${_p}, $(ps -o comm= -p "$_p" 2>/dev/null))"
      fi
    else
      say "服务:   未运行"
    fi
    say "实例数: $(project_server_pids | grep -c .) 个本项目服务在监听"
    say "浏览器: $(resolve_browser)"
    say "日志:   $LOG"
    ;;
  --no-open)
    ensure_single_server
    ;;
  *)
    ensure_single_server && open_window
    ;;
esac
