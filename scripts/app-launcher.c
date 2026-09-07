/*
 * Native entry point for ReDInAStrikE.app.
 *
 * A shell script cannot be the app's executable: when the running binary is
 * /bin/bash, macOS refuses to show a TCC prompt (Apple does not let interpreters
 * inherit permissions), so reading the project under ~/Desktop fails with
 * EPERM and the user is never asked. A real signed Mach-O binary does get
 * prompted, and the bash child it exec's inherits that grant.
 *
 * Built by scripts/make-mac-app.sh with -DLAUNCHER_PATH="..."
 */

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#ifndef LAUNCHER_PATH
#error "compile with -DLAUNCHER_PATH=\"/path/to/serve-local.sh\""
#endif

static void alert(const char *message) {
    char script[2048];
    snprintf(script, sizeof(script),
             "display alert \"ReDInAStrikE\" message \"%s\" as critical",
             message);
    pid_t pid = fork();
    if (pid == 0) {
        execl("/usr/bin/osascript", "osascript", "-e", script, (char *)NULL);
        _exit(127);
    }
    if (pid > 0) {
        int status;
        waitpid(pid, &status, 0);
    }
}

int main(void) {
    const char *launcher = LAUNCHER_PATH;

    /* Touch the file from this binary so the TCC prompt is attributed to the
       app itself rather than to bash, which would be denied silently. */
    int fd = open(launcher, O_RDONLY);
    if (fd < 0) {
        if (errno == EPERM || errno == EACCES) {
            alert("macOS 拒绝了本 App 访问项目所在的文件夹。\n\n"
                  "打开「系统设置 → 隐私与安全性 → 文件与文件夹」，"
                  "允许 ReDInAStrikE 访问「桌面文件夹」；"
                  "或在「完全磁盘访问权限」里加入本 App。\n\n"
                  "更彻底的办法：把项目从 ~/Desktop 移到 ~/Projects 这类"
                  "不受系统保护的目录，然后重新运行 scripts/make-mac-app.sh。");
        } else {
            char msg[1200];
            snprintf(msg, sizeof(msg),
                     "找不到项目启动脚本：\n%s\n\n(%s)\n\n"
                     "项目可能被移动或重命名了。重新运行 scripts/make-mac-app.sh 即可修复。",
                     launcher, strerror(errno));
            alert(msg);
        }
        return 1;
    }
    close(fd);

    execl("/bin/bash", "bash", launcher, (char *)NULL);

    alert("无法执行启动脚本。");
    return 1;
}
