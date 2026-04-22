const { Server } = require("ssh2");
const fs = require("fs");

const server = new Server({
  hostKeys: [fs.readFileSync("host.key")]
}, (client) => {

  client.on("authentication", (ctx) => ctx.accept());

  client.on("ready", () => {
    client.on("session", (accept) => {
      const session = accept();

      session.on("shell", (accept) => {
        const stream = accept();

        stream.write("\r\n🧋 Welcome to My Dream Terminal 💄\r\n");
        stream.write("Type 'help'\r\n\r\n$ ");

        stream.on("data", (data) => {
          const cmd = data.toString().trim();

          if (cmd === "help") {
            stream.write("about | projects | wish\r\n");
          } 
          else if (cmd === "about") {
            stream.write("✨ I’m a creative dev with soft aesthetic vibes\r\n");
          } 
          else if (cmd === "projects") {
            stream.write("💄 Gloss UI | 🧋 Boba App\r\n");
          } 
          else if (cmd === "wish") {
            stream.write("💌 I wish to build beautiful things\r\n");
          } 
          else {
            stream.write("command not found\r\n");
          }

          stream.write("$ ");
        });
      });
    });
  });
});

const PORT = process.env.PORT || 443;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Running on port", PORT);
});
