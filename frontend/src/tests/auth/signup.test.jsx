import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import SignUpPage from "../../pages/SignUpPage.jsx";
import App from "../../App.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";

vi.mock("../../pages/ChatPage.jsx", () => ({
	default: () => <div>Chat Page</div>,
}));

const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock("react-hot-toast", () => ({
	toast: {
		error: (...args) => toastError(...args),
		success: (...args) => toastSuccess(...args),
	},
	Toaster: () => null,
}));

const DUMMY_USER = {
	fullName: "Test User 1",
	email: "test1@gmail.com",
	password: "123456",
};

const realSignUp = useAuthStore.getState().signUp;
const realCheckAuth = useAuthStore.getState().checkAuth;

let UserModel;

function parseEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const text = fs.readFileSync(filePath, "utf8");
	const env = {};

	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) {
			continue;
		}

		const separatorIndex = line.indexOf("=");
		if (separatorIndex <= 0) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		let value = line.slice(separatorIndex + 1).trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		env[key] = value;
	}

	return env;
}

function renderSignUpPage() {
	return render(
		<MemoryRouter>
			<SignUpPage />
		</MemoryRouter>
	);
}

describe("SignUpPage unit behavior", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useAuthStore.setState({
			authUser: null,
			isCheckingAuth: false,
			isSigningUp: false,
			checkAuth: vi.fn(),
			signUp: vi.fn().mockResolvedValue(undefined),
			connectSocket: vi.fn(),
			socket: null,
			onlineUsers: [],
		});
	});

	it("renders signup form", () => {
		renderSignUpPage();

		expect(
			screen.getByRole("heading", { name: "Create Account", level: 2 })
		).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your full name")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
	});

	it("updates form inputs", async () => {
		const user = userEvent.setup();
		renderSignUpPage();

		const fullNameInput = screen.getByPlaceholderText("Enter your full name");
		const emailInput = screen.getByPlaceholderText("Enter your email");
		const passwordInput = screen.getByPlaceholderText("Enter your password");

		await user.type(fullNameInput, "Jane Doe");
		await user.type(emailInput, "jane@example.com");
		await user.type(passwordInput, "secret123");

		expect(fullNameInput).toHaveValue("Jane Doe");
		expect(emailInput).toHaveValue("jane@example.com");
		expect(passwordInput).toHaveValue("secret123");
	});

	it("calls signUp on submit", async () => {
		const user = userEvent.setup();
		renderSignUpPage();

		await user.type(screen.getByPlaceholderText("Enter your full name"), "Jane Doe");
		await user.type(screen.getByPlaceholderText("Enter your email"), "jane@example.com");
		await user.type(screen.getByPlaceholderText("Enter your password"), "secret123");
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(useAuthStore.getState().signUp).toHaveBeenCalledTimes(1);
		});

		expect(useAuthStore.getState().signUp).toHaveBeenCalledWith({
			fullName: "Jane Doe",
			email: "jane@example.com",
			password: "secret123",
		});
	});

	it("shows loading spinner during signup", () => {
		useAuthStore.setState({ isSigningUp: true });
		const { container } = renderSignUpPage();

		const submitButton = screen.getByRole("button");
		expect(submitButton).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Create Account" })).not.toBeInTheDocument();
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("redirects after successful signup", async () => {
		const user = userEvent.setup();
		useAuthStore.setState({
			signUp: vi.fn().mockImplementation(async () => {
				useAuthStore.setState({
					authUser: {
						_id: "u1",
						fullName: "Jane Doe",
						email: "jane@example.com",
					},
				});
			}),
		});

		render(
			<MemoryRouter initialEntries={["/signup"]}>
				<App />
			</MemoryRouter>
		);

		await user.type(screen.getByPlaceholderText("Enter your full name"), "Jane Doe");
		await user.type(screen.getByPlaceholderText("Enter your email"), "jane@example.com");
		await user.type(screen.getByPlaceholderText("Enter your password"), "secret123");
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(screen.getByText("Chat Page")).toBeInTheDocument();
		});
	});
});

describe("SignUpPage notifications with backend", () => {
	beforeAll(async () => {
		const backendEnvPath = path.resolve(process.cwd(), "../backend/.env");
		const envFromFile = parseEnvFile(backendEnvPath);

		process.env.NODE_ENV = "test";
		process.env.MONGO_URI_FOR_TEST =
			process.env.MONGO_URI_FOR_TEST || envFromFile.MONGO_URI_FOR_TEST;

		const { connectDB } = await import("../../../../backend/src/lib/db.js");
		const { default: User } = await import("../../../../backend/src/models/User.js");
		UserModel = User;

		await connectDB();
		await UserModel.deleteOne({ email: DUMMY_USER.email });

		await axios.post("http://localhost:3000/api/auth/signup", DUMMY_USER, {
			withCredentials: true,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();

		useAuthStore.setState({
			authUser: null,
			isCheckingAuth: false,
			isSigningUp: false,
			checkAuth: realCheckAuth,
			signUp: realSignUp,
			connectSocket: vi.fn(),
			socket: null,
			onlineUsers: [],
		});
	});

	afterAll(async () => {
		if (UserModel) {
			await UserModel.deleteOne({ email: DUMMY_USER.email });
			await UserModel.db.close();
		}
	});

	it("shows required fields notification", async () => {
		const user = userEvent.setup();
		renderSignUpPage();

		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Please provide all required fields");
		});
	});

	it("shows weak password notification", async () => {
		const user = userEvent.setup();
		renderSignUpPage();

		await user.type(screen.getByPlaceholderText("Enter your full name"), "Weak User");
		await user.type(screen.getByPlaceholderText("Enter your email"), "weakuser@gmail.com");
		await user.type(screen.getByPlaceholderText("Enter your password"), "123");
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Password must be at least 6 characters long");
		});
	});

	it("shows user already exists notification", async () => {
		const user = userEvent.setup();
		renderSignUpPage();

		await user.type(screen.getByPlaceholderText("Enter your full name"), DUMMY_USER.fullName);
		await user.type(screen.getByPlaceholderText("Enter your email"), DUMMY_USER.email);
		await user.type(screen.getByPlaceholderText("Enter your password"), DUMMY_USER.password);
		await user.click(screen.getByRole("button", { name: "Create Account" }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith("Email already exists");
		});
	});
});
