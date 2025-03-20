import React, { useEffect, useState } from "react";
import API from "../api/api";
import Filters from "../components/Filters";

const AddedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem("taskFilters");
        return savedFilters ? JSON.parse(savedFilters) : {
            selectedDepartments: [],
            selectedPriorities: [],
            selectedEmployee: "",
        };
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [tasksData, statusesData] = await Promise.all([
                    API.fetchTasks(),
                    API.fetchStatuses()
                ]);
                
                setTasks(tasksData);
                setFilteredTasks(tasksData);
                setStatuses(statusesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...tasks];

        if (filters.selectedDepartments.length) {
            filtered = filtered.filter(task => filters.selectedDepartments.includes(task.department.id));
        }

        if (filters.selectedPriorities.length) {
            filtered = filtered.filter(task => filters.selectedPriorities.includes(task.priority.id));
        }

        if (filters.selectedEmployee) {
            filtered = filtered.filter(task => task.employee.id === filters.selectedEmployee);
        }

        setFilteredTasks(filtered);
    }, [filters, tasks]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        localStorage.setItem("taskFilters", JSON.stringify(newFilters));
    };

    return (
        <div>
            <h1>დავალებების გვერდი</h1>

            <Filters onFilterChange={handleFilterChange} />

            <div className="task-columns">
                {statuses.map(status => (
                    <div key={status.id} className="task-column">
                        <h2>{status.name}</h2>
                        {filteredTasks
                            .filter(task => task.status.id === status.id)
                            .map(task => (
                                <div key={task.id} className="task-card">
                                    <h3>{task.name}</h3>
                                    <p>{task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description}</p>
                                    <span>Priority: {task.priority.name}</span>
                                    <span>Due: {task.dueDate}</span>
                                    <span>Department: {task.department.name}</span>
                                    <img src={task.employee.avatar} alt={`${task.employee.firstName} ${task.employee.lastName}`} />
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddedTasks;
