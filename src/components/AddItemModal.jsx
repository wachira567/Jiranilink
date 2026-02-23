import React, { useState } from "react";
import { toast } from "react-toastify";

const AddItemModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: "📦", // Default emoji
    dailyRate: "",
    deposit: "",
    availability: true,
    coordinates: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState("none"); // "none", "loading", "success", "error"

  const categories = [
    "Tools",
    "Kitchen",
    "Sports",
    "Home",
    "Electronics",
    "Office",
    "Outdoor",
    "Transport",
    "Safety",
    "Auto",
    "Other",
  ];

  // Common emojis for items
  const itemEmojis = [
    "📦",
    "🔧",
    "🔨",
    "🪛",
    "⚙️",
    "🔩",
    "🍳",
    "🍽️",
    "🥄",
    "🔪",
    "☕",
    "🧁",
    "⚽",
    "🏀",
    "🎾",
    "🏐",
    "⛺",
    "🎣",
    "💻",
    "🖥️",
    "⌨️",
    "🖱️",
    "📱",
    "📷",
    "🚲",
    "🛴",
    "🚗",
    "🏍️",
    "🛵",
    "📚",
    "✏️",
    "📝",
    "📊",
    "🖊️",
    "🌿",
    "🌱",
    "🪴",
    "🌻",
    "🌺",
    "🔌",
    "💡",
    "🔦",
    "🕯️",
    "🧯",
    "🧵",
    "🪡",
    "🧶",
    "👕",
    "👗",
    "🎨",
    "🖌️",
    "🎭",
    "🎪",
    "🎬",
    "🏠",
    "🪑",
    "🛋️",
    "🛏️",
    "🚪",
    "🧰",
    "🪜",
    "🪣",
    "🧹",
    "🧺",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Adds a small random offset to latitude and longitude for privacy.
   * Approx 0.001 - 0.002 degrees (~100m to 200m)
   */
  const addPrivacyJitter = (lat, lng) => {
    const latJitter = (Math.random() - 0.5) * 0.004; // Max offset +/- ~200m
    const lngJitter = (Math.random() - 0.5) * 0.004;
    return {
      lat: (lat + latJitter).toFixed(6),
      lng: (lng + lngJitter).toFixed(6)
    };
  };

  const handlePinLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const jitteredCoords = addPrivacyJitter(latitude, longitude);
        setFormData(prev => ({
          ...prev,
          coordinates: { lat: parseFloat(jitteredCoords.lat), lng: parseFloat(jitteredCoords.lng) }
        }));
        setLocationStatus("success");
      },
      (error) => {
        console.error("Geolocation Error:", error);
        toast.error("Could not fetch location. Please allow location access.");
        setLocationStatus("error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!formData.coordinates) {
      toast.error("Please pin the item's approximate location");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast.success("Item added successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal add-item-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          {/* Item Image / Emoji */}
          <div className="form-group">
            <label>Item Icon or Image</label>
            <div className="image-selection-container" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="emoji-selector" style={{ flex: 1 }}>
                <div className="selected-emoji">{formData.image}</div>
                <select
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="emoji-select"
                  disabled={!!formData.imageFile}
                >
                  {itemEmojis.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>OR</span>
              <div className="file-upload" style={{ flex: 2 }}>
                <input
                  type="file"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData(prev => ({ ...prev, imageFile: file || null }));
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <small>Choose an emoji icon, OR upload a real photo of your item.</small>
          </div>

          {/* Item Name */}
          <div className="form-group">
            <label htmlFor="name">
              Item Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Cordless Drill"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">
              Category <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">
              Description <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item, its condition, and any special instructions..."
              rows="4"
              required
            />
          </div>

          {/* Daily Rate */}
          <div className="form-group">
            <label htmlFor="dailyRate">Daily Rate (KES)</label>
            <input
              type="number"
              id="dailyRate"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              placeholder="0 for free"
              min="0"
              step="10"
            />
            <small>Leave as 0 if you want to lend for free</small>
          </div>

          {/* Security Deposit */}
          <div className="form-group">
            <label htmlFor="deposit">Security Deposit (KES)</label>
            <input
              type="number"
              id="deposit"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              placeholder="Optional security deposit"
              min="0"
              step="50"
            />
            <small>Refundable amount to ensure item safety</small>
          </div>

          {/* Location Pinning */}
          <div className="form-group">
            <label>Item Location <span style={{ color: "red" }}>*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className={`btn ${locationStatus === 'success' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handlePinLocation}
                disabled={locationStatus === 'loading'}
                style={{ flex: 1, padding: '0.75rem' }}
              >
                {locationStatus === 'loading' ? 'Locating...' : '📍 Detect My Location'}
              </button>
              <div style={{ flex: 1 }}>
                {locationStatus === 'success' && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Approximate Location Pinned!</span>}
                {locationStatus === 'error' && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Failed to get location.</span>}
                {locationStatus === 'none' && <span style={{ color: 'var(--text-muted)' }}>Required for the community map.</span>}
              </div>
            </div>
            <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              <em>Privacy Note: We automatically offset your true location slightly to protect your exact home address. Only the general neighborhood will be shown on the map.</em>
            </small>
          </div>

          {/* Availability */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />
              Available for borrowing
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
