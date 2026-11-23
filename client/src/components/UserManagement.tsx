import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL, getImageUrl } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { UserRole } from "../redux/authSlice";
import { FaUserPlus, FaTrash, FaCheckCircle, FaExclamationTriangle, FaSearch } from "react-icons/fa";

interface UserRecord {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  birthdate: string;
  nid: string;
  role: UserRole;
  has_voted: boolean;
  date_joined: string;
  address_id?: number;
  address_label?: string;
  photo_url?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New staff form state
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "presiding_officer",
  });

  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const activeToken = token || localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    if (!activeToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [activeToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Change Role
  const handleRoleChange = async (userId: number, newRole: string) => {
    setMessage(null);
    try {
      const res = await axios.patch(
        `${BASE_URL}/user/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${activeToken}` } }
      );
      setMessage({ type: "success", text: res.data.message || "User role updated!" });
      fetchUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: "danger", text: err.response?.data?.error || "Failed to update role." });
      } else {
        setMessage({ type: "danger", text: "Error updating role." });
      }
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number, targetUsername: string) => {
    if (!window.confirm(`Are you sure you want to delete user '${targetUsername}'?`)) {
      return;
    }
    setMessage(null);
    try {
      const res = await axios.delete(`${BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setMessage({ type: "success", text: res.data.message || "User deleted." });
      fetchUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: "danger", text: err.response?.data?.error || "Failed to delete user." });
      } else {
        setMessage({ type: "danger", text: "Error deleting user." });
      }
    }
  };

  // Create Officer or Admin
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await axios.post(`${BASE_URL}/user/create`, newStaff, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setMessage({ type: "success", text: res.data.message || "Account created successfully!" });
      setShowCreateModal(false);
      setNewStaff({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "presiding_officer",
      });
      fetchUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage({ type: "danger", text: err.response?.data?.error || "Failed to create user." });
      } else {
        setMessage({ type: "danger", text: "Error creating user." });
      }
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.first_name.toLowerCase().includes(query) ||
      u.last_name.toLowerCase().includes(query) ||
      (u.nid && u.nid.toLowerCase().includes(query)) ||
      (u.phone && u.phone.includes(query));
    return matchesRole && matchesSearch;
  });


  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold text-primary mb-0">Citizen & Staff Management</h5>
          <small className="text-muted">Total Registered Accounts: {users.length}</small>
        </div>
        <button
          className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1"
          onClick={() => setShowCreateModal(true)}
        >
          <FaUserPlus /> Create Staff Account
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type} d-flex align-items-center gap-2 py-2 small mb-3`}>
          {message.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="row g-2 mb-3">
        <div className="col-md-7">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, username, email, phone, or NID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-5">
          <select
            className="form-select form-select-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="voter">Voters ({users.filter((u) => u.role === "voter").length})</option>
            <option value="presiding_officer">
              Presiding Officers ({users.filter((u) => u.role === "presiding_officer").length})
            </option>
            <option value="admin">Admins ({users.filter((u) => u.role === "admin").length})</option>
            <option value="super_admin">
              Super Admins ({users.filter((u) => u.role === "super_admin").length})
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="alert alert-light text-center py-4 border">
          <p className="text-muted mb-0">No users match your search criteria.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>NID</th>
                <th>Constituency</th>
                <th>Role</th>
                <th>Vote Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          u.photo_url
                            ? getImageUrl(u.photo_url)
                            : "https://placehold.co/36x36/e2e8f0/475569?text=U"
                        }
                        alt="User"
                        className="rounded-circle border"
                        style={{ width: 34, height: 34, objectFit: "cover" }}
                      />
                      <div>
                        <span className="fw-semibold text-dark d-block">
                          {u.first_name} {u.last_name}
                        </span>
                        <small className="text-muted">@{u.username}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="d-block">{u.email}</span>
                    <small className="text-muted">{u.phone}</small>
                  </td>
                  <td>{u.nid || "-"}</td>
                  <td>{u.address_label || "N/A"}</td>
                  <td>
                    {/* Role selector for admin */}
                    <select
                      className="form-select form-select-sm py-0"
                      style={{ width: "auto", fontSize: "0.75rem" }}
                      value={u.role}
                      disabled={
                        u.id === currentUser?.id ||
                        (u.role === "super_admin" && currentUser?.role !== "super_admin")
                      }
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="voter">Voter</option>
                      <option value="presiding_officer">Presiding Officer</option>
                      <option value="admin">Admin</option>
                      {currentUser?.role === "super_admin" && (
                        <option value="super_admin">Super Admin</option>
                      )}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.has_voted ? "bg-success-subtle text-success" : "bg-light text-muted"}`}>
                      {u.has_voted ? "Voted" : "Not Voted"}
                    </span>
                  </td>
                  <td className="text-end">
                    {u.id !== currentUser?.id && (
                      <button
                        className="btn btn-outline-danger btn-sm p-1 rounded-circle"
                        title="Delete User"
                        disabled={u.role === "super_admin" && currentUser?.role !== "super_admin"}
                        onClick={() => handleDeleteUser(u.id, u.username)}
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-primary">Provision Administrative Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateStaff}>
                <div className="modal-body">
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newStaff.first_name}
                        onChange={(e) => setNewStaff({ ...newStaff, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newStaff.last_name}
                        onChange={(e) => setNewStaff({ ...newStaff, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Username *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Role *</label>
                      <select
                        className="form-select form-select-sm"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="presiding_officer">Presiding Officer</option>
                        <option value="admin">System Admin</option>
                        {currentUser?.role === "super_admin" && (
                          <option value="super_admin">Super Administrator</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Phone *</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Initial Password *</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Minimum 6 characters"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill btn-sm px-3"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill btn-sm px-4 fw-semibold">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
