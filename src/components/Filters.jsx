import React, { useEffect, useState } from "react";
import API from "../api/api";

const Filters = ({ onFilterChange }) => {
    const [departments, setDepartments] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");

    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);

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

    // Remove the selected employee
    const clearEmployee = () => {
        setSelectedEmployee("");
    };

    const clearAllFilters = () => {
        setSelectedDepartments([]);
        setSelectedPriorities([]);
        setSelectedEmployee("");
    };

    useEffect(() => {
        if (typeof onFilterChange === "function") {
            onFilterChange({
                selectedDepartments,
                selectedPriorities,
                selectedEmployee
            });
        } else {
            console.warn("onFilterChange is not a function");
        }
    }, [selectedDepartments, selectedPriorities, selectedEmployee]);

    return (
        <div className="filters">
            <div>
                <label onClick={() => setIsDeptOpen(!isDeptOpen)}>
                    დეპარტამენტი:
                </label>
                {isDeptOpen && (
                    <div className="dropdown">
                    {departments.map(dept => (
                        <div key={dept.id}>
                            <input
                                type="checkbox"
                                checked={selectedDepartments.includes(dept.id)}
                                onChange={() => toggleDepartment(dept.id)}
                            />
                            <span>{dept.name}</span>
                        </div>
                    ))}
                </div>
                )}
            </div>

            <div>
                <label onClick={() => setIsPriorityOpen(!isPriorityOpen)}>
                    პრიორიტეტი:
                </label>
                {isPriorityOpen && (
                    <div className="dropdown">
                        {priorities.map(priority => (
                            <div key={priority.id}>
                                <input
                                    type="checkbox"
                                    checked={selectedPriorities.includes(priority.id)}
                                    onChange={() => togglePriority(priority.id)}
                                />
                                <span>{priority.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label onClick={() => setIsEmployeeOpen(!isEmployeeOpen)}>
                    თანამშრომელი:
                </label>
                {isEmployeeOpen && (
                    <div className="dropdown">
                        {employees.map(emp => (
                            <div key={emp.id}>
                                <input
                                    type="radio"
                                    name="employee"
                                    checked={selectedEmployee === emp.id}
                                    onChange={() => selectEmployee(emp.id)}
                                />
                                <span>{emp.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="selected-filters">
                {selectedDepartments.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return dept ? (
                        <span key={dept.id} className="filter-tag">
                            {dept.name} <button onClick={() => toggleDepartment(dept.id)}>✖</button>
                        </span>
                    ) : null;
                })}

                {selectedPriorities.map(priId => {
                    const priority = priorities.find(p => p.id === priId);
                    return priority ? (
                        <span key={priority.id} className="filter-tag">
                            {priority.name} <button onClick={() => togglePriority(priority.id)}>✖</button>
                        </span>
                    ) : null;
                })}

                {selectedEmployee && (
                    <span className="filter-tag">
                        {employees.find(emp => emp.id === selectedEmployee)?.name || "Selected Employee"}
                        <button onClick={clearEmployee}>✖</button>
                    </span>
                )}
            </div>

            {(selectedDepartments.length > 0 || selectedPriorities.length > 0 || selectedEmployee) && (
                <button className="clear-filters" onClick={clearAllFilters}>
                    გასუფთავება
                </button>
            )}
        </div>
    );
};

export default Filters;
