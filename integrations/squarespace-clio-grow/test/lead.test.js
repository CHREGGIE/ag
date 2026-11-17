import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { buildInboxLead, sendToClio, LeadError } from "../src/worker.js";

const opts = { source: "Website" };

test("maps a standard Squarespace contact form", () => {
  const lead = buildInboxLead(
    {
      fields: [
        { label: "fname", value: "Jane" },
        { label: "lname", value: "Doe" },
        { label: "Email", value: "jane@example.com" },
        { label: "Phone", value: "(212) 555-0100" },
        { label: "Practice Area", value: "Contracts" },
        { label: "How can we help?", value: "Need an NDA reviewed." },
      ],
      pageUrl: "https://www.example.com/contact",
      formName: "Contact Us",
    },
    opts,
  );
  assert.deepEqual(lead, {
    from_first: "Jane",
    from_last: "Doe",
    from_email: "jane@example.com",
    from_phone: "(212) 555-0100",
    from_message: "Need an NDA reviewed.\nPractice Area: Contracts",
    referring_url: "https://www.example.com/contact",
    from_source: "Website – Contact Us",
  });
});

test("never sends a blank required field (Clio rejects the lead)", () => {
  const lead = buildInboxLead(
    { fields: [{ label: "Name", value: "Cher" }, { label: "Email Address", value: "c@x.com" }] },
    opts,
  );
  assert.equal(lead.from_first, "Cher");
  assert.equal(lead.from_last, "(no last name)");
  assert.equal(lead.from_message, "(no message)");
  assert.equal(lead.referring_url, "(website form)");
  assert.equal(lead.from_source, "Website");
});

test("rejects a lead with no way to contact them", () => {
  assert.throws(() => buildInboxLead({ fields: [{ label: "Name", value: "A B" }] }, opts), LeadError);
});

test("posts the Clio Grow body shape", async () => {
  let call;
  const fetchImpl = async (url, init) => {
    call = { url, init };
    return { ok: true, status: 201 };
  };
  await sendToClio({ from_first: "A" }, { token: "tok", region: "us", fetchImpl });
  assert.equal(call.url, "https://grow.clio.com/inbox_leads");
  assert.deepEqual(JSON.parse(call.init.body), { inbox_lead: { from_first: "A" }, inbox_lead_token: "tok" });
  assert.equal(call.init.headers.Accept, "application/json");
});

test("retries once when Clio has a server error, not on a rejection", async () => {
  let calls = 0;
  const flaky = async () => (++calls === 1 ? { ok: false, status: 503, text: async () => "" } : { ok: true, status: 201 });
  assert.equal(await sendToClio({}, { token: "t", fetchImpl: flaky }), 201);
  assert.equal(calls, 2);

  calls = 0;
  const reject = async () => { calls++; return { ok: false, status: 422, text: async () => "from_message can't be blank" }; };
  await assert.rejects(sendToClio({}, { token: "t", fetchImpl: reject }), /422: from_message/);
  assert.equal(calls, 1);
});

test("worker blocks unknown origins and forwards allowed ones", async () => {
  const env = { ALLOWED_ORIGINS: "https://www.example.com", CLIO_INBOX_LEAD_TOKEN: "tok" };
  const realFetch = globalThis.fetch;
  let posted;
  globalThis.fetch = async (url, init) => { posted = JSON.parse(init.body); return { ok: true, status: 201 }; };
  try {
    const body = JSON.stringify({
      fields: [{ label: "fname", value: "Jane" }, { label: "Email", value: "j@x.com" }],
      pageUrl: "https://www.example.com/contact",
    });
    const req = (origin) => new Request("https://w.dev/", { method: "POST", headers: { Origin: origin, "Content-Type": "text/plain" }, body });

    const bad = await worker.fetch(req("https://evil.test"), env);
    assert.equal(bad.status, 403);
    assert.equal(posted, undefined);

    const ok = await worker.fetch(req("https://www.example.com"), env);
    assert.equal(ok.status, 202);
    assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://www.example.com");
    assert.equal(posted.inbox_lead.from_email, "j@x.com");
    assert.equal(posted.inbox_lead_token, "tok");
  } finally {
    globalThis.fetch = realFetch;
  }
});
