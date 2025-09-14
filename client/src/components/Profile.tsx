type User = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  nid: string;
  gender: string;
  birthdate: string;
  role: string;
};

type ProfileProps = {
  user: User;
};

const Profile = ({ user }: ProfileProps) => {
  return (
    <>
      <div className="col-md-6 mb-4">
        <div className="card p-4 shadow-sm h-100 position-relative">
          <h5 className="fw-bold text-success mb-3">Your Profile</h5>
          <button
            className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-3"
            onClick={() => console.log("Edit clicked")}
          >
            Edit
          </button>

          <div className="text-center mb-3">
            <img
              className="profile-photo"
              alt="Voter Photo"
              src="/images/profavater.jpg"
            />
          </div>

          <ul className="list-group list-group-flush">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Name:
              <span className="text-muted">
                {user.first_name} {user.last_name}
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Username:
              <span className="text-muted">{user.username}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Email:
              <span className="text-muted">{user.email}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Phone:
              <span className="text-muted">{user.phone}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              NID:
              <span className="text-muted">{user.nid}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Gender:
              <span className="text-muted">{user.gender}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Birthdate:
              <span className="text-muted">{user.birthdate}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Address:
              <span className="text-muted">
                123 Main Street, Anytown, State, 12345
              </span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Role:
              <span className="badge bg-warning">{user.role}</span>
            </li>
            {!(user.role === "voter" || user.role === "presiding_officer") && (
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Status:
                <span className="badge bg-success" id="votingStatus">
                  Eligible to Vote
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Profile;
