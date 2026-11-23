import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { BASE_URL } from "../config/BaseUrl";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { FaPlusCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

interface Address {
  id: number;
  division: string;
  district: string;
  city?: string;
  village?: string;
}

interface ElectionStatusSetProps {
  onElectionSaved?: () => void;
}

const ElectionStatusSet: React.FC<ElectionStatusSetProps> = ({ onElectionSaved }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get<Address[]>(`${BASE_URL}/addresses`);
        setAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedAddress(String(response.data[0].id));
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!selectedAddress || !title || !startDate || !endDate) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMessage("End date & time must be after the start date.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/elections`,
        {
          title,
          description,
          address_id: Number(selectedAddress),
          start_date: startDate,
          end_date: endDate,
          is_active: isActive ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStatusMessage(response.data.message || "Election created successfully!");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      if (onElectionSaved) onElectionSaved();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.error || "Failed to create election.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex align-items-center gap-2 mb-3 text-primary">
        <FaPlusCircle className="fs-5" />
        <h5 className="fw-bold mb-0">Create New Election</h5>
      </div>
      <p className="text-muted small mb-3">
        Configure election scheduling, geographic constituency boundaries, and voting operational status.
      </p>

      {statusMessage && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <FaCheckCircle /> {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label fw-semibold small">Election Title *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. National General Election 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold small">Description / Guidelines</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Instructions, eligibility guidelines, or general constituency details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="row g-2 mb-3">
          {/* Start Date */}
          <div className="col-md-6">
            <label className="form-label fw-semibold small">Start Date & Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* End Date */}
          <div className="col-md-6">
            <label className="form-label fw-semibold small">End Date & Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Address Dropdown */}
        <div className="mb-3">
          <label className="form-label fw-semibold small">Constituency / Address Location *</label>
          <select
            className="form-select"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            required
          >
            <option value="">-- Select Constituency Area --</option>
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.division} - {addr.district}
                {addr.city ? `, ${addr.city}` : ""}
                {addr.village ? `, ${addr.village}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Active Toggle */}
        <div className="form-check form-switch mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isActiveSwitch"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActiveSwitch" className="form-check-label fw-medium small">
            Set as Active Election (Immediately Open for Voting)
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 fw-semibold rounded-pill py-2"
          disabled={loading}
        >
          {loading ? "Saving Election..." : "Save & Publish Election"}
        </button>
      </form>
    </div>
  );
};

export default ElectionStatusSet;
