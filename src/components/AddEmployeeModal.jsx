import { useState, useEffect } from "react";
import API from "../api/api";

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [department, setDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch departments
    useEffect(() => {
        API.fetchDepartments().then(setDepartments);
    }, []);

    // Validate Name & Last Name (Real-time)
    const validateText = (text) => /^[ა-ჰa-zA-Z]{2,255}$/.test(text);

    // Validate Avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 600 * 1024) {
                setErrors((prev) => ({ ...prev, avatar: "ფაილი ძალიან დიდია (Max 600KB)" }));
                return;
            }
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({ ...prev, avatar: "ფაილი უნდა იყოს სურათი" }));
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
            setErrors((prev) => ({ ...prev, avatar: "" }));
        }
    };

    // Remove Avatar
    const removeAvatar = () => {
        setAvatar(null);
        setAvatarPreview(null);
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateText(name)) {
            setErrors((prev) => ({ ...prev, name: "სახელი უნდა იყოს მინ. 2 სიმბოლო და მხოლოდ ლათინური/ქართული" }));
            return;
        }
        if (!validateText(lastName)) {
            setErrors((prev) => ({ ...prev, lastName: "გვარი უნდა იყოს მინ. 2 სიმბოლო და მხოლოდ ლათინური/ქართული" }));
            return;
        }
        if (!avatar) {
            setErrors((prev) => ({ ...prev, avatar: "გთხოვთ ატვირთოთ სურათი" }));
            return;
        }
        if (!department) {
            setErrors((prev) => ({ ...prev, department: "გთხოვთ აირჩიოთ დეპარტამენტი" }));
            return;
        }

        setIsSubmitting(true);

        try {
            await API.addEmployee({ name, last_name: lastName, avatar, department_id: department });
            onEmployeeAdded();
            onClose(); // Close modal on success
        } catch (error) {
            console.error("Failed to add employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form on close
    useEffect(() => {
        if (!isOpen) {
            setName("");
            setLastName("");
            setAvatar(null);
            setAvatarPreview(null);
            setDepartment("");
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>დამატება</h2>
                <form onSubmit={handleSubmit}>
                    <label>სახელი</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="error">{errors.name}</p>}

                    <label>გვარი</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    {errors.lastName && <p className="error">{errors.lastName}</p>}

                    <label>ავატარი</label>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    {avatarPreview && (
                        <div>
                            <img src={avatarPreview} alt="Preview" width="100" />
                            <button type="button" onClick={removeAvatar}>წაშლა</button>
                        </div>
                    )}
                    {errors.avatar && <p className="error">{errors.avatar}</p>}

                    <label>დეპარტამენტი</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="">აირჩიეთ</option>
                        {departments.map((dep) => (
                            <option key={dep.id} value={dep.id}>{dep.name}</option>
                        ))}
                    </select>
                    {errors.department && <p className="error">{errors.department}</p>}

                    <button type="submit" disabled={isSubmitting}>დამატება</button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
