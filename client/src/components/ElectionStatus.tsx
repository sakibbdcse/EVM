import { useEffect, useState } from "react";

type TimeLeft = {
  expired: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const ElectionStatus: React.FC = () => {
  const endTime: Date = new Date("2025-09-05T23:00:00");

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      return {
        expired: true,
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(
      2,
      "0"
    );
    const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(
      2,
      "0"
    );
    const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

    return { expired: false, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="col-12">
      <div className="card p-4 shadow-sm text-center">
        <h5 className="fw-bold text-success mb-3">
          Election Status: Student Council President
        </h5>

        {!timeLeft.expired ? (
          <div className="mt-3">
            <h6 className="fw-bold text-danger">Countdown</h6>
            <h3 className="fw-bold">{timeLeft.days} Days Left</h3>
            <h4 className="fw-bold">
              {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </h4>
            <small className="text-muted">HH : MM : SS</small>
          </div>
        ) : (
          <h6 className="fw-bold text-muted mt-3">Election Ended</h6>
        )}
      </div>
    </div>
  );
};

export default ElectionStatus;
