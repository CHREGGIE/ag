import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInboxLead, sendToClio, LeadError } from "../lib/lead.js";
import handler from "../api/clio-lead.js";

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

test("splits a single Name field and fills required placeholders", () => {
  const lead = buildInboxLead(
    { fields: [{ label: "Name", value: "Cher" }, { label: "Email Address", value: "c@x.com" }] },
    opts,
  );
  assert.equal(lead.from_first, "Cher");
  assert.equal(lead.from_last, "(no last name)");
  assert.equal(lead.from_message, "(no message)");
  assert.equal(lead.referring_url, "(unknown page)");
  assert.equal(lead.from_source, "Website");
});

test("rejects a lead with no way to contact them", () => {
  assert.throws(
    () => buildInboxLead({ fields: [{ label: "Name", value: "A B" }] }, opts),
    LeadError,
  );
});

test("posts the Clio Grow body shape", async () => {
  let call;
  const fetchImpl = async (url, init) => {
    call = { url, init };
    return { ok: true, status: 201 };
  };
  await sendToClio({ from_first: "A" }, { token: "tok", region: "us", fetchImpl });
  assert.equal(call.url, "https://grow.clio.com/inbox_leads");
  assert.deepEqual(JSON.parse(call.init.body), {
    inbox_lead: { from_first: "A" },
    inbox_lead_token: "tok",
  });
  assert.equal(call.init.headers.Accept, "application/json");
});

function mockRes() {
  return {
    headers: {},
    statusCode: 0,
    body: undefined,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    end() { return this; },
  };
}

test("handler blocks unknown origins and forwards allowed ones", async () => {
  process.env.ALLOWED_ORIGINS = "https://www.example.com";
  process.env.CLIO_INBOX_LEAD_TOKEN = "tok";
  const realFetch = globalThis.fetch;
  let posted;
  globalThis.fetch = async (url, init) => { posted = JSON.parse(init.body); return { ok: true, status: 201 }; };
  try {
    const body = JSON.stringify({
      fields: [{ label: "fname", value: "Jane" }, { label: "Email", value: "j@x.com" }],
      pageUrl: "https://www.example.com/contact",
    });

    const bad = mockRes();
    await handler({ method: "POST", headers: { origin: "https://evil.test" }, body }, bad);
    assert.equal(bad.statusCode, 403);
    assert.equal(posted, undefined);

    const ok = mockRes();
    await handler({ method: "POST", headers: { origin: "https://www.example.com" }, body }, ok);
    assert.equal(ok.statusCode, 202);
    assert.equal(ok.headers["Access-Control-Allow-Origin"], "https://www.example.com");
    assert.equal(posted.inbox_lead.from_email, "j@x.com");
    assert.equal(posted.inbox_lead_token, "tok");
  } finally {
    globalThis.fetch = realFetch;
  }
});
