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
        feedings: "1D",
        diapers: "1D",
        sleep: "1D",
        belt: "1D",
    });

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
                                    onClick={() =>
                                        setFilters({...filters, [typeKey]: opt})
                                    }
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped align-middle">
                            <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col}>{col}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dates.length > 0 ? (
                                dates.map((date) => {
                                    const dayRecords = grouped[date];
                                    let totalLabel = "";

                                    if (typeKey === "feedings") {
                                        const totalOz = getDailyTotalOz(dayRecords);
                                        if (totalOz > 0)
                                            totalLabel = `TOTAL: ${totalOz} OZ`;
                                    } else if (typeKey === "diapers") {
                                        totalLabel = `TOTAL: ${getDailyTotalDiapers(
                                            dayRecords
                                        )}`;
                                    } else if (typeKey === "sleep") {
                                        totalLabel = `TOTAL: ${getDailyTotalSleep(
                                            dayRecords
                                        )} HRS`;
                                    } else if (typeKey === "belt") {
                                        totalLabel = `TOTAL: ${getDailyTotalBelt(
                                            dayRecords
                                        )} HRS`;
                                    }

                                    return (
                                        <React.Fragment key={date}>
                                            {/* Group Header */}
                                            <tr className="table-secondary fw-bold">
                                                <td colSpan={columns.length + 1}>
                                                    {date}
                                                    {totalLabel && (
                                                        <span
                                                            className="ms-2 fw-bold text-primary total-highlight float-end">
                                                                {totalLabel}
                                                            </span>
                                                    )}
                                                </td>
                                            </tr>

                                            {dayRecords.map((item) => (
                                                <tr key={item.id}>
                                                    {/* Feedings */}
                                                    {typeKey === "feedings" && (
                                                        <>
                                                            <td>
                                                                {item.type
                                                                    ? item.type
                                                                        .charAt(0)
                                                                        .toUpperCase() +
                                                                    item.type.slice(1)
                                                                    : "-"}
                                                            </td>
                                                            <td>
                                                                {item.type === "breast"
                                                                    ? item.side
                                                                        ? item.side
                                                                            .charAt(0)
                                                                            .toUpperCase() +
                                                                        item.side.slice(
                                                                            1
                                                                        )
                                                                        : "-"
                                                                    : item.amount
                                                                        ? `${item.amount} oz`
                                                                        : "-"}
                                                            </td>
                                                            <td>
                                                                {item.startTime
                                                                    ? new Date(
                                                                        item.startTime
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )
                                                                    : "-"}
                                                            </td>
                                                            <td>
                                                                {item.endTime
                                                                    ? new Date(
                                                                        item.endTime
                                                                    ).toLocaleTimeString(
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
                                                                    ? item.type
                                                                        .charAt(0)
                                                                        .toUpperCase() +
                                                                    item.type.slice(1)
                                                                    : "-"}
                                                            </td>
                                                            <td>
                                                                {item.time
                                                                    ? new Date(
                                                                        item.time
                                                                    ).toLocaleTimeString(
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
                                                    {(typeKey === "sleep" ||
                                                        typeKey === "belt") && (
                                                        <>
                                                            <td>
                                                                {item.startTime
                                                                    ? new Date(
                                                                        item.startTime
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )
                                                                    : "-"}
                                                            </td>
                                                            <td>
                                                                {item.endTime
                                                                    ? new Date(
                                                                        item.endTime
                                                                    ).toLocaleTimeString(
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
                                                            >
                                                                Actions
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item"
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                item,
                                                                                typeKey
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        className="dropdown-item text-danger"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                typeKey,
                                                                                item.id
                                                                            )
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
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length + 1}
                                        className="text-center text-muted"
                                    >
                                        No records found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
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