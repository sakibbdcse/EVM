const NavBar = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid px-4 py-2">
          <a className="navbar-brand fw-bold text-primary fs-4" href="#">
            Online Voting System
          </a>
          <div className="ms-auto">
            <button className="btn btn-custom-danger rounded-3 fw-semibold">
              Log Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
