import { vi, expect, test } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import MapPage from "../pages/Map";
import MyFolders from "../pages/MyFolders";
import Profile from "../pages/Profile";
import RestaurantDetails from "../pages/RestaurantDetails";
import FolderContents from "../pages/FolderContents";
import { AuthContext } from "../context/AuthContext";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// --- GOOGLE MAPS & LIBRARY MOCKS ---

// Data we want to see in the details panel
const mockPlaceDetails = {
  displayName: "Test Restaurant",
  formattedAddress: "123 Main St, Test City",
  photos: [{ getURI: () => "photo-url.jpg" }],
  // Matches PRICE keys in MapPage: FREE, INEXPENSIVE, MODERATE, EXPENSIVE, VERY_EXPENSIVE
  priceLevel: "MODERATE",
  rating: 4,
};

// Mock Autocomplete instance that PlaceAutocomplete will use
const mockAutocompleteInstance = {
  addListener: vi.fn((eventName, callback) => {
    if (eventName === "place_changed") {
      mockAutocompleteInstance._placeChangedCallback = callback;
    }
  }),
  getPlace: vi.fn(() => ({
    place_id: "test-place-id",
  })),
};

// Mock vis.gl Google Maps bindings used in MapPage and in this test file
vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }) => <div>{children}</div>,
  Map: ({ children }) => <div>{children}</div>,
  MapControl: ({ children }) => <div>{children}</div>,
  ControlPosition: { TOP_LEFT: "TOP_LEFT" },
  useMap: () => null,
  useMapsLibrary: (name) =>
    name === "places"
      ? {
          Autocomplete: function () {
            return mockAutocompleteInstance;
          },
        }
      : null,
}));

// Mock global google.maps.importLibrary used by getPlaceDetails in MapPage
globalThis.google = {
  maps: {
    importLibrary: vi.fn(async (name) => {
      if (name === "places") {
        return {
          Place: class {
            constructor({ id }) {
              this.id = id;
            }
            async fetchFields() {
              this.displayName = mockPlaceDetails.displayName;
              this.formattedAddress = mockPlaceDetails.formattedAddress;
              this.photos = mockPlaceDetails.photos;
              this.priceLevel = mockPlaceDetails.priceLevel;
              this.rating = mockPlaceDetails.rating;
            }
          },
        };
      }
      return {};
    }),
  },
};

// --- MOCKED AUTH HELPERS ---

//mocks login and register functions
const mockLogin = vi.fn(() => Promise.resolve(true));
const mockRegister = vi.fn(() => Promise.resolve(true));
const mockVerify = vi.fn(() => Promise.resolve(true));

//renders the pages with the auth context necessary, overriding login/register with mock functions
const renderWithNotLoggedInAuth = (
  ui,
  contextValue = { isLoggedIn: false, login: mockLogin, register: mockRegister}
) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
};

//renders the pages with the auth context necessary, overriding login/register with mock functions
const renderWithLoggedInAuth = (ui, contextValue = { isLoggedIn: true, verify_token: mockVerify, isAuthChecked: true}) => {
  // APIProvider is mocked above
  const { APIProvider } = require("@vis.gl/react-google-maps");
  return render(
    <APIProvider apiKey={`${apiKey}`} libraries={["places", "maps"]}>
      <AuthContext.Provider value={contextValue}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </APIProvider>
  );
};


// Mock localStorage manually
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key) => {
      if (key === "token") return JSON.stringify("mock-jwt-token");
      return null;
    },
    setItem: (key, value) => {},
    removeItem: (key) => {},
    clear: () => {},
  },
  writable: true,
});

// Mock fetch manually, including user_notes for RestaurantDetails
global.fetch = vi.fn((url, options) => {
  if (url.includes("/get/notes")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          user_notes: {
            user_rating: 4,
            date_visited: "2024-01-01",
            favorite_dish: "Pasta",
            notes: "Great food!",
          },
        }),
    });
  }

  // Generic success for other endpoints (e.g. add/notes, folders, etc.)
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  });
});


// --- LOGIN TESTS ---
test("renders login form", () => {
  renderWithNotLoggedInAuth(<Login />);
  expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
});

test("login button is clickable", () => {
  renderWithNotLoggedInAuth(<Login />);

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
  renderWithNotLoggedInAuth(<SignUp />);

  expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
});

