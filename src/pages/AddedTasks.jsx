import React, { useEffect, useState } from "react";
import API from "../api/api";
import Filters from "../components/Filters";
import './AddedTasks.css';

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

    const formatDate = (dateString) => {
        const months = [
            "იანვ", "თებ", "მარ", "აპრ", "მაი", "ივნ",
            "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"
        ];
    
        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
    
        return `${day} ${month}, ${year}`;
    };

    

    return (
        <div className="Content">
            <h1 className="AddedTasksTitle">დავალებების გვერდი</h1>

            <Filters onFilterChange={handleFilterChange} />

            <div className="task-columns">
                {statuses.map(status => (
                    <div key={status.id} className="task-column">
                        <h2 className={`StatusTitles StatusTitles${status.id}`}>{status.name}</h2>
                        {filteredTasks
                            .filter(task => task.status.id === status.id)
                            .map(task => (
                                <div key={task.id} className={`task-card StatusBorder${status.id}`}>
                                    <div className="task-header">
                                        <span className={`task-priority priority${task.priority.id}`}>
                                            {task.priority.name}
                                        </span>
                                        <span className="task-department">{task.department.name.split(" ")[0]}</span>
                                        <span className="task-date">{formatDate(task.due_date)}</span>
                                    </div>
                                    <div className="task-content">
                                        <h3>{task.name}</h3>
                                        <p>{task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description}</p>
                                    </div>
                                    <div className="task-footer">
                                        <img src={task.employee.avatar}/>
                                        <span>{task.total_comments}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddedTasks;
