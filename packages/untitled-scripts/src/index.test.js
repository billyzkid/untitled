import { run } from "./index"
import spawn from "cross-spawn";

jest.mock("cross-spawn");

test("run function should be exported", () => {
  expect(run).toBeInstanceOf(Function);
});

["build", "eject", "start", "test"].forEach((script) => {
  test(`${script} script should fail`, () => {
    spawn.sync = jest.fn(() => ({ signal: "SIGTERM", status: 1 }));
    console.log = jest.fn();

    const code = run(script);

    expect(code).toBe(1);
    expect(spawn.sync.mock.calls.length).toBe(1);
    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0][0]).toBe(`The "${script}" script failed because the process exited too early. This probably means it was killed or the system ran out of memory. Signal: SIGTERM`);
  });

  test(`${script} script should succeed`, () => {
    spawn.sync = jest.fn(() => ({ status: 0 }));
    console.log = jest.fn();

    const code = run(script);

    expect(code).toBe(0);
    expect(spawn.sync.mock.calls.length).toBe(1);
    expect(console.log.mock.calls.length).toBe(0);
  });
});

test("unknown script should be detected", () => {
  spawn.sync = jest.fn(() => ({ status: 0 }));
  console.log = jest.fn();

  const code = run("xyzzy");

  expect(code).toBe(0);
  expect(spawn.sync.mock.calls.length).toBe(0);
  expect(console.log.mock.calls.length).toBe(1);
  expect(console.log.mock.calls[0][0]).toBe(`Unknown script "xyzzy". Perhaps you need to update untitled-scripts? See: https://github.com/billyzkid/untitled/blob/master/README.md#updating`);
});
