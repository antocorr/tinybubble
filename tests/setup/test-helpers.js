export async function flushMicrotasks(times = 2) {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

export async function waitFor(assertion, options = {}) {
  const timeout = options.timeout ?? 700;
  const interval = options.interval ?? 10;
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeout) {
    try {
      const result = await assertion();
      if (result === false) {
        throw new Error("Condition not met yet");
      }
      return result;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw lastError || new Error("waitFor timeout");
}
