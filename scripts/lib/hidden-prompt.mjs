/**
 * Hidden terminal prompt for admin scripts. Handles typed and pasted input:
 * - processes input character by character (pastes arrive as one chunk)
 * - strips bracketed-paste markers (ESC[200~ … ESC[201~) and other escape sequences
 * - ignores control characters, stops at Enter
 */
export function hiddenPrompt(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      reject(new Error("Run this in an interactive terminal."));
      return;
    }
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const done = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      stdout.write("\n");
      resolve(value);
    };
    const onData = (chunk) => {
      // Remove escape sequences such as bracketed-paste markers and arrow keys.
      const clean = chunk.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
      for (const char of clean) {
        if (char === "\r" || char === "\n" || char === "\u0004") return done();
        if (char === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " ") value += char; // ignore other control characters
      }
    };
    stdin.on("data", onData);
  });
}
