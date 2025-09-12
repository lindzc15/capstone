import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import About from "./pages/About";
import NotFound from "./pages/NotFound"

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
