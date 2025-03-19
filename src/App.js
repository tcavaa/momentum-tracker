import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Addedtasks from './pages/AddedTasks';
import TaskInnerPage from './pages/TaskInnerPage';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Addedtasks />} />
        <Route path="/tasks/:taskId" element={<TaskInnerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
