import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";

// ✅ Define Address type
interface Address {
  id: number;
  division: string;
  district: string;
  city?: string;
  village?: string;
  other_address_details?: string;
}

const ElectionStatusSet = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // ✅ Fetch addresses from backend
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get<Address[]>(`${BASE_URL}/addresses`);
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      setStatusMessage("Please select an address");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/elections`, {
        title: "General Election 2025",
        address_id: selectedAddress,
        start_date: startDate,
        end_date: endDate,
        is_active: 0,
      });

      setStatusMessage(response.data.message || "Election saved successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setStatusMessage(
          error.response?.data?.error || "Something went wrong!"
        );
      } else {
        setStatusMessage("Something went wrong!");
      }
    }
  };

  const handleAddressChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedAddress(e.target.value);
  };

  return (
    <>
      <div className="col-md-6">
        <div className="card p-5 h-100">
          <h5 className="fw-bold text-primary mb-4">
            Election Status & Controls
          </h5>
          <div className="d-flex align-items-center mb-3">
            <span className="fw-medium me-3">Status:</span>
            <span className="badge bg-warning text-dark py-2 px-3">
              Election Not Started
            </span>
          </div>
          <p className="text-muted mb-4">
            Use the buttons below to control the election.
          </p>
          <div className="d-grid gap-2">
            <button className="btn btn-lg btn-custom-primary">
              Start Election
            </button>
            <button className="btn btn-lg btn-secondary">End Election</button>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card p-5 h-100">
          <h5 className="fw-bold text-primary mb-4">Set Election Details</h5>
          <form onSubmit={handleSubmit}>
            {/* Start Date */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                Election Start Date & Time
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                Election End Date & Time
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Address Dropdown */}
            <div className="mb-4">
              <label className="form-label fw-medium">Select Address</label>
              <select
                className="form-select"
                value={selectedAddress}
                onChange={handleAddressChange}
                required
              >
                <option value="">-- Select Address --</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.division}, {addr.district}
                    {addr.city ? `, ${addr.city}` : ""}
                    {addr.village ? `, ${addr.village}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <div className="d-grid">
              <button type="submit" className="btn btn-custom-primary">
                Save Details
              </button>
            </div>
          </form>

          {statusMessage && (
            <p className="mt-3 text-center fw-bold text-success">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ElectionStatusSet;
