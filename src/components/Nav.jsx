import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import './Nav.css';
import AddEmployeeModal from "./AddEmployeeModal";

const Nav = () => {
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    return (
        <nav>
            <a href="/" className="logo"></a>
            <ul>
                <li><button onClick={() => setIsEmployeeModalOpen(true)}>თანამშრომლის დამატება</button></li>
                <li><Link to="/addtask">+ შექმენი ახალი დავალება</Link></li>
            </ul>
            <AddEmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />
        </nav>
        
    );
};

export default Nav;
