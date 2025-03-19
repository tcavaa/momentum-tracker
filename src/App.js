import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Addedtasks from './pages/AddedTasks';
//import TaskCreation from './pages/TaskCreation';
//import TaskDetails from './pages/TaskDetails';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Addedtasks />} />
        
      </Routes>
    </Router>
  );
}

export default App;
