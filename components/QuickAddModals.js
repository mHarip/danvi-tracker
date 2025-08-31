"use client";
import FeedingForm from "@/components/FeedingForm";
import SleepForm from "@/components/SleepForm";
import DiaperForm from "@/components/DiaperForm";
import BeltForm from "@/components/BeltForm";
import {useEffect} from "react";

export default function QuickAddModals() {
    useEffect(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return (
        <>
            <div
                className="modal fade"
                id="modalFeeding"
                tabIndex="-1"
                aria-labelledby="modalFeedingLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <FeedingForm/>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="modalSleep"
                tabIndex="-1"
                aria-labelledby="modalSleepLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <SleepForm/>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="modalDiaper"
                tabIndex="-1"
                aria-labelledby="modalDiaperLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <DiaperForm/>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="modalBelt"
                tabIndex="-1"
                aria-labelledby="modalBeltLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <BeltForm/>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}