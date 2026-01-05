const request = require("supertest");
const app = require("../server");

describe("Login", () => {

  test("Login exitoso", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@udla.edu.ec",
        password: "admin123"
      });

    expect(res.statusCode).toBe(200);
  });

  test("Login erróneo", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "admin@udla.edu.ec",
        password: "wrong"
      });

    expect(res.statusCode).toBe(401);
  });

});
