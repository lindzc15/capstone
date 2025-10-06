import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import { AuthContext } from "../context/AuthContext"; 
import { vi } from "vitest";

//mocks login and register functions
const mockLogin = vi.fn(() => Promise.resolve(true));
const mockRegister = vi.fn(() => Promise.resolve(true));

//renders the pages with the auth context necessary, overriding login/register with mock functions
const renderWithAuth = (ui, contextValue = { isLoggedIn: false, login: mockLogin, register: mockRegister }) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

// --- LOGIN TESTS ---
test("renders login form", () => {
  renderWithAuth(<Login />);
  expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});


test("login button is clickable", () => {
  renderWithAuth(<Login />);
  
  const usernameInput = screen.getByLabelText(/^username$/i);
  const passwordInput = screen.getByLabelText(/^password$/i);
  const button = screen.getByRole("button", { name: /log in/i });

  fireEvent.change(usernameInput, { target: { value: "test_user" } });
  fireEvent.change(passwordInput, { target: { value: "test123" } });
  fireEvent.click(button);

  expect(button).toBeEnabled();
  expect(mockLogin).toHaveBeenCalledTimes(1);
});




// --- SIGN UP TESTS ---
test("renders sign up form", () => {
  renderWithAuth(<SignUp />);

  expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
});


test("sign up button is clickable", () => {
  renderWithAuth(<SignUp />);
  
  const usernameInput = screen.getByLabelText(/^username$/i);
  const nameInput = screen.getByLabelText(/^name$/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const passwordInput = screen.getByLabelText(/^password$/i);
  const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);

  const button = screen.getByRole("button", { name: /sign up/i });

  fireEvent.change(usernameInput, { target: { value: "test_user2" } });
  fireEvent.change(nameInput, { target: { value: "Test User" } });
  fireEvent.change(emailInput, { target: { value: "testing@testing.com" } });
  fireEvent.change(passwordInput, { target: { value: "test123" } });
  fireEvent.change(confirmPasswordInput, { target: { value: "test123" } });

  fireEvent.click(button);

  expect(button).toBeEnabled();
  expect(mockRegister).toHaveBeenCalledTimes(1); 
});
