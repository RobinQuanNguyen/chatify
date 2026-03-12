import "@testing-library/jest-dom";
import { afterAll, beforeAll, vi } from "vitest";

if (!window.matchMedia) {
	window.matchMedia = (query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

let originalConsoleLog;

beforeAll(() => {
	originalConsoleLog = console.log;

	vi.spyOn(console, "log").mockImplementation((...args) => {
		const firstArg = args[0];
		if (typeof firstArg === "string" && firstArg.includes("Error checking auth:")) {
			return;
		}

		originalConsoleLog(...args);
	});
});

afterAll(() => {
	console.log.mockRestore();
});

// import { afterEach } from "vitest";
// import { cleanup } from "@testing-library/react";

// afterEach(() => cleanup());