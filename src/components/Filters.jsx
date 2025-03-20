import React, { useEffect, useState } from "react";
import API from "../api/api";
import './Filters.css';

const Filters = ({ onFilterChange }) => {
    const [departments, setDepartments] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState(() => {
        const savedFilters = localStorage.getItem("taskFilters");
        return savedFilters ? JSON.parse(savedFilters).selectedDepartments || [] : [];
    });
    
    const [selectedPriorities, setSelectedPriorities] = useState(() => {
        const savedFilters = localStorage.getItem("taskFilters");
        return savedFilters ? JSON.parse(savedFilters).selectedPriorities || [] : [];
    });
    
    const [selectedEmployee, setSelectedEmployee] = useState(() => {
        const savedFilters = localStorage.getItem("taskFilters");
        return savedFilters ? JSON.parse(savedFilters).selectedEmployee || "" : "";
    });

    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);

    useEffect(() => {
        const savedFilters = localStorage.getItem("taskFilters");
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
            setSelectedDepartments(parsedFilters.selectedDepartments || []);
            setSelectedPriorities(parsedFilters.selectedPriorities || []);
            setSelectedEmployee(parsedFilters.selectedEmployee || "");
        }
    }, []);

    const toggleDropdown = (dropdown) => {
        setIsDeptOpen(dropdown === "dept" ? !isDeptOpen : false);
        setIsPriorityOpen(dropdown === "priority" ? !isPriorityOpen : false);
        setIsEmployeeOpen(dropdown === "employee" ? !isEmployeeOpen : false);
    };

    const closeAllDropdowns = () => {
        setIsDeptOpen(false);
        setIsPriorityOpen(false);
        setIsEmployeeOpen(false);
    };


    useEffect(() => {
        async function fetchData() {
            try {
                const departmentsData = await API.fetchDepartments();
                const prioritiesData = await API.fetchPriorities();
                const employesData = await API.fetchEmployees();
                setDepartments(departmentsData);
                setPriorities(prioritiesData);
                setEmployees(employesData);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        }

        fetchData();
    }, []);

    const toggleDepartment = (id) => {
        setSelectedDepartments(prev =>
            prev.includes(id) ? prev.filter(dep => dep !== id) : [...prev, id]
        );
    };

    const togglePriority = (id) => {
        setSelectedPriorities(prev =>
            prev.includes(id) ? prev.filter(pri => pri !== id) : [...prev, id]
        );
    };

    const selectEmployee = (id) => {
        setSelectedEmployee(prev => (prev === id ? null : id));
    };

    const clearEmployee = () => {
        setSelectedEmployee("");
    };

    const clearAllFilters = () => {
        setSelectedDepartments([]);
        setSelectedPriorities([]);
        setSelectedEmployee("");
    
        localStorage.setItem("taskFilters", JSON.stringify({
            selectedDepartments: [],
            selectedPriorities: [],
            selectedEmployee: "",
        }));
    };

    useEffect(() => {
        const newFilters = { selectedDepartments, selectedPriorities, selectedEmployee };

        if (typeof onFilterChange === "function") {
            onFilterChange(newFilters);
        }

        localStorage.setItem("taskFilters", JSON.stringify(newFilters));
        // eslint-disable-next-line
    }, [selectedDepartments, selectedPriorities, selectedEmployee]);

    console.log(localStorage);

    return (
        <div>
        <div className="filters">
            <div>
                <label className="forIcons" onClick={() => toggleDropdown("dept")}>
                    დეპარტამენტი
                </label>
                {isDeptOpen && (
                    <div className="dropdown">
                    {departments.map(dept => (
                        <div className="filterInputs" key={dept.id}>
                            <label class="custom-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedDepartments.includes(dept.id)}
                                    onChange={() => toggleDepartment(dept.id)}
                                />
                                <span class="checkmark"></span>
                                <span>{dept.name}</span>
                            </label>
                            
                        </div>
                    ))}
                    <button className="filterChoose" onClick={closeAllDropdowns}>არჩევა</button>
                </div>
                )}
            </div>

            <div>
                <label className="forIcons" onClick={() => toggleDropdown("priority")}>
                    პრიორიტეტი
                </label>
                {isPriorityOpen && (
                    <div className="dropdown">
                        {priorities.map(priority => (
                            <div className="filterInputs" key={priority.id}>
                                <label class="custom-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedPriorities.includes(priority.id)}
                                        onChange={() => togglePriority(priority.id)}
                                    />
                                    <span class="checkmark"></span>
                                    <span>{priority.name}</span>
                                 </label>
                            </div>
                        ))}
                        <button className="filterChoose" onClick={closeAllDropdowns}>არჩევა</button>
                    </div>
                )}
            </div>

            <div>
                <label className="forIcons" onClick={() => toggleDropdown("employee")}>
                    თანამშრომელი
                </label>
                {isEmployeeOpen && (
                    <div className="dropdown">
                        {employees.map(emp => (
                            <div cclassName={`filterInputsEmp ${selectedEmployee === emp.id ? 'filterInputsEmpSelected' : ''}`} key={emp.id}>
                                <div 
                                    key={emp.id} 
                                    className={`filterInputsEmp ${selectedEmployee === emp.id ? 'filterInputsEmpSelected' : ''}`}
                                    onClick={() => selectEmployee(emp.id)}
                                >
                                    <img src={emp.avatar} alt={emp.name} className="avatar" />
                                    <span>{emp.name} {emp.surname}</span>
                                </div>
                            </div>
                        ))}
                        <button className="filterChoose" onClick={closeAllDropdowns}>არჩევა</button>
                    </div>
                )}
            </div>

            
        </div>
        <div className="selected-filters">
        {selectedDepartments.map(deptId => {
            const dept = departments.find(d => d.id === deptId);
            return dept ? (
                <div key={dept.id} className="filter-tag">
                    <span>{dept.name}</span> <button onClick={() => toggleDepartment(dept.id)}>x</button>
                </div>
            ) : null;
        })}

        {selectedPriorities.map(priId => {
            const priority = priorities.find(p => p.id === priId);
            return priority ? (
                <div key={priority.id} className="filter-tag">
                    <span>{priority.name}</span> <button onClick={() => togglePriority(priority.id)}>x</button>
                </div>
            ) : null;
        })}

        {selectedEmployee && (
            <div className="filter-tag">
                <span>{employees.find(emp => emp.id === selectedEmployee)?.name || "Selected Employee"}</span>
                <button onClick={clearEmployee}>x</button>
            </div>
        )}

        {(selectedDepartments.length > 0 || selectedPriorities.length > 0 || selectedEmployee) && (
            <button className="clear-filters" onClick={clearAllFilters}>
                გასუფთავება
            </button>
        )}
    </div>
    </div>
    );
};

export default Filters;
