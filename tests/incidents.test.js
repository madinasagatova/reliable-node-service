const request = require("supertest");
const createApp = require("../src/app");
const createFakePool = require("./fakePool");

describe("incident API", () => {
  test("creates and returns an incident", async () => {
    const app = createApp(createFakePool());

    const response = await request(app)
      .post("/incidents")
      .send({
        service_name: "payment-api",
        severity: "high",
        status: "investigating",
        description: "Database latency is above normal threshold"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe(1);
    expect(response.body.data.service_name).toBe("payment-api");
    expect(response.body.data.severity).toBe("high");
  });

  test("validates required incident fields", async () => {
    const app = createApp(createFakePool());

    const response = await request(app)
      .post("/incidents")
      .send({
        severity: "critical"
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("bad_request");
  });

  test("updates incident status", async () => {
    const app = createApp(
      createFakePool([
        {
          id: 1,
          service_name: "checkout-api",
          severity: "critical",
          status: "open",
          description: "Error rate spike",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    );

    const response = await request(app)
      .patch("/incidents/1")
      .send({
        status: "resolved"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("resolved");
  });

  test("returns 404 for missing incident", async () => {
    const app = createApp(createFakePool());

    const response = await request(app).get("/incidents/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("not_found");
  });
});
