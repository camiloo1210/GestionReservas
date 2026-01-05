const request = require("supertest");
const app = require("../server");

describe("Reservas", () => {

  test("Reserva válida", async () => {
    const res = await request(app)
      .post("/reservations")
      .send({
        room_id: 1,
        date: "2026-01-15",
        start_time: "09:00",
        end_time: "10:00"
      });

    expect(res.statusCode).toBe(201);
  });

  test("Reserva solapada", async () => {
    const res = await request(app)
      .post("/reservations")
      .send({
        room_id: 1,
        date: "2026-01-15",
        start_time: "09:30",
        end_time: "10:30"
      });

    expect(res.statusCode).toBe(400);
  });

});
    