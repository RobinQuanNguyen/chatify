import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import axios from "axios";
import LoginPage from "../../pages/LoginPage.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";

const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("react-hot-toast", () => ({
	toast: {
		error: (...args) => toastError(...args),
		success: (...args) => toastSuccess(...args),
	},
	Toaster: () => null,
}));

const TEST_LOGIN_USER = {
	email: "test3@gmail.com",
	password: "123456",
};

const realLogIn = useAuthStore.getState().logIn;

function renderLoginPage() {
	return render(
		<MemoryRouter>
			<LoginPage />
		</MemoryRouter>
	);
}

describe("LoginPage unit behavior", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			authUser: null,
			isCheckingAuth: false,
			isLoggingIn: false,
			logIn: vi.fn(),
			connectSocket: vi.fn(),
			socket: null,
			onlineUsers: [],
		});
	});

	it("renders login form - Login form renders", () => {
		renderLoginPage();

		expect(screen.getByRole("heading", { name: "Welcome Back", level: 2 })).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
	});

	it("updates email input when typing - Typing updates input state", async () => {
		const user = userEvent.setup();
		renderLoginPage();

		const emailInput = screen.getByPlaceholderText("Enter your email");
		await user.type(emailInput, "user@example.com");

		expect(emailInput).toHaveValue("user@example.com");
	});

	it("calls login function on submit - Submit calls logIn from useAuthStore", async () => {
		const user = userEvent.setup();
		const mockLogIn = vi.fn();
		useAuthStore.setState({ logIn: mockLogIn });

		renderLoginPage();

		await user.type(screen.getByPlaceholderText("Enter your email"), "user@example.com");
		await user.type(screen.getByPlaceholderText("Enter your password"), "secret123");
		await user.click(screen.getByRole("button", { name: "Log In" }));

		expect(mockLogIn).toHaveBeenCalledTimes(1);
		expect(mockLogIn).toHaveBeenCalledWith({
			email: "user@example.com",
			password: "secret123",
		});
	});

	it("shows loader when logging in - Loading spinner appears when isLoggingIn = true", () => {
		useAuthStore.setState({ isLoggingIn: true });

		const { container } = renderLoginPage();
		const submitButton = screen.getByRole("button");

		expect(submitButton).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Log In" })).not.toBeInTheDocument();
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("shows error toast when login fails - Error message appears when login fails", async () => {
		const user = userEvent.setup();
		const mockLogIn = vi.fn().mockImplementation(async () => {
			toastError("Invalid credentials");
		});
		useAuthStore.setState({ logIn: mockLogIn });

		renderLoginPage();

		await user.type(screen.getByPlaceholderText("Enter your email"), "bad@example.com");
		await user.type(screen.getByPlaceholderText("Enter your password"), "wrongpass");
		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Invalid credentials");
		});
	});
});

describe("LoginPage real backend login", () => {
	beforeAll(async () => {
		await axios.get("http://localhost:3000/api/auth/test", {
			withCredentials: true,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({
			authUser: null,
			isCheckingAuth: false,
			isLoggingIn: false,
			logIn: realLogIn,
			connectSocket: vi.fn(),
			socket: null,
			onlineUsers: [],
		});
	});

	it("logs in successfully with Test User 3", async () => {
		const user = userEvent.setup();
		renderLoginPage();

		await user.type(screen.getByPlaceholderText("Enter your email"), TEST_LOGIN_USER.email);
		await user.type(screen.getByPlaceholderText("Enter your password"), TEST_LOGIN_USER.password);
		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith("Logged in successfully!");
		});

		await waitFor(() => {
			expect(useAuthStore.getState().authUser?.email).toBe(TEST_LOGIN_USER.email);
		});
	});

	it("shows required fields message from backend", async () => {
		const user = userEvent.setup();
		renderLoginPage();

		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Email and password are required");
		});
	});

	it("shows invalid credentials for wrong password", async () => {
		const user = userEvent.setup();
		renderLoginPage();

		await user.type(screen.getByPlaceholderText("Enter your email"), TEST_LOGIN_USER.email);
		await user.type(screen.getByPlaceholderText("Enter your password"), "wrong123");
		await user.click(screen.getByRole("button", { name: "Log In" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Invalid credentials");
		});
	});
});
