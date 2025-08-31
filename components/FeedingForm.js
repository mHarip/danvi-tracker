"use client";
import {useState} from "react";
import ToastAlert from "./ToastAlert";

function getCurrentESTDateTimeLocal() {
    const options = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };

    const estDateTime = new Date().toLocaleString('en-US', options);
    const [datePart, timePart] = estDateTime.split(', ');
    const [month, day, year] = datePart.split('/');

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
}

export default function FeedingForm() {
    const [type, setType] = useState("breast");
    const [amount, setAmount] = useState("");
    const [start, setStart] = useState(getCurrentESTDateTimeLocal());
    const [end, setEnd] = useState(getCurrentESTDateTimeLocal());
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");
    const [showToast, setShowToast] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/feedings", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                type,
                amount: parseFloat(amount),
                startTime: start,
                endTime: end,
            }),
        });
        if (res.ok) {
            setType("breast");
            setAmount("");
            setStart(getCurrentESTDateTimeLocal());
            setEnd(getCurrentESTDateTimeLocal());
            setMessage("✅ Feeding logged");
            setVariant("success");
            setTimeout(() => setMessage(null), 5000);
        } else {
            setMessage("❌ Failed to save feeding");
            setVariant("danger");
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <>{message && (
            <div className={`alert alert-${variant}`} role="alert">
                {message}
            </div>
        )}
            <div className="card mb-4">
                <div className="card-header fw-bold">Log Feeding</div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Type</label>
                            <select
                                className="form-select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                            >
                                <option value="">Select type</option>
                                <option value="breast">Breast feeding</option>
                                <option value="bottle">Bottle</option>
                                <option value="pump">Pumped</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Amount (oz)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Start</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">End</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </div>

                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">
                                Save Feeding
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}