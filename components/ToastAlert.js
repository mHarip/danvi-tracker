"use client";
import {useEffect, useState} from "react";

export default function ToastAlert({message, variant = "success", show, onClose}) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        setVisible(show);
        if (show) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, 3000); // auto-hide in 3s
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!visible || !message) return null;

    return (
        <div
            className="toast-container position-fixed top-0 end-0 p-3"
            style={{zIndex: 1055}}
        >
            <div className={`toast align-items-center text-bg-${variant} show`} role="alert">
                <div className="d-flex">
                    <div className="toast-body">{message}</div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        aria-label="Close"
                        onClick={() => {
                            setVisible(false);
                            if (onClose) onClose();
                        }}
                    ></button>
                </div>
            </div>
        </div>
    );
}