test("sign up button is clickable", () => {
  renderWithNotLoggedInAuth(<SignUp />);

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

// --- MAP TESTS ---
test("renders map page", () => {
  renderWithLoggedInAuth(<MapPage />);
  const mapContainer = screen.getByTestId("map-container");
  expect(mapContainer).toBeInTheDocument();
});

test("renders restaurant info in details panel", async () => {
  renderWithLoggedInAuth(<MapPage />);

  // The PlaceAutocomplete renders a bare <input />, so just grab the textbox
  const autocompleteInput = await screen.findByRole("textbox");

  // Simulate user typing (not strictly required for our mock, but mirrors real use)
  fireEvent.change(autocompleteInput, {
    target: { value: mockPlaceDetails.displayName },
  });

  // Simulate the Google Places "place_changed" event that PlaceAutocomplete listens for
  expect(typeof mockAutocompleteInstance._placeChangedCallback).toBe("function");
  mockAutocompleteInstance._placeChangedCallback();

  // Now the component should have called getPlaceDetails and updated state
  const detailsContainer = await screen.findByTestId("map-details-container");
  expect(detailsContainer).toBeInTheDocument();


  expect(screen.getByText(mockPlaceDetails.displayName)).toBeInTheDocument();
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("$$ | ⭐️⭐️⭐️⭐️")).toBeInTheDocument();
});


// --- FOLDERS TESTS ---
test("add folder buttons working", () => {
  renderWithLoggedInAuth(<MyFolders />);

  const button = screen.getByRole("button", { name: /add folder/i });
  fireEvent.click(button);

  //check that dialog box pops up when add folder clicked
  expect(screen.getByRole("dialog")).toBeInTheDocument();


  const folderNameInput = screen.getByLabelText(/^folder name$/i);
  const addButtonModal = screen.getByTestId("modal-add-folder");

  fireEvent.change(folderNameInput, { target: { value: "Test Folder" } });
  fireEvent.click(addButtonModal);
});

test("renders folder contents with mocked location state", async () => {
  const mockState = { folder_id: 123, folder_name: "Test Folder" };

  render(
    <AuthContext.Provider
      value={{ isLoggedIn: true, authChecked: true, verify_token: mockVerify }}
    >
      <MemoryRouter
        initialEntries={[{ pathname: "/folders/123", state: mockState }]}
      >
        <Routes>
          <Route path="/folders/:id" element={<FolderContents />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // FolderContents reads folder_name from location.state and uses it as the header
  expect(await screen.findByText(/Test Folder/i)).toBeInTheDocument();
  const button = screen.getByRole("button", { name: /back/i });
  fireEvent.click(button);
});

test("renders restaurant details with mocked restaurant data", async () => {
  const mockState = {
    folder_id: 123,
    folder_name: "Test Folder",
    restaurant_id: "test-place-id", // matches what our Place mock uses
  };

  render(
    <AuthContext.Provider
      value={{ isLoggedIn: true, authChecked: true, verify_token: mockVerify }}
    >
      <MemoryRouter
        initialEntries={[{ pathname: "/folders/123", state: mockState }]}
      >
        <Routes>
          <Route path="/folders/:id" element={<RestaurantDetails />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

  // Wait for loading spinner to disappear and details to load
  // This ensures getPlaceFullDetails() has run and set state
  expect(
    await screen.findByText(/Restaurant Details/i)
  ).toBeInTheDocument();

  // Name from mockPlaceDetails.displayName
  expect(
    await screen.findByText(mockPlaceDetails.displayName)
  ).toBeInTheDocument();

  // Image alt text (uses `${locName} photo`)
  expect(
    screen.getByAltText(/Test Restaurant photo/i)
  ).toBeInTheDocument();

  // Address is split into two lines in RestaurantDetails
  expect(screen.getByText("123 Main St")).toBeInTheDocument();
  expect(screen.getByText("Test City")).toBeInTheDocument();

  // Price + rating line: "$$ | ⭐️⭐️⭐️⭐️"
  expect(screen.getByText("$$ | ⭐️⭐️⭐️⭐️")).toBeInTheDocument();

  // We’re intentionally not mocking hours/website, so "Hours:" header is present,
  // but no specific day strings are required (they’ll be empty).
  expect(screen.getByText("Hours:")).toBeInTheDocument();
});



// --- PROFILE TESTS ---
test("renders profile page", () => {
  renderWithLoggedInAuth(<Profile />);

  expect(screen.getByText("My Profile")).toBeInTheDocument();
  expect(screen.getByText("Name:")).toBeInTheDocument();
  expect(screen.getByText("Username:")).toBeInTheDocument();
  expect(screen.getByText("Email:")).toBeInTheDocument();
});