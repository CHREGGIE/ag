// Runs zapier/code-step.js the way Code by Zapier does: as the body of an async
// function with `inputData`, `output` and `fetch` in scope.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../zapier/code-step.js", import.meta.url), "utf8");
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const step = new AsyncFunction("inputData", "fetch", `let output; ${src}\nreturn output;`);

function fakeFetch(status = 201) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: status < 300, status, text: async () => "{}" };
  };
  return { fn, calls };
}

test("posts a full lead with extras and an awkward message", async () => {
  const f = fakeFetch();
  const out = await step(
    {
      token: "tok",
      source: "Website – Contact Us",
      pageUrl: "https://www.example.com/contact",
      firstName: "Jane",
      lastName: "O'Neil",
      email: "jane@example.com",
      phone: "212-555-0100",
      message: 'Signed a "non-compete".\nIs it valid?',
      "extra_Practice Area": "Employment",
      extra_County: "",
    },
    f.fn,
  );
  assert.deepEqual(out, { status: 201 });
  assert.equal(f.calls[0].url, "https://grow.clio.com/inbox_leads");
  assert.deepEqual(f.calls[0].body, {
    inbox_lead_token: "tok",
    inbox_lead: {
      from_first: "Jane",
      from_last: "O'Neil",
      from_email: "jane@example.com",
      from_phone: "212-555-0100",
      from_message: 'Signed a "non-compete".\nIs it valid?\nPractice Area: Employment',
      referring_url: "https://www.example.com/contact",
      from_source: "Website – Contact Us",
    },
  });
});

test("splits a single name field and uses the EU endpoint", async () => {
  const f = fakeFetch();
  await step({ token: "t", region: "EU", name: "Mary Ann Smith", email: "m@x.com" }, f.fn);
  assert.equal(f.calls[0].url, "https://eu.grow.clio.com/inbox_leads");
  assert.equal(f.calls[0].body.inbox_lead.from_first, "Mary");
  assert.equal(f.calls[0].body.inbox_lead.from_last, "Ann Smith");
});

test("refuses a lead with no email or phone", async () => {
  const f = fakeFetch();
  await assert.rejects(step({ token: "t", name: "A B" }, f.fn), /no email or phone/);
  assert.equal(f.calls.length, 0);
});

test("errors the Zap run when Clio rejects the push", async () => {
  const f = fakeFetch(401);
  await assert.rejects(step({ token: "bad", email: "a@b.c" }, f.fn), /returned 401/);
});
