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
  photo?: string;
};

// FormData type for editing
type EditableUser = Omit<User, "photo"> & { photo?: string | File };

type ProfileProps = {
  user: User;
  token: string;
};

const Profile = ({ user, token }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EditableUser>(user);
  const [changedFields, setChangedFields] = useState<Partial<EditableUser>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Address[] = await res.json();
        setAddresses(data);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    };
    fetchAddresses();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setChangedFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photo: imageUrl }));
      setChangedFields((prev) => ({ ...prev, photo: file }));
    }
  };

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
        throw new Error(err.error || "Failed to update user");
      }

      const updatedUser: User = await res.json();
      setFormData(updatedUser);
      setChangedFields({});
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Update error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      alert(message);
    }
  };

  const fields: { label: string; name: keyof EditableUser }[] = [
    { label: "First Name", name: "first_name" },
    { label: "Last Name", name: "last_name" },
    { label: "Username", name: "username" },
    { label: "Email", name: "email" },
    { label: "Phone", name: "phone" },
    { label: "NID", name: "nid" },
    { label: "Gender", name: "gender" },
    { label: "Birthdate", name: "birthdate" },
    { label: "Address", name: "address_id" },
  ];

  return (
    <div className="col-md-6 mb-4">
      <div className="card p-4 shadow-sm h-100 position-relative">
        <h5 className="fw-bold text-success mb-3">Your Profile</h5>

        <button
          className="btn btn-sm btn-outline-success position-absolute top-0 end-0 m-3"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>

        <div className="text-center mb-3">
          <img
            className="profile-photo rounded-circle"
            alt="Profile"
            src={
              typeof formData.photo === "string"
                ? formData.photo
                : "/images/profavater.jpg"
            }
            width={120}
            height={120}
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

        <ul className="list-group list-group-flush">
          {fields.map((field) => {
            const value = formData[field.name];
            return (
              <li
                key={field.name}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {field.label}:
                {isEditing ? (
                  field.name === "gender" ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select w-50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : field.name === "birthdate" ? (
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="form-control w-50"
                    />
                  ) : field.name === "address_id" ? (
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
                      type={field.name === "email" ? "email" : "text"}
                      name={field.name}
                      value={String(value ?? "")}
                      onChange={handleChange}
                      className="form-control w-50"
                    />
                  )
                ) : field.name === "address_id" ? (
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

          <li className="list-group-item d-flex justify-content-between align-items-center">
            Role:
            <span className="badge bg-warning">{formData.role}</span>
          </li>
        </ul>

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
