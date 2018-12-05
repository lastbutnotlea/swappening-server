import { Delays, greeter } from "../src/main";

console.log("Start");
const Sequelize = require("sequelize");
const sequelize  = new Sequelize("postgres", "postgres", "password", {
  host: "vmkemper14.informatik.tu-muenchen.de",
  dialect: "postgres",

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

console.log("Check");

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

console.log("End");

describe("greeter function", () => {
  // Read more about fake timers: http://facebook.github.io/jest/docs/en/timer-mocks.html#content
  jest.useFakeTimers();

  const name: string = "John";

  let hello: string;

  // Act before assertions
  beforeAll(async () => {
    const p: Promise<string> = greeter(name);
    jest.runOnlyPendingTimers();
    hello = await p;
  });

  // Assert if setTimeout was called properly
  it("delays the greeting by 2 seconds", () => {
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(((setTimeout as Function) as jest.Mock).mock.calls[0][1]).toBe(
      Delays.Long,
    );
  });

  // Assert greeter result
  it("greets a user with `Hello, {name}` message", () => {
    expect(hello).toBe(`Hello, ${name}`);
  });
});
