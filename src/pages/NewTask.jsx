import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import AddEmployeeModal from "../components/AddEmployeeModal";

const NewTask = () => {
    const navigate = useNavigate();

    // State for form fields
    const [title, setTitle] = useState(localStorage.getItem("taskTitle") || "");
    const [description, setDescription] = useState(localStorage.getItem("taskDescription") || "");
    const [priority, setPriority] = useState(localStorage.getItem("taskPriority") || "Medium");
    const [status, setStatus] = useState(localStorage.getItem("taskStatus") || "Starting");
    const [department, setDepartment] = useState(localStorage.getItem("taskDepartment") || "");
    const [responsible, setResponsible] = useState(localStorage.getItem("taskResponsible") || "");
    const [deadline, setDeadline] = useState(localStorage.getItem("taskDeadline") || getTomorrowDate());

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    // State for dropdown data
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // State for validation errors
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    // Get tomorrow's date as default
    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    // Fetch dropdown data on mount
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
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    // Fetch employees when department changes
    useEffect(() => {
        if (department) { // Ensure department is not null or undefined
            const filtered = allEmployees.filter(emp => emp.department.id === Number(department));
            setFilteredEmployees(filtered);
            setResponsible(""); // Reset responsible when department changes
        } else {
            setFilteredEmployees([]);
        }
    }, [department, allEmployees]);

    const handleEmployeeAdded = async () => {
        try {
            const updatedEmployees = await API.fetchEmployees(); // Fetch updated employees
            setAllEmployees(updatedEmployees);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        }
    };

    // Handle form field changes & store in localStorage
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

    // Validation function
    const handleValidation = (field, value) => {
        let newErrors = { ...errors };

        // Title validation
        if (field === "title") {
            if (!value.trim()) newErrors.title = "სათაური სავალდებულოა";
            else if (value.length < 3) newErrors.title = "მინიმუმ 3 სიმბოლო";
            else if (value.length > 255) newErrors.title = "მაქსიმუმ 255 სიმბოლო";
            else delete newErrors.title;
        }

        // Description validation (optional)
        if (field === "description") {
            const words = value.trim().split(/\s+/);
            if (value && words.length < 4) newErrors.description = "მინიმუმ 4 სიტყვა";
            else if (value.length > 255) newErrors.description = "მაქსიმუმ 255 სიმბოლო";
            else delete newErrors.description;
        }

        // Deadline validation
        if (field === "deadline") {
            const today = new Date().toISOString().split("T")[0];
            if (!value) newErrors.deadline = "თარიღი სავალდებულოა";
            else if (value < today) newErrors.deadline = "წარსული თარიღი დაუშვებელია";
            else delete newErrors.deadline;
        }

        // Required fields
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
            priority_id: Number(priority),
        };
    
        try {
            await API.createTask(taskData);
            localStorage.removeItem("taskForm"); // Clear saved form data after success
            navigate("/"); // Redirect after submission
        } catch (error) {
            console.error("Task creation failed:", error);
        }
    };

    return (
       
        <div className="task-form">
            <h1>ახალი დავალება</h1>
            <form onSubmit={handleSubmit}>
            

            <label>სათაური:</label>
            <input type="text" name="title" value={title} onChange={handleChange} />
            {errors.title && <span className="error">{errors.title}</span>}

            <label>აღწერა:</label>
            <textarea name="description" value={description} onChange={handleChange} />
            {errors.description && <span className="error">{errors.description}</span>}

            <label>პრიორიტეტი:</label>
            <select name="priority" value={priority} onChange={handleChange}>
                {priorities.map((pri) => (
                    <option key={pri.id} value={pri.id}>{pri.name}</option>
                ))}
            </select>
            {errors.priority && <span className="error">{errors.priority}</span>}

            <label>სტატუსი:</label>
            <select name="status" value={status} onChange={handleChange}>
                {statuses.map((stat) => (
                    <option key={stat.id} value={stat.id}>{stat.name}</option>
                ))}
            </select>
            {errors.status && <span className="error">{errors.status}</span>}

            <label>დეპარტამენტი:</label>
            <select name="department" value={department} onChange={handleChange}>
                <option value="">აირჩიეთ დეპარტამენტი</option>
                {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>
            {errors.department && <span className="error">{errors.department}</span>}

            {department && (
                <>
                    <label>პასუხისმგებელი თანამშრომელი:</label>
                    <select name="responsible" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
                        <option value="">აირჩიეთ თანამშრომელი</option>
                        {filteredEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name} {emp.lastName}
                            </option>
                        ))}
                    </select>
                </>
            )}

            <label>ვადა:</label>
            <input type="date" name="deadline" value={deadline} onChange={handleChange} min={getTomorrowDate()} />
            {errors.deadline && <span className="error">{errors.deadline}</span>}

            <button type="submit" disabled={!isValid}>შექმნა</button>
            </form>
            <button onClick={() => setIsEmployeeModalOpen(true)}>თანამშრომლის დამატება</button>
            <AddEmployeeModal onEmployeeAdded={handleEmployeeAdded} isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} />
        </div>
        
        
    );
};

export default NewTask;
