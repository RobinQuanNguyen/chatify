import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import axios from "axios";
import userEvent from "@testing-library/user-event";
import App from "../../App.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useChatStore } from "../../store/useChatStore.js";

const TEST_LOGIN_USER = {
    email: "test3@gmail.com",
    password: "123456",
};

function clearAllCookies() {
    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0]?.trim();
        if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
    });
}

async function logoutAfterTest() {
    await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true }).catch(() => {});
}

describe("General login page before go to chat page", () => {
    beforeEach(() => {
        clearAllCookies();
        localStorage.clear();

        useAuthStore.setState({
            authUser: null,
            isCheckingAuth: true,
            isSigningUp: false,
            isLoggingIn: false,
            isUpdatingProfile: false,
            socket: null,
            onlineUsers: [],
        });

        useChatStore.setState({
            allContact: [],
            chats: [],
            messages: [],
            activeTab: "chats",
            selectedUser: null,
            isUserLoading: false,
            isMessageLoading: false,
            isSoundEnabled: false,
            highlightChatId: null,
        });
    });

    afterEach(async () => {
        await logoutAfterTest();
    });

    it("Open the app when user is not logged in", async () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    });

    it("Show chat page when user is logged in", async () => {
        await axios.post("http://localhost:3000/api/auth/login", TEST_LOGIN_USER, {
            withCredentials: true,
        });

        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(await screen.findByText(/select a conversation/i)).toBeInTheDocument();
        expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
    });
});



