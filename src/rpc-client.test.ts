import { Request, runDefaultServer } from "ts-json-rpc-server";
import createRpcClient from "./rpc-client";
import fetch from "node-fetch";
import test from "tape-async";

test("integration", async t => {
  const methods = {
    hello(_: Request, name: string) {
      return "hello, " + name + "!";
    },
    async goodbye() {
      return "goodbye";
    },
    async err() {
      throw new Error("this was an error");
    }
  };
  const server = await runDefaultServer(methods, 2288);
  const client = createRpcClient<typeof methods>(
    "http://localhost:2288/rpc",
    (fetch as unknown) as typeof window.fetch
  );

  const rv = await client.hello("pete");
  t.equal(rv, "hello, pete!");
  t.equal(await client.goodbye(), "goodbye");

  try {
    await client.err();
    t.fail();
  } catch (e) {
    t.equal(e.message, "Error: this was an error");
  }

  server.close();
});
