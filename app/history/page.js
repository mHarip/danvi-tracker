"use client";
import {useState, useEffect} from "react";
import EditModal from "../../components/EditModal";
import React from "react";

export default function HistoryPage() {
    const [feedings, setFeedings] = useState([]);
    const [diapers, setDiapers] = useState([]);
    const [sleep, setSleep] = useState([]);
    const [belt, setBelt] = useState([]);

    const [filters, setFilters] = useState({
        feedings: "1W",
        diapers: "1W",
        sleep: "1W",
        belt: "1W",
    });

    // Pagination state
    const [page, setPage] = useState({
        feedings: 1,
        diapers: 1,
        sleep: 1,
        belt: 1,
    });
    const itemsPerPage = 5;

    const [showEdit, setShowEdit] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    const fetchAll = async () => {
        const [f1, f2, f3, f4] = await Promise.allSettled([
            fetch("/api/feedings"),
            fetch("/api/diapers"),
            fetch("/api/sleep"),
            fetch("/api/belt"),
        ]);
        const getJson = async (r) => (r.status === "fulfilled" ? await r.value.json() : []);
        setFeedings(await getJson(f1));
        setDiapers(await getJson(f2));
        setSleep(await getJson(f3));
        setBelt(await getJson(f4));
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // 🔍 Filter records by timeframe
    const filterByDate = (data, filterValue, key = "startTime") => {
        const now = new Date();
        return data.filter((item) => {
            const d = new Date(item[key]);
            const compareDate = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            switch (filterValue) {
                case "1D":
                    return d.toDateString() === now.toDateString();
                case "1W":
                    return d >= compareDate(7);
                case "1M":
                    return d >= new Date(now.setMonth(now.getMonth() - 1));
                case "3M":
                    return d >= new Date(now.setMonth(now.getMonth() - 3));
                default:
                    return true;
            }
        });
    };

    const filtered = {
        feedings: filterByDate(feedings, filters.feedings),
        diapers: filterByDate(diapers, filters.diapers, "time"),
        sleep: filterByDate(sleep, filters.sleep),
        belt: filterByDate(belt, filters.belt),
    };

    // Group by date
    const groupedByDate = (data, key = "startTime") =>
        data.reduce((acc, item) => {
            const date = new Date(item[key] || item.createdAt).toDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(item);
            return acc;
        }, {});

    // Calculations
    const getDailyTotalOz = (records) =>
        records
            .filter((r) => ["pumped", "formula"].includes(r.type?.toLowerCase()) && r.amount)
            .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)
            .toFixed(1);

    const getDailyTotalDiapers = (records) => records.length;

    const getDailyTotalSleep = (records) =>
        records
            .reduce(
                (sum, r) =>
                    sum + (new Date(r.endTime) - new Date(r.startTime)) / 3600000,
                0
            )
            .toFixed(1);

    const getDailyTotalBelt = (records) =>
        records
            .reduce(
                (sum, r) =>
                    sum + (new Date(r.endTime) - new Date(r.startTime)) / 3600000,
                0
            )
            .toFixed(1);

    // ✅ Render section card
    const renderTable = (title, data, columns, typeKey = "feedings") => {
        const grouped = groupedByDate(data);
        const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        // Pagination
        const totalPages = Math.ceil(dates.length / itemsPerPage);
        const currentPage = page[typeKey] || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagedDates = dates.slice(startIndex, endIndex);

        const handlePageChange = (newPage) => {
            setPage((prev) => ({ ...prev, [typeKey]: newPage }));
        };

        return (
            <div className="col-lg-6">
                <div className="card mb-4 shadow-sm border-0">
                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                        <strong className="fs-6 mb-0">{title}</strong>
                        <div className="filter-scroll d-flex flex-nowrap gap-1 justify-content-end align-items-center">
                            {["1D", "1W", "1M", "3M", "YTD", "ALL"].map((opt) => (
                                <button
                                    key={opt}
                                    className={`btn btn-sm ${
                                        filters[typeKey] === opt
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() => {
                                        setFilters({ ...filters, [typeKey]: opt });
                                        setPage({ ...page, [typeKey]: 1 });
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="accordion" id={`accordion-${typeKey}`}>
                        {pagedDates.map((date, idx) => {
                            const dayRecords = grouped[date];
                            let totalLabel = "";

                            if (typeKey === "feedings") {
                                const totalOz = getDailyTotalOz(dayRecords);
                                if (totalOz > 0) totalLabel = `TOTAL: ${totalOz} OZ`;
                            } else if (typeKey === "diapers") {
                                totalLabel = `TOTAL: ${getDailyTotalDiapers(dayRecords)}`;
                            } else if (typeKey === "sleep") {
                                totalLabel = `TOTAL: ${getDailyTotalSleep(dayRecords)} HRS`;
                            } else if (typeKey === "belt") {
                                totalLabel = `TOTAL: ${getDailyTotalBelt(dayRecords)} HRS`;
                            }

                            return (
                                <div className="accordion-item" key={date}>
                                    <h2 className="accordion-header" id={`heading-${typeKey}-${idx}`}>
                                        <button
                                            className={`accordion-button ${
                                                idx === 0 ? "" : "collapsed"
                                            } fw-bold bg-light`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#collapse-${typeKey}-${idx}`}
                                            aria-expanded={idx === 0 ? "true" : "false"}
                                            aria-controls={`collapse-${typeKey}-${idx}`}
                                        >
                                            {date}
                                            {totalLabel && (
                                                <span
                                                    className="ms-2 fw-bold text-primary total-highlight float-end">
                                                                {totalLabel}
                                                            </span>
                                            )}
                                        </button>
                                    </h2>

                                    <div
                                        id={`collapse-${typeKey}-${idx}`}
                                        className={`accordion-collapse collapse ${
                                            idx === 0 ? "show" : ""
                                        }`}
                                        aria-labelledby={`heading-${typeKey}-${idx}`}
                                        data-bs-parent={`#accordion-${typeKey}`}
                                    >
                                        <div className="accordion-body p-0">
                                            <table className="table table-striped mb-0 align-middle">
                                                <thead className="table-light">
                                                <tr>
                                                    {columns.map((col) => (
                                                        <th key={col}>{col}</th>
                                                    ))}
                                                    <th>Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {dayRecords.map((item) => (
                                                    <tr key={item.id}>
                                                        {/* Feedings */}
                                                        {typeKey === "feedings" && (
                                                            <>
                                                                <td>
                                                                    {item.type
                                                                        ? item.type.charAt(0).toUpperCase() +
                                                                        item.type.slice(1)
                                                                        : "-"}
                                                                </td>
                                                                <td>
                                                                    {item.type === "breast"
                                                                        ? item.side
                                                                            ? item.side.charAt(0).toUpperCase() +
                                                                            item.side.slice(1)
                                                                            : "-"
                                                                        : item.amount
                                                                            ? `${item.amount} oz`
                                                                            : "-"}
                                                                </td>
                                                                <td>
                                                                    {item.startTime
                                                                        ? new Date(
                                                                            item.startTime
                                                                        ).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })
                                                                        : "-"}
                                                                </td>
                                                                <td>
                                                                    {item.endTime
                                                                        ? new Date(item.endTime).toLocaleTimeString(
                                                                            [],
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )
                                                                        : "-"}
                                                                </td>
                                                            </>
                                                        )}

                                                        {/* Diapers */}
                                                        {typeKey === "diapers" && (
                                                            <>
                                                                <td>
                                                                    {item.type
                                                                        ? item.type.charAt(0).toUpperCase() +
                                                                        item.type.slice(1)
                                                                        : "-"}
                                                                </td>
                                                                <td>
                                                                    {item.time
                                                                        ? new Date(item.time).toLocaleTimeString(
                                                                            [],
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )
                                                                        : "-"}
                                                                </td>
                                                            </>
                                                        )}

                                                        {/* Sleep / Belt */}
                                                        {(typeKey === "sleep" || typeKey === "belt") && (
                                                            <>
                                                                <td>
                                                                    {item.startTime
                                                                        ? new Date(
                                                                            item.startTime
                                                                        ).toLocaleTimeString([], {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })
                                                                        : "-"}
                                                                </td>
                                                                <td>
                                                                    {item.endTime
                                                                        ? new Date(item.endTime).toLocaleTimeString(
                                                                            [],
                                                                            {
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            }
                                                                        )
                                                                        : "-"}
                                                                </td>
                                                            </>
                                                        )}

                                                        {/* Actions */}
                                                        <td className="actions-dropdown">
                                                            <div className="dropdown">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                                    data-bs-toggle="dropdown"
                                                                    aria-label="Actions"
                                                                >
                                                                    <img
                                                                        src="/edit.png"
                                                                        alt="Actions"
                                                                        width={18}
                                                                        height={18}
                                                                    />
                                                                </button>
                                                                <ul className="dropdown-menu">
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item"
                                                                            onClick={() =>
                                                                                handleEdit(item, typeKey)
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item text-danger"
                                                                            onClick={() =>
                                                                                handleDelete(typeKey, item.id)
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 p-3 border-top">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                ← Prev
                            </button>
                            <span className="fw-semibold">
              Page {currentPage} of {totalPages}
            </span>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleDelete = async (type, id) => {
        const endpoint = `/api/${type}/${id}`;
        const res = await fetch(endpoint, {method: "DELETE"});
        if (res.ok) fetchAll();
    };

// ✅ Add here
    const handleEdit = (record, typeKey) => {
        setSelectedRecord({...record, _type: typeKey});
        setSelectedType(typeKey);
        setShowEdit(true);
    };

// ✅ Already have this one
    const handleSave = async (data) => {
        if (!selectedRecord || !selectedType) return;

        const endpoint = `/api/${selectedType}/${selectedRecord.id}`;
        const res = await fetch(endpoint, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        if (res.ok) {
            setShowEdit(false);
            fetchAll();
        }
    };

    return (
        <main className="container">
            <h1 className="mb-4 fw-bold">📜 Activity History</h1>
            <div className="row">
                {renderTable("Feedings", filtered.feedings, ["Type", "Amount / Side", "Start", "End"], "feedings")}
                {renderTable("Diapers", filtered.diapers, ["Type", "Time"], "diapers")}
                {renderTable("Sleep", filtered.sleep, ["Start", "End"], "sleep")}
                {renderTable("Belt", filtered.belt, ["Start", "End"], "belt")}

                <EditModal
                    show={showEdit}
                    record={selectedRecord}
                    type={selectedType}
                    onClose={() => setShowEdit(false)}
                    onSave={handleSave}
                />
            </div>
        </main>
    );
}