import React from "react";
import { useAuth } from "../hooks/useAuth";

const regions = [
  { id: "nai_cbd", name: "Nairobi CBD" },
  { id: "nai_west", name: "Nairobi West" },
  { id: "nai_east", name: "Nairobi East" },
  { id: "kiambu", name: "Kiambu" },
  { id: "machakos", name: "Machakos" },
];

const RegionSelector = ({ currentRegion, onRegionChange }) => {
  const { role } = useAuth();

  const handleChange = (e) => {
    const selectedRegion = e.target.value;
    // In a real app, we would update Clerk's publicMetadata here
    // For now, we'll just pass it up to update the view
    onRegionChange(selectedRegion);
  };

  return (
    <div className="region-selector-container glass">
      <label htmlFor="region-select">Sharing Region:</label>
      <select 
        id="region-select" 
        value={currentRegion || ""} 
        onChange={handleChange}
        className="region-select"
      >
        <option value="" disabled>Select your region</option>
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.name}
          </option>
        ))}
        {role === "super_admin" && <option value="all">Global (All Regions)</option>}
      </select>
    </div>
  );
};

export default RegionSelector;
