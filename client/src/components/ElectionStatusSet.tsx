import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import ElectionStatus from "./ElectionStatus";

interface Address {
  id: number;
  division: string;
  district: string;
  city?: string;
  village?: string;
  other_address_details?: string;
}

const ElectionStatusSet = () => {
  const [title, setTitle] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

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

    if (!selectedAddress || !title) {
      setStatusMessage("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/elections`, {
        title,
        address_id: selectedAddress,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive ? 1 : 0,
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
        <ElectionStatus />
      </div>

      <div className="col-md-6">
        <div className="card p-5 h-100">
          <h5 className="fw-bold text-primary mb-4">Set Election Details</h5>
          <form onSubmit={handleSubmit}>
            {/* Election Title */}
            <div className="mb-4">
              <label className="form-label fw-medium">Election Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter election name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

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

            {/* Active Checkbox */}
            <div className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="form-check-label">
                Set as Active Election
              </label>
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
