import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import AddItemModal from "../components/AddItemModal";
import {
  subscribeToItemsByOwner,
  addItem,
  deleteItem,
  toggleItemAvailability,
} from "../services/itemService";
import {
  subscribeToBorrowRequestsByOwner,
  updateBorrowRequestStatus,
} from "../services/borrowService";

const MyItems = () => {
  const { userId, user, isLoaded } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's items and borrow requests with real-time updates
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Subscribe to user's items
    const unsubscribeItems = subscribeToItemsByOwner(userId, (items) => {
      setMyItems(items);
      setIsLoading(false);
    });

    // Subscribe to borrow requests
    const unsubscribeRequests = subscribeToBorrowRequestsByOwner(
      userId,
      (requests) => {
        setBorrowRequests(requests);
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeItems();
      unsubscribeRequests();
    };
  }, [userId]);

  const handleAddItem = async (itemData) => {
    try {
      const userName = user?.fullName || user?.firstName || "User";

      // Prepare item data for Firebase
      const itemToAdd = {
        ...itemData,
        ownerId: userId,
        ownerName: userName,
      };

      // Add item to Firebase (no image file, using emoji)
      await addItem(itemToAdd, null);
      toast.success("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
      throw error;
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      // Find the item to get its current availability
      const item = myItems.find((i) => i.id === itemId);
      if (!item) {
        throw new Error("Item not found");
      }

      await toggleItemAvailability(itemId, item.availability);
      toast.success("Availability updated!");
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error(error.message || "Failed to update availability");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      // Find the item to get its imageUrl
      const item = myItems.find((i) => i.id === itemId);
      const imageUrl = item?.imageUrl || null;

      await deleteItem(itemId, imageUrl);
      toast.success("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const status = action === "accept" ? "accepted" : "declined";
      await updateBorrowRequestStatus(requestId, status);
      toast.success(`Request ${status}!`);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(error.message || "Failed to update request");
    }
  };

  if (!isLoaded || isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-items-page page-content">
      <div className="page-header">
        <div>
          <h1>My Items</h1>
          <p>Manage your shared items and borrow requests</p>
        </div>
        <button
          className="btn-primary add-item-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Item
        </button>
      </div>

      {/* My Items Section */}
      <div className="items-section">
        <h2>Your Shared Items ({myItems.length})</h2>
        {myItems.length === 0 ? (
          <div className="empty-state">
            <p>You haven't added any items yet.</p>
            <p>Click "Add Item" to start sharing!</p>
          </div>
        ) : (
          <div className="items-grid">
            {myItems.map((item) => (
              <div key={item.id} className="item-card my-item-card">
                <div className="item-icon-placeholder">
                  <span style={{ fontSize: "4rem" }}>{item.image}</span>
                </div>

                <div className="item-content">
                  <div className="item-header">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="category">{item.category}</p>
                    </div>
                  </div>

                  <div className="item-details">
                    <p className="description">{item.description}</p>
                    <div className="item-pricing">
                      {item.deposit > 0 && (
                        <p className="deposit">
                          💰 Deposit: KES {item.deposit}
                        </p>
                      )}
                      {item.dailyRate > 0 && (
                        <p className="rate">
                          💵 Rate: KES {item.dailyRate}/day
                        </p>
                      )}
                      {item.dailyRate === 0 && item.deposit === 0 && (
                        <p className="free-badge">🎁 Free to borrow</p>
                      )}
                    </div>
                  </div>

                  <div className="item-actions">
                    <button
                      className={`availability-badge ${
                        item.availability ? "available" : "unavailable"
                      }`}
                      onClick={() => handleToggleAvailability(item.id)}
                    >
                      {item.availability ? "✓ Available" : "✗ Unavailable"}
                    </button>
                    <button
                      className="btn-danger-small"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Borrow Requests Section */}
      <div className="requests-section">
        <h2>Borrow Requests ({borrowRequests.length})</h2>
        {borrowRequests.length === 0 ? (
          <p className="empty-message">No borrow requests yet.</p>
        ) : (
          <div className="requests-list">
            {borrowRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-info">
                  <h4>{request.itemName}</h4>
                  <p>
                    Requested by: <strong>{request.borrowerName}</strong>
                  </p>
                  <p>
                    Dates: {request.startDate} to {request.endDate}
                  </p>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
                {request.status === "pending" && (
                  <div className="request-actions">
                    <button
                      className="btn-primary"
                      onClick={() => handleRequestAction(request.id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleRequestAction(request.id, "decline")}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
        />
      )}
    </div>
  );
};

export default MyItems;
