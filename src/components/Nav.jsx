import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import './Nav.css';
import AddEmployeeModal from "./AddEmployeeModal";
import API from "../api/api";

const Nav = () => {
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [allEmployees, setAllEmployees] = useState([]);

    const handleEmployeeAdded = async () => {
        try {
            const updatedEmployees = await API.fetchEmployees(); // Fetch updated employees
            setAllEmployees(updatedEmployees);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    return (
        <nav>
            <a href="/" className="logo"></a>
            <ul>
                <li><button onClick={() => setIsEmployeeModalOpen(true)}>თანამშრომლის დამატება</button></li>
                <li><Link to="/addtask">+ შექმენი ახალი დავალება</Link></li>
            </ul>
            <AddEmployeeModal onEmployeeAdded={handleEmployeeAdded} isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />
        </nav>
        
    );
};

export default Nav;
