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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          {/* Item Emoji */}
          <div className="form-group">
            <label htmlFor="image">Item Icon</label>
            <div className="emoji-selector">
              <div className="selected-emoji">{formData.image}</div>
              <select
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="emoji-select"
              >
                {itemEmojis.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
            </div>
            <small>Choose an icon that represents your item</small>
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
