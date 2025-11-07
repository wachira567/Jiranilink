// Local Storage Service for Items and Borrow Requests
// This stores data in browser's localStorage for simplicity

const ITEMS_KEY = "jiranilink_items";
const REQUESTS_KEY = "jiranilink_borrow_requests";

// Helper to get current user ID from Clerk
const getCurrentUserId = () => {
  // This will be passed from components
  return null;
};

// Helper to get current user name from Clerk
const getCurrentUserName = () => {
  return null;
};

// ============= ITEMS =============

// Get all items from localStorage
export const getAllItems = () => {
  try {
    const items = localStorage.getItem(ITEMS_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error getting items:", error);
    return [];
  }
};

// Get items by owner
export const getItemsByOwner = (ownerId) => {
  const allItems = getAllItems();
  return allItems.filter((item) => item.ownerId === ownerId);
};

// Add new item
export const addItem = (itemData, userId, userName) => {
  try {
    const allItems = getAllItems();
    const newItem = {
      id: Date.now().toString(), // Simple ID generation
      ownerId: userId,
      ownerName: userName,
      name: itemData.name,
      category: itemData.category,
      description: itemData.description,
      image: itemData.image || "📦",
      imageUrl: itemData.imageUrl || null, // For base64 images
      availability:
        itemData.availability !== undefined ? itemData.availability : true,
      dailyRate: parseFloat(itemData.dailyRate) || 0,
      deposit: parseFloat(itemData.deposit) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allItems.push(newItem);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(allItems));
    return newItem;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

// Update item
export const updateItem = (itemId, updates) => {
  try {
    const allItems = getAllItems();
    const index = allItems.findIndex((item) => item.id === itemId);

    if (index === -1) {
      throw new Error("Item not found");
    }

    allItems[index] = {
      ...allItems[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ITEMS_KEY, JSON.stringify(allItems));
    return allItems[index];
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

// Delete item
export const deleteItem = (itemId, userId) => {
  try {
    const allItems = getAllItems();
    const item = allItems.find((item) => item.id === itemId);

    // Check if user owns the item
    if (item && item.ownerId !== userId) {
      throw new Error("You can only delete your own items");
    }

    const filteredItems = allItems.filter((item) => item.id !== itemId);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(filteredItems));
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

// Toggle item availability
export const toggleItemAvailability = (itemId, userId) => {
  try {
    const allItems = getAllItems();
    const item = allItems.find((item) => item.id === itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    // Check if user owns the item
    if (item.ownerId !== userId) {
      throw new Error("You can only modify your own items");
    }

    return updateItem(itemId, { availability: !item.availability });
  } catch (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
};

// ============= BORROW REQUESTS =============

// Get all borrow requests
export const getAllBorrowRequests = () => {
  try {
    const requests = localStorage.getItem(REQUESTS_KEY);
    return requests ? JSON.parse(requests) : [];
  } catch (error) {
    console.error("Error getting borrow requests:", error);
    return [];
  }
};

// Get borrow requests by owner (items you own)
export const getBorrowRequestsByOwner = (ownerId) => {
  const allRequests = getAllBorrowRequests();
  return allRequests.filter((request) => request.ownerId === ownerId);
};

// Get borrow requests by borrower (items you want to borrow)
export const getBorrowRequestsByBorrower = (borrowerId) => {
  const allRequests = getAllBorrowRequests();
  return allRequests.filter((request) => request.borrowerId === borrowerId);
};

// Create borrow request
export const createBorrowRequest = (requestData) => {
  try {
    const allRequests = getAllBorrowRequests();
    const newRequest = {
      id: Date.now().toString(),
      itemId: requestData.itemId,
      itemName: requestData.itemName,
      ownerId: requestData.ownerId,
      ownerName: requestData.ownerName,
      borrowerId: requestData.borrowerId,
      borrowerName: requestData.borrowerName,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    allRequests.push(newRequest);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(allRequests));
    return newRequest;
  } catch (error) {
    console.error("Error creating borrow request:", error);
    throw error;
  }
};

// Update borrow request status
export const updateBorrowRequestStatus = (requestId, status, userId) => {
  try {
    const allRequests = getAllBorrowRequests();
    const index = allRequests.findIndex((request) => request.id === requestId);

    if (index === -1) {
      throw new Error("Request not found");
    }

    const request = allRequests[index];

    // Only owner can update status
    if (request.ownerId !== userId) {
      throw new Error("Only the item owner can update request status");
    }

    allRequests[index] = {
      ...request,
      status: status,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(allRequests));
    return allRequests[index];
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};

// Delete borrow request
export const deleteBorrowRequest = (requestId, userId) => {
  try {
    const allRequests = getAllBorrowRequests();
    const request = allRequests.find((req) => req.id === requestId);

    // Check if user is owner or borrower
    if (
      request &&
      request.ownerId !== userId &&
      request.borrowerId !== userId
    ) {
      throw new Error("You can only delete your own requests");
    }

    const filteredRequests = allRequests.filter((req) => req.id !== requestId);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(filteredRequests));
    return true;
  } catch (error) {
    console.error("Error deleting request:", error);
    throw error;
  }
};

// ============= UTILITY FUNCTIONS =============

// Clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem(ITEMS_KEY);
  localStorage.removeItem(REQUESTS_KEY);
};

// Initialize with mock data if empty
export const initializeWithMockData = (mockData) => {
  const existingItems = getAllItems();
  const existingRequests = getAllBorrowRequests();

  if (existingItems.length === 0 && mockData.items) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(mockData.items));
  }

  if (existingRequests.length === 0 && mockData.borrowRequests) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(mockData.borrowRequests));
  }
};

// Export data (for backup)
export const exportData = () => {
  return {
    items: getAllItems(),
    borrowRequests: getAllBorrowRequests(),
    exportedAt: new Date().toISOString(),
  };
};

// Import data (for restore)
export const importData = (data) => {
  if (data.items) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(data.items));
  }
  if (data.borrowRequests) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(data.borrowRequests));
  }
};
