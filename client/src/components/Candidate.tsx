import React from "react";
import { getImageUrl } from "../config/BaseUrl";
import { FaCheckCircle, FaVoteYea } from "react-icons/fa";

export type CandidateItem = {
  id: number;
  election_id: number;
  user_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  party: string;
  slogan: string;
  description?: string;
  symbol?: string;
  symbol_url?: string;
  photo?: string;
  photo_url?: string;
  votes?: number;
};

interface CandidateProps {
  candidate: CandidateItem;
  hasVoted?: boolean;
  userVotedCandidateId?: number | null;
  onVote?: (candidateId: number) => void;
  isVoting?: boolean;
  canVote?: boolean;
}

const Candidate: React.FC<CandidateProps> = ({
  candidate,
  hasVoted = false,
  userVotedCandidateId = null,
  onVote,
  isVoting = false,
  canVote = true,
}) => {
  const candidateName =
    candidate.name ||
    (candidate.first_name && candidate.last_name
      ? `${candidate.first_name} ${candidate.last_name}`
      : "Nominated Candidate");

  const isUserSelection = userVotedCandidateId === candidate.id;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div
        className={`card h-100 shadow-sm border-0 position-relative transition-all ${
          isUserSelection ? "border border-2 border-success bg-success-subtle" : "bg-white"
        }`}
      >
        {isUserSelection && (
          <span className="position-absolute top-0 end-0 m-2 badge bg-success d-flex align-items-center gap-1 shadow-sm">
            <FaCheckCircle /> Your Choice
          </span>
        )}

        <div className="card-body p-4 d-flex flex-column text-center">
          {/* Symbol & Candidate Photos */}
          <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
            {/* Candidate Photo */}
            <img
              src={
                candidate.photo_url
                  ? getImageUrl(candidate.photo_url)
                  : "https://placehold.co/90x90/e2e8f0/475569?text=Candidate"
              }
              alt={candidateName}
              className="rounded-circle border border-2 border-primary shadow-sm"
              style={{ width: 80, height: 80, objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/90x90/e2e8f0/475569?text=Candidate";
              }}
            />

            {/* Official Symbol */}
            {candidate.symbol_url && (
              <img
                src={getImageUrl(candidate.symbol_url)}
                alt={`${candidate.party} Symbol`}
                className="rounded-circle border border-2 border-warning shadow-sm"
                style={{ width: 80, height: 80, objectFit: "contain", backgroundColor: "#fff" }}
                title="Electoral Symbol"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          <h5 className="fw-bold text-dark mb-1">{candidateName}</h5>
          <span className="badge bg-primary-subtle text-primary fw-semibold mb-2 mx-auto px-3 py-1">
            {candidate.party || "Independent"}
          </span>

          {candidate.slogan && (
            <p className="fst-italic text-secondary small mb-2">
              "{candidate.slogan}"
            </p>
          )}

          {candidate.description && (
            <p className="text-muted small mb-3 text-truncate-2">
              {candidate.description}
            </p>
          )}

          <div className="mt-auto pt-2 border-top">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">Recorded Votes:</span>
              <span className="badge bg-secondary px-2 py-1 fs-6">
                {candidate.votes ?? 0}
              </span>
            </div>

            {canVote && onVote && (
              <button
                className={`btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2 ${
                  hasVoted
                    ? isUserSelection
                      ? "btn-success disabled"
                      : "btn-outline-secondary disabled"
                    : "btn-success"
                }`}
                disabled={hasVoted || isVoting}
                onClick={() => onVote(candidate.id)}
              >
                <FaVoteYea />
                {hasVoted
                  ? isUserSelection
                    ? "Voted"
                    : "Voting Completed"
                  : isVoting
                  ? "Casting Vote..."
                  : "Vote For Candidate"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidate;
