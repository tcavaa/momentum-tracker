import React from "react";

const TaskCard = ({ task }) => {
    return (
        <div className="bg-white p-3 shadow rounded-md mb-2">
            <h3 className="font-semibold">{task.name}</h3>
            <p className="text-sm text-gray-600">
                {task.description.length > 100
                    ? task.description.slice(0, 100) + "..."
                    : task.description}
            </p>
            <div className="flex items-center mt-2">
                <span className={`badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
                <span className="ml-auto text-sm">{task.due_date}</span>
            </div>
            <div className="flex items-center mt-2">
                <img
                    src={task.employee.avatar}
                    alt={task.employee.name}
                    className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 text-sm">{task.employee.name}</span>
            </div>
        </div>
    );
};

export default TaskCard;
