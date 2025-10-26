"use client";
import Link from "next/link";
import {useState, useEffect} from "react";
import { usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);


    const [theme, setTheme] = useState("dark");
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();


    return (
        <nav className="navbar navbar-expand-lg custom-navbar sticky-top shadow">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" href="/">
                    <img
                        src="/logo.png"
                        alt="Danvi Tracker Logo"
                        width="40"
                        height="40"
                        className="me-2 rounded bg-light p-1"
                    />
                    <span className="visually-hidden">Danvi Tracker</span>
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar"
                    aria-controls="offcanvasNavbar"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="offcanvas offcanvas-end custom-navbar" tabIndex="-1" id="offcanvasNavbar"
                     aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                            {mounted ? "Danvi Tracker" : ""}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                                aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className={`nav-link ${pathname === "/" ? "active" : ""}`} href="/">
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${pathname === "/history" ? "active" : ""}`} href="/history">
                                    History
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${pathname === "/reports" ? "active" : ""}`} href="/reports">
                                    Reports
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}