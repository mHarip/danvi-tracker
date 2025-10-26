"use client";

import { useState, useEffect } from "react";
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
import { Bar, Line } from "react-chartjs-2";

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

    // individual filters for each chart
    const [filterFeedings, setFilterFeedings] = useState("1M");
    const [filterDiapers, setFilterDiapers] = useState("1M");
    const [filterSleep, setFilterSleep] = useState("1M");
    const [filterBelt, setFilterBelt] = useState("1M");

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

    const filterByDate = (data, filter, key = "startTime") => {
        const now = new Date();
        return data.filter((item) => {
            const d = new Date(item[key]);
            switch (filter) {
                case "1D":
                    return d.toDateString() === now.toDateString();
                case "1W":
                    return d >= new Date(now.setDate(now.getDate() - 7));
                case "1M":
                    return d >= new Date(now.setMonth(now.getMonth() - 1));
                case "3M":
                    return d >= new Date(now.setMonth(now.getMonth() - 3));
                case "YTD":
                    return d.getFullYear() === now.getFullYear();
                default:
                    return true; // ALL
            }
        });
    };

    const filtered = {
        feedings: filterByDate(feedings, filterFeedings),
        diapers: filterByDate(diapers, filterDiapers, "time"),
        sleep: filterByDate(sleep, filterSleep),
        belt: filterByDate(belt, filterBelt),
    };

    const chartOptions = (title) => ({
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
        },
        scales: {
            x: { grid: { color: "#eee" } },
            y: { grid: { color: "#f5f5f5" }, beginAtZero: true },
        },
    });

    const feedingData = {
        labels: filtered.feedings.map((f) =>
            new Date(f.startTime).toLocaleDateString([], { month: "short", day: "numeric" })
        ),
        datasets: [
            {
                label: "Amount (oz)",
                data: filtered.feedings.map((f) => Number(f.amount || 0)),
                backgroundColor: "rgba(1, 42, 82, 0.5)",
                borderColor: "#012a52",
            },
        ],
    };

    const diaperData = {
        labels: filtered.diapers.map((d) =>
            new Date(d.time).toLocaleDateString([], { month: "short", day: "numeric" })
        ),
        datasets: [
            {
                label: "Diaper",
                data: filtered.diapers.map(() => 1),
                backgroundColor: "rgba(255, 99, 132, 0.4)",
                borderColor: "rgba(255, 99, 132, 0.8)",
            },
        ],
    };

    const sleepData = {
        labels: filtered.sleep.map((s) =>
            new Date(s.startTime).toLocaleDateString([], { month: "short", day: "numeric" })
        ),
        datasets: [
            {
                label: "Sleep (hrs)",
                data: filtered.sleep.map(
                    (s) => (new Date(s.endTime) - new Date(s.startTime)) / 3600000
                ),
                backgroundColor: "rgba(255, 159, 64, 0.4)",
                borderColor: "rgba(255, 159, 64, 1)",
            },
        ],
    };

    const beltData = {
        labels: filtered.belt.map((b) =>
            new Date(b.startTime).toLocaleDateString([], { month: "short", day: "numeric" })
        ),
        datasets: [
            {
                label: "Belt Duration (hrs)",
                data: filtered.belt.map(
                    (b) => (new Date(b.endTime) - new Date(b.startTime)) / 3600000
                ),
                backgroundColor: "rgba(75, 192, 75, 0.4)",
                borderColor: "rgba(75, 192, 75, 1)",
            },
        ],
    };

    const timeFilters = ["1D", "1W", "1M", "3M", "YTD", "ALL"];

    const renderChartCard = (title, chartType, data, filter, setFilter) => (
        <div className="col-md-6 mb-4" key={title}>
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>{title}</strong>
                    <div className="filter-buttons">
                        {timeFilters.map((opt) => (
                            <button
                                key={opt}
                                className={`btn btn-sm me-1 ${
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
                    {chartType === "bar" && <Bar options={chartOptions(title)} data={data} />}
                    {chartType === "line" && <Line options={chartOptions(title)} data={data} />}
                </div>
            </div>
        </div>
    );

    return (
        <main className="container mt-4">
            <h1 className="mb-4 fw-bold">📊 Reports</h1>
            <div className="row">
                {renderChartCard("Feeding Amounts", "bar", feedingData, filterFeedings, setFilterFeedings)}
                {renderChartCard("Diaper Changes", "bar", diaperData, filterDiapers, setFilterDiapers)}
                {renderChartCard("Sleep Durations", "line", sleepData, filterSleep, setFilterSleep)}
                {renderChartCard("Belt Usage", "line", beltData, filterBelt, setFilterBelt)}
            </div>
        </main>
    );
}