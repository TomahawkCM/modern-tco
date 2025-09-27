/**
 * Basic test to verify Jest setup is working
 */

describe("Jest Setup", () => {
  test("should run basic tests", () => {
    expect(1 + 1).toBe(2);
  });

  test("should have access to testing environment", () => {
    expect(typeof window).toBe("object");
  });
});
