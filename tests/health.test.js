const request = require("supertest");
const createApp = require("../src/app");
const createFakePool = require("./fakePool");

describe("health endpoints", () => {
  test("GET /health returns liveness state", async () => {
    const app = createApp(createFakePool());

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("reliable-node-service");
  });

  test("GET /ready checks database dependency", async () => {
    const app = createApp(createFakePool());

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ready");
    expect(response.body.dependencies.mysql).toBe("ok");
  });
});
