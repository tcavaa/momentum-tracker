import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Addedtasks from './pages/AddedTasks';
import TaskInnerPage from './pages/TaskInnerPage';
import NewTask from './pages/NewTask';
import Nav from './components/Nav';
import './App.css';

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Addedtasks />} />
        <Route path="/tasks/:taskId" element={<TaskInnerPage />} />
        <Route path="/addtask/" element={<NewTask />} />
      </Routes>
    </Router>
  );
}

export default App;
