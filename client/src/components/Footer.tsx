import { Link } from "react-router-dom";
import { FaVoteYea, FaShieldAlt, FaLock } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-top text-muted py-4 mt-auto">
      <div className="container px-3 px-md-4">
        <div className="row gy-3 align-items-center justify-content-between">
          <div className="col-md-5 d-flex align-items-center gap-2">
            <FaVoteYea className="text-primary fs-4" />
            <div>
              <span className="fw-bold text-dark">Electronic Voting Machine (EVM)</span>
              <p className="small text-muted mb-0">
                Transparent, Secure & Verifiable Digital Electoral System
              </p>
            </div>
          </div>

          <div className="col-md-4 d-flex justify-content-md-end gap-3 text-secondary small">
            <span className="d-flex align-items-center gap-1">
              <FaShieldAlt className="text-success" /> Integrity Verified
            </span>
            <span className="d-flex align-items-center gap-1">
              <FaLock className="text-primary" /> End-to-End Cryptography
            </span>
          </div>

          <div className="col-12 border-top pt-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small">
            <div>
              &copy; {new Date().getFullYear()} EVM Platform. All Rights Reserved.
            </div>
            <div className="d-flex gap-3">
              <Link to="/" className="text-muted text-decoration-none hover-primary">
                Home
              </Link>
              <Link to="/elections" className="text-muted text-decoration-none hover-primary">
                Elections
              </Link>
              <Link to="/results" className="text-muted text-decoration-none hover-primary">
                Live Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
