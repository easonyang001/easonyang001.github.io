import "dotenv/config";
import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import { createUser, pool } from "../src/db.js";

const CTRL_C = "";
const BACKSPACE = "";

function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    let password = "";
    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    const onData = (char: string) => {
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
        return;
      }
      if (char === CTRL_C) {
        process.exit(1);
      }
      if (char === BACKSPACE) {
        password = password.slice(0, -1);
        return;
      }
      password += char;
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const username = (await rl.question("Username: ")).trim();
  rl.close();
  const password = await promptPassword("Password: ");

  if (!username || !password) {
    console.error("Username and password are both required.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser(username, passwordHash);
  console.log(`Created user "${user.username}" (id ${user.id}).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
