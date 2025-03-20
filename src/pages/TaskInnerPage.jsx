import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import "./TaskInnerPage.css";

const Comment = ({ comment, handleReplyClick, replyingTo, setReplyText, handleAddReply, replyText }) => {
    return (
        <div className="comment">
            <div className="comment-header">
                <img src={comment.author_avatar} alt={comment.author_nickname} className="avatar" />
                <strong className="nickname">{comment.author_nickname}</strong>
            </div>
            <p className="comment-text">{comment.text}</p>

            {comment.parent_id === null && (
                <button className="reply-btn" onClick={() => handleReplyClick(comment.id)}>
                    უპასუხე
                </button>
            )}

            {replyingTo === comment.id && (
                <div className="reply-input">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <button onClick={() => handleAddReply(comment.id)}>უპასუხე</button>
                </div>
            )}

            {comment.sub_comments && comment.sub_comments.length > 0 && (
                <div className="sub-comments">
                    {comment.sub_comments.map(subComment => (
                        <div key={subComment.id} className="comment sub-comment">
                            <div className="comment-header">
                                <img src={subComment.author_avatar} alt={subComment.author_nickname} className="avatar" />
                                <strong className="nickname">{subComment.author_nickname}</strong>
                            </div>
                            <p className="comment-text">{subComment.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TaskInnerPage = () => {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [statuses, setStatuses] = useState([]);

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        async function fetchTaskDetails() {
            try {
                const taskData = await API.fetchTaskById(taskId);
                const commentsData = await API.fetchComments(taskId);
                const statusesData = await API.fetchStatuses();

                setTask(taskData);
                setComments(commentsData);
                setStatuses(statusesData);
            } catch (error) {
                console.error("Error fetching task:", error);
            }
        }
        fetchTaskDetails();
    }, [taskId]);

    const handleStatusChange = async (event) => {
        const newStatusId = Number(event.target.value);
        if (!task) return;

        try {
            await API.updateTaskStatus(taskId, newStatusId);
            setTask({ ...task, status: statuses.find(s => s.id === newStatusId) });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const addedComment = await API.addComment(taskId, newComment);
            setComments([...comments, addedComment]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleReplyClick = (commentId) => {
        setReplyingTo(commentId);
        setReplyText("");
    };

    const handleAddReply = async (parentId) => {
        if (!replyText.trim()) return;
    
        try {
            const addedReply = await API.addComment(taskId, replyText, parentId);
    
            setComments(comments.map(comment => {
                if (comment.id === parentId) {
                    return {
                        ...comment,
                        sub_comments: [...(comment.sub_comments || []), addedReply]
                    };
                }
                return comment;
            }));
    
            setReplyingTo(null);
            setReplyText("");
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const formatDate = (dateString) => {
        const days = ["კვი", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
        const date = new Date(dateString);
        
        const dayOfWeek = days[date.getDay()];
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
    
        return `${dayOfWeek} - ${day}/${month}/${year}`;
    };

    if (!task) return <p className="LOADING">იტვირთება...</p>;

    return (
        <div className="task-inner">
            <div className="task-inner-details">
                <div className="task-innder-header">
                    <span className={`task-priority priority${task.priority.id}`}>
                        {task.priority.name}
                    </span>
                    <span className="task-department">{task.department.name.split(" ")[0]}</span>
                </div>
                <h1>{task.name}</h1>
                <p className="task-inner-desc">{task.description}</p>
                <div className="task-inner-dets">
                    <h2>დავალების დეტალები</h2>
                    <div className="innerDetsStatus">
                        <p>სტატუსი</p>
                        <select value={task.status.id} onChange={handleStatusChange}>
                            {statuses.map(status => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="innerDetsEmpl">
                        <p className="inerdetP">თანამშრომელი</p>
                        <div className="innerEmpl">
                            <img alt={task.employee.name} src={task.employee.avatar}/>
                            <div className="innerinnerEmpl">
                                <span>{task.department.name}</span>
                                <p>{task.employee.name} {task.employee.surname}</p>
                            </div>
                        </div>
                    </div>
                    <div className="innerDetsDate">
                        <p className="forInnDDIcon">დავალებების ვადა</p>
                        <p className="dateDate">{formatDate(task.due_date)}</p>
                    </div>
                </div>
            </div>
            <div className="comments-section">
                <div className="add-comment">
                    <textarea
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="დაწერე კომენტარი"
                    >
                    </textarea>
                    <button onClick={handleAddComment}>დააკომენტარე</button>
                </div>
                <div className="CommentsTitle">
                    <h3>კომენტარები</h3>
                    <p>{comments.length}</p>
                </div>
                
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            handleReplyClick={handleReplyClick}
                            replyingTo={replyingTo}
                            setReplyText={setReplyText}
                            handleAddReply={handleAddReply}
                            replyText={replyText}
                        />
                    ))
                ) : (
                    <p>ჯერ კომენტარი არ დაწერილა.</p>
                )}

                
            </div>
        </div>
    );
};

export default TaskInnerPage;
