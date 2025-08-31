import FeedingForm from "@/components/FeedingForm";
import DiaperForm from "@/components/DiaperForm";
import SleepForm from "@/components/SleepForm";
import BeltForm from "@/components/BeltForm";
import Navbar from "@/components/Navbar";

export default function Home() {
    return (
        <>
            <main className="container">
                <div className="row">
                    <div className="col-md-6">
                        <FeedingForm/>
                        <SleepForm/>
                    </div>
                    <div className="col-md-6">
                        <DiaperForm/>
                        <BeltForm/>
                    </div>
                </div>
            </main>
        </>
    );
}