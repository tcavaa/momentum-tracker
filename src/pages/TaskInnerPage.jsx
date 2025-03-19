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

            {/* Reply Button (only for top-level comments) */}
            {comment.parent_id === null && (
                <button className="reply-btn" onClick={() => handleReplyClick(comment.id)}>
                    Reply
                </button>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
                <div className="reply-input">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                    />
                    <button onClick={() => handleAddReply(comment.id)}>Reply</button>
                </div>
            )}

            {/* Render Sub-Comments (Replies) */}
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

    // Replying State
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
            setTask({ ...task, status: statuses.find(s => s.id === newStatusId) }); // Update UI
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
            // Send reply to API
            const addedReply = await API.addComment(taskId, replyText, parentId);
    
            // Update comments state correctly
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

    if (!task) return <p>Loading...</p>;

    return (
        <div className="task-inner">
            <h1>{task.name}</h1>
            <p>{task.description}</p>
            <p><strong>Priority:</strong> {task.priority.name}</p>
             {/* Status Dropdown */}
             <p><strong>Status:</strong></p>
            <select value={task.status.id} onChange={handleStatusChange}>
                {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                ))}
            </select>

            <p><strong>Department:</strong> {task.department.name}</p>
            <p><strong>Assigned To:</strong> {task.employee.name} {task.employee.lastName}</p>
            <p><strong>Due Date:</strong> {task.dueDate}</p>

            {/* Comments Section */}
            <div className="comments-section">
                <h3>Comments</h3>
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
                    <p>No comments yet.</p>
                )}

                {/* Add Comment */}
                <div className="add-comment">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                    />
                    <button onClick={handleAddComment}>Post</button>
                </div>
            </div>
        </div>
    );
};

export default TaskInnerPage;
