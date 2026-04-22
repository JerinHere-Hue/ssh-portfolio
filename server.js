const { Server } = require("ssh2");
const fs = require("fs");

const server = new Server({
  hostKeys: [fs.readFileSync("host.key")]
}, (client) => {

  client.on("authentication", (ctx) => {
    if (ctx.method === "none" || ctx.method === "password") {
      ctx.accept();
    } else {
      ctx.reject();
    }
  });

  client.on("ready", () => {
    client.on("session", (accept) => {
      const session = accept();

      session.on("shell", (accept) => {
        const stream = accept();

        // Handle terminal size
        stream.setEncoding("utf8");

        // Clear screen and show welcome
        stream.write("\x1b[2J\x1b[0f"); // Clear screen
        stream.write("\r\n");
        stream.write("\x1b[36m╔════════════════════════════════════════╗\x1b[0m\r\n");
        stream.write("\x1b[36m║\x1b[0m  🧋 Welcome to My Dream Terminal 💄  \x1b[36m║\x1b[0m\r\n");
        stream.write("\x1b[36m╚════════════════════════════════════════╝\x1b[0m\r\n");
        stream.write("\r\nType '\x1b[1mhelp\x1b[0m' to get started\r\n\r\n");
        stream.write("\x1b[35m$ \x1b[0m");

        const commands = {
          help: () => {
            stream.write("\x1b[33mAvailable Commands:\x1b[0m\r\n");
            stream.write("  \x1b[1mabout\x1b[0m    - Learn about me\r\n");
            stream.write("  \x1b[1mprojects\x1b[0m - View my projects\r\n");
            stream.write("  \x1b[1mwish\x1b[0m     - My dreams\r\n");
            stream.write("  \x1b[1mclear\x1b[0m    - Clear screen\r\n");
            stream.write("  \x1b[1mexit\x1b[0m     - Exit terminal\r\n");
          },
          about: () => {
            stream.write("\x1b[36m✨\x1b[0m I'm a creative dev with soft aesthetic vibes\r\n");
          },
          projects: () => {
            stream.write("\x1b[33m💄 Projects:\x1b[0m\r\n");
            stream.write("  • \x1b[1mGloss UI\x1b[0m - Beautiful UI components\r\n");
            stream.write("  • \x1b[1mBoba App\x1b[0m - Cozy tea app\r\n");
          },
          wish: () => {
            stream.write("\x1b[35m💌 I wish to build beautiful things\x1b[0m\r\n");
          },
          clear: () => {
            stream.write("\x1b[2J\x1b[0f");
          },
          exit: () => {
            stream.write("Goodbye! 👋\r\n");
            stream.end();
          }
        };

        stream.on("data", (data) => {
          try {
            const cmd = data.toString().trim().toLowerCase();

            if (cmd === "") {
              // Empty command, just show prompt
            } else if (commands[cmd]) {
              commands[cmd]();
            } else if (cmd === "ls" || cmd === "dir") {
              stream.write("\x1b[36mAbout | Projects | Wish\x1b[0m\r\n");
            } else {
              stream.write("\x1b[31mcommand not found: \x1b[1m" + cmd + "\x1b[0m\r\n");
              stream.write("Type '\x1b[1mhelp\x1b[0m' for available commands\r\n");
            }

            stream.write("\x1b[35m$ \x1b[0m");
          } catch (err) {
            console.error("Stream data error:", err);
            stream.write("\x1b[31mError processing command\x1b[0m\r\n");
            stream.write("\x1b[35m$ \x1b[0m");
          }
        });

        stream.on("close", () => {
          console.log("Stream closed");
        });

        stream.on("error", (err) => {
          console.error("Stream error:", err);
        });
      });

      session.on("subsystem", (accept, reject) => {
        reject();
      });

      session.on("env", (accept, reject) => {
        accept();
      });
    });
  });

  client.on("error", (err) => {
    console.error("Client error:", err);
  });

  client.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 443;

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SSH Server running on port ${PORT}`);
  console.log(`Connect with: ssh -p ${PORT} localhost`);
});
