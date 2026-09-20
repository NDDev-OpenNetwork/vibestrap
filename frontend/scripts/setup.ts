import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const expectedBun = (await Bun.file(`${root}.bun-version`).text()).trim();
if (Bun.version !== expectedBun) {
  throw new Error(`Use Bun ${expectedBun}; current version is ${Bun.version}.`);
}

const environment = Bun.file(`${root}.env`);
if (!(await environment.exists())) {
  const template = await Bun.file(`${root}.env.example`).text();
  await writeFile(
    `${root}.env`,
    template.replace(
      "BETTER_AUTH_SECRET=",
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`
    ),
    { flag: "wx", mode: 0o600 }
  );
  process.stdout.write("Created root .env with a random auth secret.\n");
} else {
  process.stdout.write("Keeping existing root .env.\n");
}

const install = Bun.spawn(["bun", "run", "install:all"], {
  cwd: root,
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
});
process.exitCode = await install.exited;
