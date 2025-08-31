"use client";
import {useState} from "react";

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

export default function BeltForm() {
    const [start, setStart] = useState(getCurrentESTDateTimeLocal());
    const [end, setEnd] = useState(getCurrentESTDateTimeLocal());
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/belt", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({startTime: start, endTime: end}),
        });
        if (res.ok) {
            setStart(getCurrentESTDateTimeLocal());
            setEnd(getCurrentESTDateTimeLocal());
            setMessage("✅ Belt usage logged");
            setVariant("success");
            setTimeout(() => setMessage(null), 5000);
        } else {
            setMessage("❌ Failed to save belt usage");
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
                <div className="card-header fw-bold">Log Belt Usage</div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </div>
                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">
                                Save Belt Usage
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}