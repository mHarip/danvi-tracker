 "use client";
import "bootstrap/dist/css/bootstrap.min.css";
import {useState} from "react";

export default function LoginPage() {
    const [code, setCode] = useState("");

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{width: "350px"}}>
                <form action="/api/login" method="POST">
                    <h1 className="h4 mb-3 fw-bold text-center">🔐 Enter Passcode</h1>
                    <div className="mb-3">
                        <input
                            type="password"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="form-control"
                            placeholder="Enter code"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}