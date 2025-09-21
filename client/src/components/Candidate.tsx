import axios from "axios";
import { useState, useEffect } from "react";
import { BASE_URL } from "../config/BaseUrl";

type CandidateProps = {
  candidate: {
    id: number;
    user_id: number;
    party: string;
    slogan: string;
    symbol_url?: string;
    votes?: number;
  };
  token: string;
};

type UserType = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_photo_url?: string;
};

const Candidate = ({ candidate, token }: CandidateProps) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/${candidate.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [candidate.user_id, token]);

  return (
    <div className="col-12 mb-3">
      <div className="card candidate-card shadow-sm p-3 d-flex flex-row align-items-center justify-content-between hover-shadow h-100">
        {/* Candidate Info */}
        <div className="d-flex flex-column">
          {user?.profile_photo_url && (
            <img
              src={`${BASE_URL}/${user.profile_photo_url}`}
              alt="Profile"
              className="candidate-profile rounded-circle mb-2 border"
              width={60}
              height={60}
            />
          )}

          <h5 className="fw-bold mb-1 mt-2">
            {user ? `${user.first_name} ${user.last_name}` : "Unknown User"}
          </h5>
          <small className="text-muted mb-1">({user?.username})</small>

          <p className="mb-1 text-primary fw-semibold">{candidate.party}</p>
          <p className="fst-italic mb-2 text-secondary">"{candidate.slogan}"</p>
          <p className="mb-0">
            Votes: <span className="fw-bold">{candidate.votes || 0}</span>
          </p>

          <button className="btn btn-success btn-sm mt-2 w-50 vote-btn">
            Vote
          </button>
        </div>
        {/* Symbol on the right */}
        {candidate.symbol_url && (
          <img
            src={`${BASE_URL}/${candidate.symbol_url}`}
            alt="Symbol"
            className="candidate-symbol rounded-circle border ms-3"
            width={80}
            height={80}
          />
        )}
      </div>
    </div>
  );
};

export default Candidate;
