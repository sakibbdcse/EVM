const Candidate = () => {
  return (
    <>
      <div className="col-12 mb-3 col-sm-6">
        <div
          className="card p-3 shadow-sm candidate-card d-flex flex-column align-items-center text-center"
          data-id="1"
        >
          <img
            src="https://placehold.co/100x100/A3E635/000000?text=A"
            alt="Candidate A photo"
            className="candidate-photo"
          />
          <h6 className="fw-bold mb-1">Candidate A</h6>
          <p className="mb-1 text-muted">Party: Party X</p>
          <p className="fst-italic mb-2 text-primary">
            "A new era of progress."
          </p>
          <p className="mb-0">
            Votes: <span className="fw-bold">120</span>
          </p>
          <button className="btn btn-sm btn-custom-green mt-2 vote-btn">
            Vote
          </button>
        </div>
      </div>
    </>
  );
};

export default Candidate;
