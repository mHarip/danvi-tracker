"use client";
import {useEffect, useState} from "react";

function HistoryTable({title, data, columns, filter, setFilter, currentPage, setCurrentPage, itemsPerPage, onDelete}) {
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    function extractDate(row) {
        let ts = null;
        if (row.Start) {
            if (row._date) return row._date;
        }
        if (row.Time) {
            if (row._date) return row._date;
        }

        if (row._date) return row._date;
        return "Unknown Date";
    }

    const grouped = {};
    paginatedData.forEach(row => {
        const date = extractDate(row);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(row);
    });
    const groupDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    function handleDeleteClick(id) {
        setDeleteId(id);
        setShowModal(true);
    }

    function confirmDelete() {
        if (deleteId !== null) {
            onDelete(deleteId);
            setShowModal(false);
            setDeleteId(null);
        }
    }

    useEffect(() => {
        if (showModal) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [showModal]);

    return (
        <div className="card mb-4">
            <div className="card-header fw-bold">{title}</div>
            <div className="card-body">
                <div className="d-flex justify-content-start mb-3">
                    {["1D", "1W", "1M", "3M", "YTD", "ALL"].map(opt => (
                        <button
                            key={opt}
                            className={`btn btn-sm me-2 ${filter === opt ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => {
                                setFilter(opt);
                                setCurrentPage(1);
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        {columns.map((c, i) => (
                            <th key={i}>{c}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.length > 0 ? (
                        groupDates.map(date => (
                            [
                                <tr key={date + "_header"}>
                                    <td colSpan={columns.length + 1} className="table-secondary fw-bold">
                                        {new Date(date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                </tr>,
                                ...grouped[date].map((row, i) => (
                                    <tr key={date + "_" + i}>
                                        {columns.map((col, j) => (
                                            <td key={j}>{row[col]}</td>
                                        ))}
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(row.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ]
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 1} className="text-center text-muted">
                                No records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                <nav>
                    <ul className="pagination mt-2">
                        {[...Array(Math.ceil(data.length / itemsPerPage)).keys()].map(n => (
                            <li key={n + 1} className={`page-item ${n + 1 === currentPage ? "active" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(n + 1)}
                                >
                                    {n + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                {showModal && (
                    <>
                        <div
                            className={`modal fade show`}
                            tabIndex="-1"
                            role="dialog"
                            aria-modal="true"
                            style={{ display: "block" }}
                            onKeyDown={e => {
                                if (e.key === "Escape") setShowModal(false);
                            }}
                        >
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirm Delete</h5>
                                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Are you sure you want to delete this record?</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="modal-backdrop fade show"
                            onClick={() => setShowModal(false)}
                            style={{ cursor: "pointer" }}
                        ></div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function HistoryPage() {
    const [feedings, setFeedings] = useState([]);
    const [diapers, setDiapers] = useState([]);
    const [sleep, setSleep] = useState([]);
    const [belt, setBelt] = useState([]);

    const [feedingsFilter, setFeedingsFilter] = useState("ALL");
    const [feedingsPage, setFeedingsPage] = useState(1);

    const [sleepFilter, setSleepFilter] = useState("ALL");
    const [sleepPage, setSleepPage] = useState(1);

    const [diapersFilter, setDiapersFilter] = useState("ALL");
    const [diapersPage, setDiapersPage] = useState(1);

    const [beltFilter, setBeltFilter] = useState("ALL");
    const [beltPage, setBeltPage] = useState(1);

    const itemsPerPage = 10;

    function filterByDate(data, filter, key = "startTime") {
        const now = new Date();
        return data.filter(item => {
            const d = new Date(item[key]);
            switch (filter) {
                case "1D":
                    return d.toDateString() === now.toDateString();
                case "1W":
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    return d >= weekAgo;
                case "1M":
                    const monthAgo = new Date();
                    monthAgo.setMonth(now.getMonth() - 1);
                    return d >= monthAgo;
                case "3M":
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(now.getMonth() - 3);
                    return d >= threeMonthsAgo;
                case "YTD":
                    return d.getFullYear() === now.getFullYear();
                case "ALL":
                    return true;
                default:
                    return true;
            }
        });
    }

    useEffect(() => {
        fetch("/api/feedings").then((res) =>
            res.json().then((data) => setFeedings(data))
        );
        fetch("/api/diapers").then((res) =>
            res.json().then((data) => setDiapers(data))
        );
        fetch("/api/sleep").then((res) =>
            res.json().then((data) => setSleep(data))
        );
        fetch("/api/belt").then((res) =>
            res.json().then((data) => setBelt(data))
        );
    }, []);

    const handleDeleteFeeding = (id) => {
        fetch(`/api/feedings/${id}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    setFeedings(feedings.filter(f => f.id !== id));
                }
            });
    };

    const handleDeleteSleep = (id) => {
        fetch(`/api/sleep/${id}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    setSleep(sleep.filter(s => s.id !== id));
                }
            });
    };

    const handleDeleteDiaper = (id) => {
        fetch(`/api/diapers/${id}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    setDiapers(diapers.filter(d => d.id !== id));
                }
            });
    };

    const handleDeleteBelt = (id) => {
        fetch(`/api/belt/${id}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    setBelt(belt.filter(b => b.id !== id));
                }
            });
    };

    return (
        <>
            <main className="container">
                <div className="row">
                    <div className="col-md-6">
                        <HistoryTable
                            title="Feedings"
                            filter={feedingsFilter}
                            setFilter={setFeedingsFilter}
                            currentPage={feedingsPage}
                            setCurrentPage={setFeedingsPage}
                            itemsPerPage={itemsPerPage}
                            data={filterByDate(feedings, feedingsFilter).map((f) => ({
                                id: f.id,
                                Type: f.type.charAt(0).toUpperCase() + f.type.slice(1),
                                Amount: f.amount,
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
                                _date: new Date(f.startTime).toISOString().slice(0, 10),
                            }))}
                            columns={["Type", "Amount", "Start", "End"]}
                            onDelete={handleDeleteFeeding}
                        />
                        <HistoryTable
                            title="Sleep"
                            filter={sleepFilter}
                            setFilter={setSleepFilter}
                            currentPage={sleepPage}
                            setCurrentPage={setSleepPage}
                            itemsPerPage={itemsPerPage}
                            data={filterByDate(sleep, sleepFilter).map((s) => ({
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
                                _date: new Date(s.startTime).toISOString().slice(0, 10),
                            }))}
                            columns={["Start", "End"]}
                            onDelete={handleDeleteSleep}
                        />
                    </div>
                    <div className="col-md-6">
                        <HistoryTable
                            title="Diapers"
                            filter={diapersFilter}
                            setFilter={setDiapersFilter}
                            currentPage={diapersPage}
                            setCurrentPage={setDiapersPage}
                            itemsPerPage={itemsPerPage}
                            data={filterByDate(diapers, diapersFilter, "time").map((d) => ({
                                id: d.id,
                                Type: d.type.charAt(0).toUpperCase() + d.type.slice(1),
                                Time: new Date(d.time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }),
                                _date: new Date(d.time).toISOString().slice(0, 10),
                            }))}
                            columns={["Type", "Time"]}
                            onDelete={handleDeleteDiaper}
                        />
                        <HistoryTable
                            title="Belt"
                            filter={beltFilter}
                            setFilter={setBeltFilter}
                            currentPage={beltPage}
                            setCurrentPage={setBeltPage}
                            itemsPerPage={itemsPerPage}
                            data={filterByDate(belt, beltFilter).map((b) => ({
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
                                _date: new Date(b.startTime).toISOString().slice(0, 10),
                            }))}
                            columns={["Start", "End"]}
                            onDelete={handleDeleteBelt}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}