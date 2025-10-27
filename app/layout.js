import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/custom.scss";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import QuickAddModals from "@/components/QuickAddModals";

export const metadata = {
    title: "Danvi Tracker",
    description: "Track baby feeding, sleep, diapers, and more.",
    icons: {
        icon: "/favicon.ico",
        apple: "/favicon.png",
    },
};


export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <BootstrapClient/>

        <Navbar/>

        <div className="container-fluid">
            <div className="row">
                <main className="col-md ms-sm-auto col-lg px-md-4 py-4">
                    {children}
                </main>
            </div>
        </div>

        {/* Quick Add button */}
        <div className="dropdown position-fixed bottom-0 end-0 m-4">
            <button
                className="btn btn--quick-add dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                + Quick Add
            </button>
            <ul className="dropdown-menu">
                <li>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#modalFeeding">
                        Add Feeding
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#modalDiaper">
                        Add Diaper
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#modalSleep">
                        Add Sleep
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#modalBelt">
                        Add Belt
                    </a>
                </li>
            </ul>
        </div>

        {/* Mount modals here */}
        <QuickAddModals/>
        </body>
        </html>
    );
}