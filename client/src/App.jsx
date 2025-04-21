import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Add a default route to redirect to login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
