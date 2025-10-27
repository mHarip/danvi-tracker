"use client";
import { useState, useEffect } from "react";

export default function FeedingForm({ onSave }) {
    const [type, setType] = useState("breast");
    const [amount, setAmount] = useState("");
    const [side, setSide] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("success");

    // Automatically set current datetime
    useEffect(() => {
        const now = new Date();
        const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        setStartTime(localISO);
        setEndTime(localISO);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            type,
            amount: type === "breast" ? null : amount,
            side: type === "breast" ? side || null : null,
            startTime,
            endTime,
        };

        try {
            const res = await fetch("/api/feedings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Feeding saved:", data);

                if (onSave) onSave(data);

                setMessage("✅ Feeding logged");
                setVariant("success");

                // Reset fields
                setAmount("");
                setSide("");
                const now = new Date();
                const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setStartTime(localISO);
                setEndTime(localISO);

                setTimeout(() => setMessage(null), 5000);
            } else {
                setMessage("❌ Failed to save feeding");
                setVariant("danger");
                setTimeout(() => setMessage(null), 5000);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("❌ An unexpected error occurred.");
            setVariant("danger");
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <>
            {message && (
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
                                <option value="breast">Breast</option>
                                <option value="pumped">Pumped</option>
                                <option value="formula">Formula</option>
                            </select>
                        </div>

                        {type === "breast" ? (
                            <div className="col-md-6">
                                <label className="form-label">Side</label>
                                <select
                                    className="form-select"
                                    value={side}
                                    onChange={(e) => setSide(e.target.value)}
                                    required
                                >
                                    <option value="">Select side</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        ) : (
                            <div className="col-md-6">
                                <label className="form-label">Amount (oz)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    step="0.1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount in oz"
                                    required
                                />
                            </div>
                        )}

                        <div className="col-md-6">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
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