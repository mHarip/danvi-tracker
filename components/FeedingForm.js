"use client";
import {useState, useEffect} from "react";

export default function FeedingForm({onSave}) {
    const [type, setType] = useState("breast");
    const [amount, setAmount] = useState(""); // reused for both oz and side
    const [side, setSide] = useState(""); // separate side state
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    // Automatically set current date/time on load
    useEffect(() => {
        const now = new Date();
        const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16); // format suitable for datetime-local
        setStartTime(localISO);
        setEndTime(localISO);
    }, []);

    async function handleSubmit(e) {
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Feeding saved:", data);

                // Optional callback for parent
                if (onSave) onSave(data);

                // Show success alert
                setAlertMessage("✅ Feeding saved successfully!");

                // Reset only the amount field
                setAmount("");
                setSide("");

                // Reset to current time again
                const now = new Date();
                const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setStartTime(localISO);
                setEndTime(localISO);

                // Hide alert automatically after 3 seconds
                setTimeout(() => setAlertMessage(""), 3000);
            } else {
                setAlertMessage("❌ Failed to save feeding. Try again.");
                setTimeout(() => setAlertMessage(""), 3000);
                console.error("❌ Failed to save feeding");
            }
        } catch (error) {
            console.error("Error:", error);
            setAlertMessage("❌ An unexpected error occurred.");
            setTimeout(() => setAlertMessage(""), 3000);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded bg-light position-relative">
            {alertMessage && (
                <div
                    className={`alert ${
                        alertMessage.startsWith("❌") ? "alert-danger" : "alert-success"
                    } text-center fw-bold`}
                    role="alert"
                >
                    {alertMessage}
                </div>
            )}

            <div className="mb-3">
                <label className="form-label fw-bold">Feeding Type</label>
                <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="breast">Breast</option>
                    <option value="pumped">Pumped</option>
                    <option value="formula">Formula</option>
                </select>
            </div>

            {type === "breast" ? (
                <div className="mb-3">
                    <label className="form-label fw-bold">Side</label>
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
                <div className="mb-3">
                    <label className="form-label fw-bold">Amount (oz)</label>
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

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Start Time</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">End Time</label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">
                Save Feeding
            </button>
        </form>
    );
}