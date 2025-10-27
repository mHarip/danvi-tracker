"use client";

import {useState, useEffect} from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {Bar, Line} from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function ReportsPage() {
    const [feedings, setFeedings] = useState([]);
    const [diapers, setDiapers] = useState([]);
    const [sleep, setSleep] = useState([]);
    const [belt, setBelt] = useState([]);

    const [filterFeedings, setFilterFeedings] = useState("1W");
    const [filterDiapers, setFilterDiapers] = useState("1W");
    const [filterSleep, setFilterSleep] = useState("1W");
    const [filterBelt, setFilterBelt] = useState("1W");

    const fetchAll = async () => {
        const [f1, f2, f3, f4] = await Promise.allSettled([
            fetch("/api/feedings"),
            fetch("/api/diapers"),
            fetch("/api/sleep"),
            fetch("/api/belt"),
        ]);
        const getJson = async (r) =>
            r.status === "fulfilled" ? await r.value.json() : [];
        setFeedings(await getJson(f1));
        setDiapers(await getJson(f2));
        setSleep(await getJson(f3));
        setBelt(await getJson(f4));
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // ⏱ Filter by timeframe
    const filterByDate = (data, filter, key = "startTime") => {
        const now = new Date();
        return data.filter((item) => {
            const d = new Date(item[key]);
            switch (filter) {
                case "1D":
                    return d.toDateString() === now.toDateString();
                case "1W":
                    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                case "1M":
                    return d >= new Date(new Date().setMonth(now.getMonth() - 1));
                case "3M":
                    return d >= new Date(new Date().setMonth(now.getMonth() - 3));
                case "YTD":
                    return d.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    };

    const filtered = {
        feedings: filterByDate(feedings, filterFeedings),
        diapers: filterByDate(diapers, filterDiapers, "time"),
        sleep: filterByDate(sleep, filterSleep),
        belt: filterByDate(belt, filterBelt),
    };

    // 🧮 Group helpers
    const groupByDateSum = (data, key = "startTime", valueKey = "amount") => {
        const grouped = {};
        data.forEach((item) => {
            if (!item[key]) return;
            const date = new Date(item[key]).toISOString().split("T")[0];
            const val = parseFloat(item[valueKey] || 0);
            grouped[date] = (grouped[date] || 0) + val;
        });
        return grouped;
    };

    const groupByDateCount = (data, key = "time") => {
        const grouped = {};
        data.forEach((item) => {
            if (!item[key]) return;
            const date = new Date(item[key]).toISOString().split("T")[0];
            grouped[date] = (grouped[date] || 0) + 1;
        });
        return grouped;
    };

    const groupByDateHours = (data, startKey = "startTime", endKey = "endTime") => {
        const grouped = {};
        data.forEach((item) => {
            if (!item[startKey] || !item[endKey]) return;
            const start = new Date(item[startKey]);
            const end = new Date(item[endKey]);
            const date = start.toISOString().split("T")[0];
            const duration = (end - start) / 3600000;
            grouped[date] = (grouped[date] || 0) + duration;
        });
        return grouped;
    };

    // 🔢 Sort grouped data by actual date
    const sortGrouped = (grouped) =>
        Object.entries(grouped)
            .sort((a, b) => new Date(b[0]) - new Date(a[0])) // 🔁 Reverse chronological
            .map(([date, value]) => ({
                label: new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                value,
            }));

    // 📊 Build sorted grouped datasets
    const feedingGrouped = sortGrouped(groupByDateSum(filtered.feedings));
    const diaperGrouped = sortGrouped(groupByDateCount(filtered.diapers));
    const sleepGrouped = sortGrouped(groupByDateHours(filtered.sleep));
    const beltGrouped = sortGrouped(groupByDateHours(filtered.belt));

    const feedingData = {
        labels: feedingGrouped.map((d) => d.label),
        datasets: [
            {
                label: "Total Feed (oz)",
                data: feedingGrouped.map((d) => d.value),
                backgroundColor: "rgba(1, 42, 82, 0.5)",
                borderColor: "#012a52",
            },
        ],
    };

    const diaperData = {
        labels: diaperGrouped.map((d) => d.label),
        datasets: [
            {
                label: "Diaper Changes",
                data: diaperGrouped.map((d) => d.value),
                backgroundColor: "rgba(255, 99, 132, 0.4)",
                borderColor: "rgba(255, 99, 132, 0.8)",
            },
        ],
    };

    const sleepData = {
        labels: sleepGrouped.map((d) => d.label),
        datasets: [
            {
                label: "Sleep (hrs)",
                data: sleepGrouped.map((d) => d.value),
                backgroundColor: "rgba(255, 159, 64, 0.4)",
                borderColor: "rgba(255, 159, 64, 1)",
            },
        ],
    };

    const beltData = {
        labels: beltGrouped.map((d) => d.label),
        datasets: [
            {
                label: "Belt Duration (hrs)",
                data: beltGrouped.map((d) => d.value),
                backgroundColor: "rgba(75, 192, 75, 0.4)",
                borderColor: "rgba(75, 192, 75, 1)",
            },
        ],
    };

    // 📈 Chart options
    const chartOptions = (title) => ({
        responsive: true,
        plugins: {
            legend: {position: "top"},
            title: {display: false},
        },
        scales: {
            x: {
                grid: {color: "#eee"},
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                },
            },
            y: {
                grid: {color: "#f5f5f5"},
                beginAtZero: true,
            },
        },
    });

    // Totals
    const getTotal = (arr) =>
        arr.reduce((sum, d) => sum + d.value, 0).toFixed(1);

    const timeFilters = ["1D", "1W", "1M", "3M", "YTD", "ALL"];

    const renderChartCard = (title, chartType, data, filter, setFilter, total) => (
        <div className="col-md-6 mb-4" key={title}>
            <div className="card shadow-sm border-0">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                    <strong>{title}</strong>
                    <div className="filter-buttons d-flex flex-wrap justify-content-end gap-1">
                        {timeFilters.map((opt) => (
                            <button
                                key={opt}
                                className={`btn btn-sm ${
                                    filter === opt ? "btn-primary" : "btn-outline-secondary"
                                }`}
                                onClick={() => setFilter(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="card-body">
                    {data.labels.length === 0 ? (
                        <div className="text-center text-muted py-4">
                            No results found for this timeframe.
                        </div>
                    ) : chartType === "bar" ? (
                        <Bar options={chartOptions(title)} data={data}/>
                    ) : (
                        <Line options={chartOptions(title)} data={data}/>
                    )}
                    {data.labels.length > 0 && (
                        <div className="text-end mt-3 fw-bold text-primary">
                            {title === "Feeding Amounts" && `Total: ${total} oz`}
                            {title === "Diaper Changes" && `Total: ${total}`}
                            {title === "Sleep Durations" && `Total: ${total} hrs`}
                            {title === "Belt Usage" && `Total: ${total} hrs`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <main className="container mt-4">
            <h1 className="mb-4 fw-bold">📊 Reports</h1>
            <div className="row">
                {renderChartCard(
                    "Feeding Amounts",
                    "bar",
                    feedingData,
                    filterFeedings,
                    setFilterFeedings,
                    getTotal(feedingGrouped)
                )}
                {renderChartCard(
                    "Diaper Changes",
                    "bar",
                    diaperData,
                    filterDiapers,
                    setFilterDiapers,
                    getTotal(diaperGrouped)
                )}
                {renderChartCard(
                    "Sleep Durations",
                    "line",
                    sleepData,
                    filterSleep,
                    setFilterSleep,
                    getTotal(sleepGrouped)
                )}
                {renderChartCard(
                    "Belt Usage",
                    "line",
                    beltData,
                    filterBelt,
                    setFilterBelt,
                    getTotal(beltGrouped)
                )}
            </div>
        </main>
    );
}