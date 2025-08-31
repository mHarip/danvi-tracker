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

export default function DiaperForm() {
    const [type, setType] = useState("mixed");
    const [time, setTime] = useState(getCurrentESTDateTimeLocal());
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/diapers", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({type, time}),
        });
        if (res.ok) {
            setType("mixed");
            setTime(getCurrentESTDateTimeLocal());
            setMessage("✅ Diaper logged");
            setVariant("success");
            setTimeout(() => setMessage(null), 5000);
        } else {
            setMessage("❌ Failed to save diaper log");
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
                <div className="card-header fw-bold">Log Diaper</div>
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
                                <option value="wet">Wet</option>
                                <option value="dirty">Dirty</option>
                                <option value="mixed">Mixed</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">
                                Save Diaper
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}