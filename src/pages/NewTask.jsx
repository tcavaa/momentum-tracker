import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import AddEmployeeModal from "../components/AddEmployeeModal";
import './NewTask.css';

const NewTask = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState(localStorage.getItem("taskTitle") || "");
    const [description, setDescription] = useState(localStorage.getItem("taskDescription") || "");
    const [priority, setPriority] = useState(localStorage.getItem("taskPriority") || "Medium");
    const [status, setStatus] = useState(localStorage.getItem("taskStatus") || "1");
    const [department, setDepartment] = useState(localStorage.getItem("taskDepartment") || "");
    const [responsible, setResponsible] = useState(localStorage.getItem("taskResponsible") || "");
    const [deadline, setDeadline] = useState(localStorage.getItem("taskDeadline") || getTomorrowDate());
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

    const [selectedPriority, setSelectedPriority] = useState({id: 2, name: "საშუალო", icon: "https://momentum.redberryinternship.ge/storage/priority-icons/Medium.svg"});
    const [isOpen, setIsOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const [priorityData, statusData, departmentData, employeeData] = await Promise.all([
                    API.fetchPriorities(),
                    API.fetchStatuses(),
                    API.fetchDepartments(),
                    API.fetchEmployees()
                ]);
                setPriorities(priorityData);
                setStatuses(statusData);
                setDepartments(departmentData);
                setAllEmployees(employeeData);

                const storedPriority = localStorage.getItem("taskPriority");
            if (storedPriority) {
                setSelectedPriority(JSON.parse(storedPriority));
                setPriority(JSON.parse(storedPriority).id);
            }
            const storedResponsible = localStorage.getItem("taskResponsible");
            if (storedResponsible) {
                setResponsible(storedResponsible);
            }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (department) {
            const filtered = allEmployees.filter(emp => emp.department.id === Number(department));
            setFilteredEmployees(filtered);
            setResponsible("");
        } else {
            setFilteredEmployees([]);
        }
    }, [department, allEmployees]);

    const handleEmployeeAdded = async () => {
        try {
            const updatedEmployees = await API.fetchEmployees();
            setAllEmployees(updatedEmployees);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    const handleSelect = (priority) => {
        setSelectedPriority(priority);
        setIsOpen(false);
        setPriority(priority.id); // Update priority state as well
        localStorage.setItem("taskPriority", JSON.stringify(priority));
      };

      

    const handleChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "title":
                setTitle(value);
                localStorage.setItem("taskTitle", value);
                break;
            case "description":
                setDescription(value);
                localStorage.setItem("taskDescription", value);
                break;
            case "priority":
                setPriority(value);
                localStorage.setItem("taskPriority", value);
                break;
            case "status":
                setStatus(value);
                localStorage.setItem("taskStatus", value);
                break;
            case "department":
                setDepartment(value);
                localStorage.setItem("taskDepartment", value);
                break;
            case "responsible":
                setResponsible(value);
                localStorage.setItem("taskResponsible", value);
                break;
            case "deadline":
                setDeadline(value);
                localStorage.setItem("taskDeadline", value);
                break;
            default:
                break;
        }

        handleValidation(name, value);
    };

    const handleValidation = (field, value) => {
        let newErrors = { ...errors };

        if (field === "title") {
            if (!value.trim()) newErrors.title = "სათაური სავალდებულოა";
            else if (value.length < 3) newErrors.title = "მინიმუმ 3 სიმბოლო";
            else if (value.length > 255) newErrors.title = "მაქსიმუმ 255 სიმბოლო";
            else delete newErrors.title;
        }

        if (field === "description") {
            const words = value.trim().split(/\s+/);
            if (value && words.length < 4) newErrors.description = "მინიმუმ 4 სიტყვა";
            else if (value.length > 255) newErrors.description = "მაქსიმუმ 255 სიმბოლო";
            else delete newErrors.description;
        }

        if (field === "deadline") {
            const today = new Date().toISOString().split("T")[0];
            if (!value) newErrors.deadline = "თარიღი სავალდებულოა";
            else if (value < today) newErrors.deadline = "წარსული თარიღი დაუშვებელია";
            else delete newErrors.deadline;
        }

        if (["priority", "status", "department", "responsible"].includes(field)) {
            if (!value) newErrors[field] = "სავალდებულო ველი";
            else delete newErrors[field];
        }

        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!title || title.length < 3 || title.length > 255) return;
        if (description && (description.split(" ").length < 4 || description.length > 255)) return;
        if (!priority || !status || !department || !responsible || !deadline) return;
    
        const taskData = {
            name: title,
            description: description || null,
            due_date: deadline,
            status_id: Number(status),
            employee_id: Number(responsible),
            priority_id: Number(selectedPriority.id),
        };
    
        try {
            await API.createTask(taskData);
            localStorage.removeItem("taskTitle");
            localStorage.removeItem("taskDescription");
            localStorage.removeItem("taskPriority");
            localStorage.removeItem("taskStatus");
            localStorage.removeItem("taskDepartment");
            localStorage.removeItem("taskResponsible");
            localStorage.removeItem("taskDeadline");
            navigate("/");
        } catch (error) {
            console.error("Task creation failed:", error);
        }
    };
    console.log(errors);
    return (
        <div>
            <AddEmployeeModal onEmployeeAdded={handleEmployeeAdded} isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />
            <div className="task-form">
                <h1>შექმენი ახალი დავალება</h1>
                <form onSubmit={handleSubmit}>
                <div>
                    <div className="titlesContainer">
                        <label>სათაური*</label>
                        <input type="text" name="title" value={title} onChange={handleChange} />
                        <p className={
                            !title ? "error" : errors.title ? "error errorRed" : "error errorGreen"
                        }>
                            ✓მინიმუმ 2 სიმბოლო<br/>
                            ✓მაქსიმუმ 255 სიმბოლო
                        </p>
                    </div>
                    <div className="descContainer">
                        <label>აღწერა*</label>
                        <textarea name="description" value={description} onChange={handleChange} />
                        <p className={
                            !description ? "error" : errors.description ? "error errorRed" : "error errorGreen"
                        }>
                            ✓მინიმუმ 2 სიმბოლო<br/>
                            ✓მაქსიმუმ 255 სიმბოლო
                        </p>
                    </div>
                    <div className="selectsContainer">
                        <div className="dropdown-container">
                            <label>პრიორიტეტი*</label>
                            <div className="dropdown" onClick={() => setIsOpen(!isOpen)}>
                                <span className="selected-priority">
                                {selectedPriority ? (
                                    <>
                                        <img src={selectedPriority.icon} alt="priority icon" />
                                        {selectedPriority.name}
                                    </>
                                    ) : "აირჩიე პრიორიტეტი"}
                                </span>
                                <span className="arrow">▼</span>
                            </div>

                            {isOpen && (
                                <div className="dropdown-menu">
                                {priorities.map((pri) => (
                                    <label key={pri.id} className="dropdown-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedPriority?.id === pri.id}
                                        onChange={() => handleSelect(pri)}
                                        hidden
                                        value={pri.id}
                                    />
                                    <img alt="" src={pri.icon}/> {pri.name}
                                    </label>
                                ))}
                                </div>
                            )}
                        </div>
                        <div className="AddTaskStatus">
                            <label>სტატუსი*</label>
                            <select name="status" value={status} onChange={handleChange}>
                                {statuses.map((stat) => (
                                    <option key={stat.id} value={stat.id}>{stat.name}</option>
                                ))}
                            </select>
                            {errors.status && <span className="error">{errors.status}</span>}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="AddTaskDeparment">
                        <label>დეპარტამენტი*</label>
                        <select className={errors.department ? "errorBorderRed" : ""} name="department" value={department} onChange={handleChange}>
                            <option value="">აირჩიეთ დეპარტამენტი</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        {errors.department && <span className="error">{errors.department}</span>}
                    </div>
                    <div className="AddTaskEmployee">
                        <label className={`${!department ? "disabledLabel" : ""}`}>პასუხისმგებელი თანამშრომელი:</label>
                        <div className={`dropdown-container ${!department ? "disabled" : ""}`} onClick={() => department && setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}>
                            <span className="dropdown-selected">
                            {responsible ? (
                                <span>
                                    <img 
                                        src={filteredEmployees.find(emp => emp.id === Number(responsible))?.avatar} 
                                        alt="Employee Avatar" 
                                        style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "8px" }} 
                                    />
                                    {filteredEmployees.find(emp => emp.id === Number(responsible))?.name}{" "}
                                    {filteredEmployees.find(emp => emp.id === Number(responsible))?.surname}
                                </span>
                            ) : "აირჩიეთ თანამშრომელი"}
                            </span>
                            <span className="arrow">▼</span>
                        </div>

                        {isEmployeeDropdownOpen && department && (
                            <div className="dropdown-menu">
                                <label className="dropdown-item">
                                    <button className="AddEmpInSelect" onClick={() => setIsEmployeeModalOpen(true)}>თანამშრომლის დამატება</button>
                                </label>
                                {filteredEmployees.map((emp) => (
                                    <label key={emp.id} className="dropdown-item">
                                        <input
                                            type="radio"
                                            name="responsible"
                                            value={emp.id}
                                            checked={responsible === Number(emp.id)}
                                            onChange={handleChange}
                                            hidden
                                        />
                                        <img 
                                        src={emp.avatar} 
                                        alt="Employee Avatar" 
                                        style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "8px" }} 
                                    />
                                        <p className="insideSelectNames">{emp.name} {emp.surname}</p>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="AddTaskDateDue">
                        <label>დედლაინი:</label>
                        <input className={errors.deadline ? "errorBorderRed" : ""} type="date" name="deadline" value={deadline} onChange={handleChange} min={getTomorrowDate()} />
                    </div>
                    <button type="submit" className="AddTaskSubmitBtn" disabled={!isValid}>დავალების შექმნა</button>
                </div>
                    
                </form>
            </div>
        </div>
        
    );
};

export default NewTask;
