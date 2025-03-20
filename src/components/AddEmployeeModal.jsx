import { useState, useEffect } from "react";
import { useRef } from "react";
import './AddEmployeeModal.css';
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

    useEffect(() => {
        API.fetchDepartments().then(setDepartments);
    }, []);

    const validateText = (text) => /^[ა-ჰa-zA-Z]{2,255}$/.test(text);

    const handleNameChange = (e) => {
        const value = e.target.value.trim();
        setName(value);
    
        if (!value) {
            setErrors((prev) => ({ ...prev, name: "სახელი აუცილებელია" }));
            return;
        }
        if (value.length < 2) {
            setErrors((prev) => ({ ...prev, name: "სახელი უნდა იყოს მინ. 2 სიმბოლო" }));
            return;
        }
        if (value.length > 255) {
            setErrors((prev) => ({ ...prev, name: "სახელი არ უნდა აღემატებოდეს 255 სიმბოლოს" }));
            return;
        }
        if (!/^[ა-ჰa-zA-Z]+$/.test(value)) {
            setErrors((prev) => ({ ...prev, name: "სახელი უნდა შეიცავდეს მხოლოდ ქართულ და ლათინურ ასოებს" }));
            return;
        }
    
        setErrors((prev) => ({ ...prev, name: "" }));
    };
    
    const handleLastNameChange = (e) => {
        const value = e.target.value.trim();
        setLastName(value);
    
        if (!value) {
            setErrors((prev) => ({ ...prev, lastName: "სახელი აუცილებელია" }));
            return;
        }
        if (value.length < 2) {
            setErrors((prev) => ({ ...prev, lastName: "სახელი უნდა იყოს მინ. 2 სიმბოლო" }));
            return;
        }
        if (value.length > 255) {
            setErrors((prev) => ({ ...prev, lastName: "სახელი არ უნდა აღემატებოდეს 255 სიმბოლოს" }));
            return;
        }
        if (!/^[ა-ჰa-zA-Z]+$/.test(value)) {
            setErrors((prev) => ({ ...prev, lastName: "სახელი უნდა შეიცავდეს მხოლოდ ქართულ და ლათინურ ასოებს" }));
            return;
        }
        
        setErrors((prev) => ({ ...prev, lastName: "" }));
    };

    const handleDepartmentChange = (e) => {
        const value = e.target.value;
        setDepartment(value);
        setErrors((prev) => ({
            ...prev,
            department: value ? "" : "გთხოვთ აირჩიოთ დეპარტამენტი",
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
    
        if (!file) return;
    
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
    };

    const fileInputRef = useRef(null);

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    const removeAvatar = (e) => {
        e.stopPropagation();
        setAvatar(null);
        setAvatarPreview(null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const newErrors = {
            name: validateText(name) ? "" : "სახელი უნდა იყოს მინ. 2 სიმბოლო და მხოლოდ ლათინური/ქართული",
            lastName: validateText(lastName) ? "" : "გვარი უნდა იყოს მინ. 2 სიმბოლო და მხოლოდ ლათინური/ქართული",
            avatar: avatar ? "" : "გთხოვთ ატვირთოთ სურათი",
            department: department ? "" : "გთხოვთ აირჩიოთ დეპარტამენტი",
        };
    
        if (Object.values(newErrors).some((error) => error)) {
            setErrors(newErrors);
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            await API.addEmployee({ name, last_name: lastName, avatar, department_id: department });
            onEmployeeAdded();
            onClose(); 
        } catch (error) {
            console.error("Failed to add employee:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <button className="close-btn" onClick={onClose}></button>
                <div className="clear"> </div>
                <h2 className="modal-title">თანამშრომლის დამატება</h2>
                <form onSubmit={handleSubmit}>
                    <div className="namesContCont">
                        <div className="namesContainer">
                            <label>სახელი*</label>
                            <input type="text" value={name} onChange={handleNameChange} className={errors.name ? "errorBorderRed" : ""} />
                            <p className={
                                !name ? "error" : errors.name ? "error errorRed" : "error errorGreen"
                            }>
                                ✓მინიმუმ 2 სიმბოლო<br/>
                                ✓მაქსიმუმ 255 სიმბოლო
                            </p>
                        </div>
                        <div className="namesContainer">
                            <label>გვარი*</label>
                            <input type="text" value={lastName} onChange={handleLastNameChange} className={errors.lastName ? "errorBorderRed" : ""} />
                            <p className={
                                !lastName ? "error" : errors.lastName ? "error errorRed" : "error errorGreen"
                            }>
                                ✓მინიმუმ 2 სიმბოლო<br/>
                                ✓მაქსიმუმ 255 სიმბოლო
                            </p>
                        </div>
                    </div>
                    <div className="avatarContainer">
                        <label className="avatarLabel">
                            ავატარი*
                        </label>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} name="avatar" ref={fileInputRef} hidden />
                        <div className="avatarBox" onClick={openFileDialog}>
                            {avatarPreview ? (
                                <div className="">
                                    <img src={avatarPreview} alt="Preview" className="avatarImage" />
                                    <button type="button" className="deleteAvatar" onClick={removeAvatar}>
                                        
                                    </button>
                                </div>
                            ) : (
                                <p className="uploadText">დააჭირეთ სურათის ასარჩევად</p>
                            )}
                        </div>
                        <p className={
                                !errors.avatar ? "error" : errors.avatar ? "error errorRed" : "error errorGreen"
                            }>
                                ✓მაქსიმუმ 600kb ზომაში
                            </p>
                    </div>
                    <div className="departmentsContainer">
                    <label>დეპარტამენტი*</label>
                        <select value={department} onChange={handleDepartmentChange} className={errors.department ? "errorBorderRed" : ""}>
                            <option value="">აირჩიეთ</option>
                            {departments.map((dep) => (
                                <option key={dep.id} value={dep.id}>{dep.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modalButtons">
                        <button className="cancel" type="button" onClick={onClose}>გაუქმება</button>
                        <button className="submit" type="submit" disabled={isSubmitting}>დაამატე თანამშრომელი</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
