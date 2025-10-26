"use client";
import {useEffect, useState} from "react";

export default function HistoryPage() {
    const [records, setRecords] = useState({
        feedings: [],
        diapers: [],
        sleep: [],
        belt: [],
    });

    const [filter, setFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [editRecord, setEditRecord] = useState(null);
    const [editType, setEditType] = useState("");
    const [showModal, setShowModal] = useState(false);

    // ✅ fetch all
    useEffect(() => {
        const endpoints = ["feedings", "diapers", "sleep", "belt"];
        endpoints.forEach((type) => {
            fetch(`/api/${type}`)
                .then((res) => res.json())
                .then((data) =>
                    setRecords((r) => ({...r, [type]: data}))
                );
        });
    }, []);

    const refreshType = async (type) => {
        const res = await fetch(`/api/${type}`);
        const data = await res.json();
        setRecords((r) => ({...r, [type]: data}));
    };

    const handleDelete = async (type, id) => {
        if (!confirm("Delete this record?")) return;
        await fetch(`/api/${type}/${id}`, {method: "DELETE"});
        refreshType(type);
    };

    const handleEditClick = (type, record) => {
        setEditType(type);
        setEditRecord({...record});
        setShowModal(true);
    };

    const handleEditChange = (key, value) => {
        setEditRecord((prev) => ({...prev, [key]: value}));
    };

    const handleSave = async () => {
        if (!editRecord || !editType) return;
        const id = editRecord.id;
        const body = {...editRecord};
        delete body.id;

        // ✅ Fix for feedings: mutually exclusive fields
        if (editType === "feedings") {
            if (body.type === "breast") {
                body.amount = null;
            } else {
                body.side = null;
            }
        }

        await fetch(`/api/${editType}/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });

        setShowModal(false);
        refreshType(editType);
    };

    const tables = [
        {
            key: "feedings",
            title: "Feedings",
            columns: ["Type", "Amount / Side", "Start", "End"],
            map: (f) => ({
                id: f.id,
                Type: f.type.charAt(0).toUpperCase() + f.type.slice(1),
                "Amount / Side": f.side
                    ? f.side.charAt(0).toUpperCase() + f.side.slice(1)
                    : f.amount
                        ? `${f.amount} oz`
                        : "-",
                Start: new Date(f.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                End: f.endTime
                    ? new Date(f.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-",
            }),
        },
        {
            key: "diapers",
            title: "Diapers",
            columns: ["Type", "Time"],
            map: (d) => ({
                id: d.id,
                Type: d.type.charAt(0).toUpperCase() + d.type.slice(1),
                Time: new Date(d.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }),
        },
        {
            key: "sleep",
            title: "Sleep",
            columns: ["Start", "End"],
            map: (s) => ({
                id: s.id,
                Start: new Date(s.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                End: s.endTime
                    ? new Date(s.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-",
            }),
        },
        {
            key: "belt",
            title: "Belt",
            columns: ["Start", "End"],
            map: (b) => ({
                id: b.id,
                Start: new Date(b.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                End: b.endTime
                    ? new Date(b.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-",
            }),
        },
    ];

    return (
        <main className="container">
            <div className="row">
                {tables.map((t) => (
                    <div className="col-md-6" key={t.key}>
                        <div className="card mb-4">
                            <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                                {t.title}
                            </div>
                            <div className="card-body">
                                <table className="table table-striped table-hover">
                                    <thead>
                                    <tr>
                                        {t.columns.map((c, i) => (
                                            <th key={i}>{c}</th>
                                        ))}
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {records[t.key].map((row) => {
                                        const mapped = t.map(row);
                                        return (
                                            <tr key={row.id}>
                                                {t.columns.map((col, j) => (
                                                    <td key={j}>{mapped[col]}</td>
                                                ))}
                                                <td>
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                            type="button"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            Edit
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => handleEditClick(t.key, row)}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-danger"
                                                                    onClick={() =>
                                                                        handleDelete(t.key, row.id)
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && editRecord && (
                <>
                    <div
                        className="modal fade show"
                        style={{display: "block"}}
                        tabIndex="-1"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit {editType}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {editType === "feedings" && (
                                        <>
                                            <label className="form-label fw-bold">Type</label>
                                            <select
                                                className="form-select mb-2"
                                                value={editRecord.type || ""}
                                                onChange={(e) => handleEditChange("type", e.target.value)}
                                            >
                                                <option value="breast">Breast</option>
                                                <option value="pumped">Pumped</option>
                                                <option value="formula">Formula</option>
                                            </select>

                                            {editRecord.type === "breast" ? (
                                                <>
                                                    <label className="form-label fw-bold">Side</label>
                                                    <select
                                                        className="form-select mb-2"
                                                        value={editRecord.side || ""}
                                                        onChange={(e) => handleEditChange("side", e.target.value)}
                                                    >
                                                        <option value="">Select side</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </>
                                            ) : (
                                                <>
                                                    <label className="form-label fw-bold">Amount (oz)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control mb-2"
                                                        value={editRecord.amount || ""}
                                                        onChange={(e) => handleEditChange("amount", e.target.value)}
                                                        placeholder="Enter amount in oz"
                                                    />
                                                </>
                                            )}

                                            <label className="form-label fw-bold">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control mb-2"
                                                value={
                                                    editRecord.startTime
                                                        ? new Date(editRecord.startTime).toISOString().slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) => handleEditChange("startTime", e.target.value)}
                                            />

                                            <label className="form-label fw-bold">End Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control mb-2"
                                                value={
                                                    editRecord.endTime
                                                        ? new Date(editRecord.endTime).toISOString().slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) => handleEditChange("endTime", e.target.value)}
                                            />
                                        </>
                                    )}

                                    {editType === "diapers" && (
                                        <>
                                            <label className="form-label fw-bold">Type</label>
                                            <select
                                                className="form-select mb-2"
                                                value={editRecord.type || ""}
                                                onChange={(e) => handleEditChange("type", e.target.value)}
                                            >
                                                <option value="wet">Wet</option>
                                                <option value="dirty">Dirty</option>
                                                <option value="mixed">Mixed</option>
                                            </select>

                                            <label className="form-label fw-bold">Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control mb-2"
                                                value={
                                                    editRecord.time
                                                        ? new Date(editRecord.time).toISOString().slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) => handleEditChange("time", e.target.value)}
                                            />
                                        </>
                                    )}

                                    {["sleep", "belt"].includes(editType) && (
                                        <>
                                            <label className="form-label fw-bold">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control mb-2"
                                                value={
                                                    editRecord.startTime
                                                        ? new Date(editRecord.startTime).toISOString().slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) => handleEditChange("startTime", e.target.value)}
                                            />

                                            <label className="form-label fw-bold">End Time</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control mb-2"
                                                value={
                                                    editRecord.endTime
                                                        ? new Date(editRecord.endTime).toISOString().slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) => handleEditChange("endTime", e.target.value)}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary" onClick={handleSave}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop fade show"
                        onClick={() => setShowModal(false)}
                    ></div>
                </>
            )}
        </main>
    );
}