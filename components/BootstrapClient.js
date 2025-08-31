"use client";
import {useEffect} from "react";

export default function BootstrapClient() {
    useEffect(() => {
        const loadBootstrap = async () => {
            if (typeof window !== "undefined") {
                await import("bootstrap/js/dist/modal");
                await import("bootstrap/js/dist/offcanvas");
            }
        };
        loadBootstrap();
    }, []);

    return null; // renders nothing
}