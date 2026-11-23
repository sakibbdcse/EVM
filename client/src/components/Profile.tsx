import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BASE_URL, getImageUrl } from "../config/BaseUrl";
import { updateUser, type User } from "../redux/authSlice";
import { FaEdit, FaSave, FaTimes, FaCamera, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

type Address = {
  id: number;
  division: string;
  district: string;
  city?: string;
  village?: string;
  other_address_details?: string;
};

interface ProfileProps {
  user: User;
  token: string;
}

const Profile = ({ user, token }: ProfileProps) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if user prop changes
  useEffect(() => {
    setFormData(user);
    if (user.photo_url) {
      setPhotoPreview(getImageUrl(user.photo_url));
    }
  }, [user]);

  // Fetch addresses for dropdown
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/addresses`);
        if (res.ok) {
          const data: Address[] = await res.json();
          setAddresses(data);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };
    fetchAddresses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const data = new FormData();
      data.append("first_name", formData.first_name || "");
      data.append("last_name", formData.last_name || "");
      data.append("phone", formData.phone || "");
      data.append("gender", formData.gender || "Other");
      if (formData.birthdate) data.append("birthdate", formData.birthdate);
      if (formData.nid) data.append("nid", formData.nid);
      if (formData.address_id) data.append("address_id", String(formData.address_id));
      if (photoFile) data.append("photo", photoFile);

      const res = await fetch(`${BASE_URL}/user/edit/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      setFormData(result);
      dispatch(updateUser(result));
      setIsEditing(false);
      setPhotoFile(null);
      setSuccessMsg("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const getAddressDisplay = () => {
    if (formData.address) {
      const a = formData.address;
      return `${a.division}, ${a.district}${a.city ? `, ${a.city}` : ""}${a.village ? `, ${a.village}` : ""}`;
    }
    const matched = addresses.find((a) => a.id === formData.address_id);
    if (matched) {
      return `${matched.division}, ${matched.district}${matched.city ? `, ${matched.city}` : ""}`;
    }
    return "Not specified";
  };

  return (
    <div className="card shadow-sm border-0 p-4 h-100 position-relative">
      {/* Edit / Cancel Toggle Button */}
      <button
        className={`btn btn-sm position-absolute top-0 end-0 m-3 rounded-pill px-3 d-flex align-items-center gap-1 ${
          isEditing ? "btn-outline-secondary" : "btn-outline-primary"
        }`}
        onClick={() => {
          setIsEditing(!isEditing);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
      >
        {isEditing ? (
          <>
            <FaTimes /> Cancel
          </>
        ) : (
          <>
            <FaEdit /> Edit Profile
          </>
        )}
      </button>

      <h5 className="fw-bold text-primary mb-3">Voter Credentials & Profile</h5>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
          <FaExclamationTriangle /> {errorMsg}
        </div>
      )}

      {/* Avatar Section */}
      <div className="text-center mb-4">
        <div className="position-relative d-inline-block">
          <img
            src={
              photoPreview ||
              (user.photo_url
                ? getImageUrl(user.photo_url)
                : "https://placehold.co/120x120/e2e8f0/475569?text=Photo")
            }
            alt="Profile Avatar"
            className="rounded-circle border border-3 border-primary shadow-sm"
            style={{ width: 110, height: 110, objectFit: "cover" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/120x120/e2e8f0/475569?text=Photo";
            }}
          />
          {isEditing && (
            <label
              htmlFor="photoUploadInput"
              className="position-absolute bottom-0 end-0 bg-primary text-white p-2 rounded-circle shadow cursor-pointer"
              style={{ cursor: "pointer" }}
              title="Change Photo"
            >
              <FaCamera size={14} />
              <input
                id="photoUploadInput"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
        <h5 className="fw-bold text-dark mt-2 mb-0">
          {formData.first_name} {formData.last_name}
        </h5>
        <small className="text-muted">@{formData.username}</small>
        <div className="mt-1">
          <span className="badge bg-primary text-uppercase px-2 py-1" style={{ fontSize: "0.75rem" }}>
            {formData.role.replace("_", " ")}
          </span>
          <span
            className={`badge ms-2 px-2 py-1 ${
              formData.has_voted ? "bg-success" : "bg-warning text-dark"
            }`}
            style={{ fontSize: "0.75rem" }}
          >
            {formData.has_voted ? "Vote Cast" : "Not Voted Yet"}
          </span>
        </div>
      </div>

      {/* Fields List */}
      <div className="table-responsive">
        <table className="table table-bordered table-sm mb-3">
          <tbody>
            <tr>
              <th className="bg-light text-muted w-35 py-2">First Name</th>
              <td className="py-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                ) : (
                  formData.first_name || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Last Name</th>
              <td className="py-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                ) : (
                  formData.last_name || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Email</th>
              <td className="py-2">{formData.email}</td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Phone Number</th>
              <td className="py-2">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                ) : (
                  formData.phone || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">National ID (NID)</th>
              <td className="py-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="nid"
                    value={formData.nid || ""}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                ) : (
                  formData.nid || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Gender</th>
              <td className="py-2">
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender || "Other"}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  formData.gender || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Date of Birth</th>
              <td className="py-2">
                {isEditing ? (
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate || ""}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                ) : (
                  formData.birthdate || "-"
                )}
              </td>
            </tr>

            <tr>
              <th className="bg-light text-muted py-2">Registered Constituency</th>
              <td className="py-2">
                {isEditing ? (
                  <select
                    name="address_id"
                    value={formData.address_id || ""}
                    onChange={handleChange}
                    className="form-select form-select-sm"
                  >
                    <option value="">-- Select Address Constituency --</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.division}, {addr.district}
                        {addr.city ? `, ${addr.city}` : ""}
                        {addr.village ? `, ${addr.village}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  getAddressDisplay()
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="text-end mt-auto">
          <button
            className="btn btn-primary rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-1"
            onClick={handleSave}
            disabled={loading}
          >
            <FaSave /> {loading ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
