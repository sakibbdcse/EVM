import { useState, useEffect } from "react";
import { BASE_URL } from "../config/BaseUrl";

type Address = {
  id: number;
  division: string;
  district: string;
  city: string;
  village: string;
  other_address_details: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  nid: string;
  gender: string;
  birthdate: string;
  role: string;
  address_id?: number;
  photo?: string | File;
  photo_url?: string;
};

type ProfileProps = {
  user: User;
  token: string;
};

const Profile = ({ user, token }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [changedFields, setChangedFields] = useState<Partial<User>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user.photo_url || null
  );

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const data: Address[] = await res.json();
        setAddresses(data);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };
    fetchAddresses();
  }, [token]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setChangedFields((prev) => ({ ...prev, [name]: value }));
  };

  // Handle photo upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setChangedFields((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!Object.keys(changedFields).length) {
      setIsEditing(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          data.append("photo", value);
        } else if (value !== undefined && value !== null) {
          data.append(key, String(value));
        }
      });

      const res = await fetch(`${BASE_URL}/user/edit/${formData.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }

      const updatedUser: User = await res.json();
      setFormData(updatedUser);
      setChangedFields({});
      setIsEditing(false);

      // Update photo preview from backend URL
      if (updatedUser.photo_url) {
        setPhotoPreview(updatedUser.photo_url);
      }

      alert("✅ Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Update error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      alert(`❌ ${message}`);
    }
  };

  // Helper to get photo URL
  const getPhotoSrc = () => {
    if (photoPreview) return photoPreview;
    return "/images/profavater.jpg"; // fallback
  };

  return (
    <div className="col-md-6 mb-4">
      <div className="card p-4 shadow-sm h-100 position-relative">
        <h5 className="fw-bold text-success mb-3">Your Profile</h5>

        {/* Edit button */}
        <button
          className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-3"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>

        {/* Profile photo */}
        <div className="text-center mb-3">
          <img
            className="profile-photo rounded-circle"
            alt="Profile"
            width={120}
            height={120}
            src={getPhotoSrc()}
          />
          {isEditing && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          )}
        </div>

        {/* Profile fields */}
        <ul className="list-group list-group-flush">
          {[
            { label: "First Name", key: "first_name" },
            { label: "Last Name", key: "last_name" },
            { label: "Username", key: "username" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "NID", key: "nid" },
            { label: "Gender", key: "gender" },
            { label: "Birthdate", key: "birthdate" },
            { label: "Address", key: "address_id" },
          ].map((field) => {
            const value = formData[field.key as keyof User];
            return (
              <li
                key={field.key}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {field.label}:
                {isEditing ? (
                  field.key === "gender" ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select w-50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : field.key === "birthdate" ? (
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="form-control w-50"
                    />
                  ) : field.key === "address_id" ? (
                    <select
                      name="address_id"
                      value={formData.address_id ?? ""}
                      onChange={handleChange}
                      className="form-select w-50"
                    >
                      <option value="">Select Address</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {`${addr.division}, ${addr.district}, ${addr.city}, ${addr.village}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.key === "email" ? "email" : "text"}
                      name={field.key}
                      value={String(value ?? "")}
                      onChange={handleChange}
                      className="form-control w-50"
                    />
                  )
                ) : field.key === "address_id" ? (
                  <span className="text-muted">
                    {addresses.find((a) => a.id === formData.address_id)
                      ? `${
                          addresses.find((a) => a.id === formData.address_id)
                            ?.division
                        }, ${
                          addresses.find((a) => a.id === formData.address_id)
                            ?.district
                        }, ${
                          addresses.find((a) => a.id === formData.address_id)
                            ?.city
                        }, ${
                          addresses.find((a) => a.id === formData.address_id)
                            ?.village
                        }`
                      : "-"}
                  </span>
                ) : (
                  <span className="text-muted">{String(value ?? "")}</span>
                )}
              </li>
            );
          })}

          {/* Role */}
          <li className="list-group-item d-flex justify-content-between align-items-center">
            Role: <span className="badge bg-warning">{formData.role}</span>
          </li>
        </ul>

        {/* Save button */}
        {isEditing && (
          <div className="mt-3 text-end">
            <button className="btn btn-success me-2" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
