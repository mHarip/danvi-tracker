"use client";
import {useEffect, useState} from "react";
import {Line, Bar} from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import Navbar from "@/components/Navbar";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    TimeScale
);

// Map range labels to date range calculation
function getRangeDates(range) {
    const now = new Date();
    let from;
    switch (range) {
        case "1D":
            from = new Date(now);
            from.setDate(now.getDate() - 1);
            break;
        case "1W":
            from = new Date(now);
            from.setDate(now.getDate() - 7);
            break;
        case "1M":
            from = new Date(now);
            from.setDate(now.getDate() - 30);
            break;
        case "3M":
            from = new Date(now);
            from.setDate(now.getDate() - 90);
            break;
        case "YTD":
            from = new Date(now.getFullYear(), 0, 1);
            break;
        case "1Y":
            from = new Date(now);
            from.setDate(now.getDate() - 365);
            break;
        case "5Y":
            from = new Date(now);
            from.setDate(now.getDate() - 365 * 5);
            break;
        default:
            from = new Date(0); // all data
    }
    return { from, to: now };
}

function RangeFilter({range, setRange}) {
    const options = ["1D", "1W", "1M", "3M", "YTD", "1Y", "5Y"];
    return (
        <div className="d-flex flex-wrap gap-2 mb-3">
            {options.map((r) => (
                <button
                    key={r}
                    className={`btn btn-sm ${
                        range === r ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setRange(r)}
                    type="button"
                >
                    {r}
                </button>
            ))}
        </div>
    );
}

export default function ReportsPage() {
    const [feedings, setFeedings] = useState([]);
    const [diapers, setDiapers] = useState([]);
    const [sleep, setSleep] = useState([]);
    const [belt, setBelt] = useState([]);

    const [feedingRange, setFeedingRange] = useState("1M");
    const [diaperRange, setDiaperRange] = useState("1M");
    const [sleepRange, setSleepRange] = useState("1M");
    const [beltRange, setBeltRange] = useState("1M");

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

    // Filter data by range and return chart data for feeding/diaper/sleep
    const chartData = (data, label, key, range) => {
        const {from, to} = getRangeDates(range);
        const filtered = data.filter(d => {
            const dt = new Date(d[key]);
            return dt >= from && dt <= to;
        });
        return {
            datasets: [
                {
                    label,
                    data: filtered.map((d) => ({
                        x: new Date(d[key]),
                        y: d.amount ? d.amount : 1
                    })),
                    borderColor: "#DA363B", // Retro Rainbow red
                    backgroundColor: "rgba(218,54,59,0.6)",
                },
            ],
        };
    };

    // Filter belt data by range
    const beltChartData = (data, range) => {
        const {from, to} = getRangeDates(range);
        const filtered = data.filter(d => {
            const dt = d.startTime ? new Date(d.startTime) : null;
            return dt && dt >= from && dt <= to;
        });
        return {
            datasets: [
                {
                    label: "Belt Duration (hrs)",
                    data: filtered.map((d) => {
                        if (!d.endTime) return { x: new Date(d.startTime), y: 0 };
                        const start = new Date(d.startTime);
                        const end = new Date(d.endTime);
                        return {
                            x: start,
                            y: (end - start) / (1000 * 60 * 60)
                        };
                    }),
                    borderColor: "#4A7638", // Retro Rainbow green
                    backgroundColor: "rgba(74,118,56,0.6)",
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "#012a52", // match site text/nav color
                    font: { weight: "bold" }
                }
            }
        },
        scales: {
            xDate: {
                type: "time",
                time: {
                    unit: "day",
                    displayFormats: {
                        day: "MMM d"
                    }
                },
                position: "bottom",
                ticks: {
                    color: "#012a52",
                },
                grid: {
                    color: "rgba(1,42,82,0.1)",
                }
            },
            xTime: {
                type: "time",
                time: {
                    unit: "hour",
                    displayFormats: {
                        hour: "h:mm a"
                    }
                },
                position: "bottom",
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    color: "#012a52",
                }
            },
            y: {
                ticks: {
                    color: "#012a52",
                },
                grid: {
                    color: "rgba(1,42,82,0.1)",
                }
            }
        },
    };

    return (
        <>
            <main className="container">
                <h1 className="mb-4 fw-bold">📊 Reports</h1>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card mb-4">
                            <div className="card-header fw-bold">Feeding Amounts</div>
                            <div className="card-body">
                                <RangeFilter range={feedingRange} setRange={setFeedingRange}/>
                                <Bar data={chartData(feedings, "Amount (oz)", "startTime", feedingRange)} options={chartOptions}/>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-header fw-bold">Sleep Durations</div>
                            <div className="card-body">
                                <RangeFilter range={sleepRange} setRange={setSleepRange}/>
                                <Line data={chartData(sleep, "Sleep", "startTime", sleepRange)} options={chartOptions}/>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card mb-4">
                            <div className="card-header fw-bold">Diaper Changes</div>
                            <div className="card-body">
                                <RangeFilter range={diaperRange} setRange={setDiaperRange}/>
                                <Bar data={chartData(diapers, "Diaper", "time", diaperRange)} options={chartOptions}/>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-header fw-bold">Belt Usage</div>
                            <div className="card-body">
                                <RangeFilter range={beltRange} setRange={setBeltRange}/>
                                <Line data={beltChartData(belt, beltRange)} options={chartOptions}/>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}