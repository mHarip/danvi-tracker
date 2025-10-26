"use client";
import React, {useEffect, useState} from "react";

export default function EditModal({show, record, type, onClose, onSave}) {
    const [formData, setFormData] = useState({
        type: "",
        amount: "",
        side: "",
        startTime: "",
        endTime: "",
        time: "",
    });

    // ✅ Convert to local datetime
    const toLocalDatetime = (value) => {
        if (!value) return "";
        try {
            const d = new Date(value);
            const offset = d.getTimezoneOffset();
            const local = new Date(d.getTime() - offset * 60 * 1000);
            return local.toISOString().slice(0, 16);
        } catch {
            return "";
        }
    };

    // ✅ Initialize form when record changes
    useEffect(() => {
        if (record) {
            setFormData({
                type: record.type || "",
                amount: record.amount?.toString() || "",
                side: record.side || "",
                startTime: toLocalDatetime(record.startTime),
                endTime: toLocalDatetime(record.endTime),
                time: toLocalDatetime(record.time),
            });
        } else {
            setFormData({
                type: "",
                amount: "",
                side: "",
                startTime: "",
                endTime: "",
                time: "",
            });
        }
    }, [record]);

    // ✅ Close modal with ESC
    useEffect(() => {
        const handleEsc = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!show || !record) return null;

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderFields = () => {
        switch (type) {
            case "feedings":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Feeding Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select</option>
                                <option value="breast">Breast</option>
                                <option value="pumped">Pumped</option>
                                <option value="formula">Formula</option>
                            </select>
                        </div>

                        {formData.type === "breast" ? (
                            <div className="mb-3">
                                <label className="form-label">Side</label>
                                <select
                                    name="side"
                                    value={formData.side}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">Select</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        ) : (
                            <div className="mb-3">
                                <label className="form-label">Amount (oz)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="form-control"
                                    step="0.1"
                                />
                            </div>
                        )}

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </>
                );

            case "diapers":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select</option>
                                <option value="wet">Wet</option>
                                <option value="dirty">Dirty</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Time</label>
                            <input
                                type="datetime-local"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </>
                );

            case "sleep":
            case "belt":
                return (
                    <>
                        <div className="mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </>
                );

            default:
                return <p className="text-muted">No editable fields found.</p>;
        }
    };

    return (
        <div
            className="modal fade show"
            style={{display: "block", backgroundColor: "rgba(0,0,0,0.5)"}}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-header modal-header-bg text-white">
                        <h5 className="modal-title text-capitalize">
                            Edit {type?.replace(/s$/, "")}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">{renderFields()}</div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}