import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import About from "./pages/About";
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import { AuthContext } from "./context/AuthContext";
import AuthRoute from './AuthRoute';

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signUp" element={<SignUp/>}/>

          {/* Protected Routes */}
          <Route element ={<AuthRoute />}>
            <Route path="/profile" element={<Profile/>}/>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
