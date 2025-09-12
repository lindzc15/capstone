import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import About from "./pages/About";
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/signUp" element={<SignUp/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
