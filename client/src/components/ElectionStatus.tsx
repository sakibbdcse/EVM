import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import { FaEdit, FaTrash } from "react-icons/fa";
import type { RootState } from "../redux/store";

type Election = {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  is_active: number;
};

type TimeLeft = {
  expired: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const ElectionStatus: React.FC = () => {
  const [election, setElection] = useState<Election | null>(null);
  const [allElections, setAllElections] = useState<Election[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    expired: false,
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const user = useSelector((state: RootState) => state.auth.user);

  // Fetch active election
  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/elections/active`);
        setElection(res.data);
      } catch (err) {
        console.error("Error fetching election:", err);
      }
    };
    fetchElection();
  }, []);

  // Fetch all elections if user is not a voter
  useEffect(() => {
    if (user?.role === "voter") return;

    const fetchAllElections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/elections`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAllElections(res.data);
      } catch (err) {
        console.error("Error fetching all elections:", err);
      }
    };
    fetchAllElections();
  }, [user]);

  // Countdown calculation
  const calculateTimeLeft = (endTime: Date): TimeLeft => {
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

  useEffect(() => {
    if (!election) return;

    const endTime = new Date(election.end_date);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [election]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this election?"))
      return;
    try {
      await axios.delete(`${BASE_URL}/elections/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllElections(allElections.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="col-12">
      {/* Active Election Countdown */}
      <div className="card p-4 shadow-sm text-center mb-4">
        <h5 className="fw-bold text-success mb-3">
          Election Status: {election ? election.title : "Loading..."}
        </h5>
        {!election ? (
          <p className="text-muted">Fetching election data...</p>
        ) : !timeLeft.expired ? (
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

      {/* All Elections for non-voters */}
      {user?.role !== "voter" && (
        <div className="mt-4">
          <h5 className="fw-bold text-success mb-3">
            All Elections ({allElections.length})
          </h5>

          <div className="list-group">
            {allElections.map((e) => (
              <div
                key={e.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center shadow-sm mb-2 rounded"
              >
                <div>
                  <h6 className="fw-bold mb-1">{e.title}</h6>
                  <small className="text-muted">
                    Start: {new Date(e.start_date).toLocaleDateString()} | End:{" "}
                    {new Date(e.end_date).toLocaleDateString()}
                  </small>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      e.is_active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {e.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => console.log("Edit", e.id)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(e.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionStatus;
