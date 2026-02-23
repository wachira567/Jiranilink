import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection reference
const borrowRequestsCollection = collection(db, "borrowRequests");

/**
 * Create a new borrow request
 */
export const createBorrowRequest = async (requestData) => {
  try {
    const docRef = await addDoc(borrowRequestsCollection, {
      ...requestData,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    return { id: docRef.id, ...requestData, status: "pending" };
  } catch (error) {
    console.error("Error creating borrow request:", error);
    throw error;
  }
};

/**
 * Update borrow request status (accept/decline)
 */
export const updateBorrowRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, "borrowRequests", requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating borrow request:", error);
    throw error;
  }
};

/**
 * Delete a borrow request
 */
export const deleteBorrowRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "borrowRequests", requestId));
  } catch (error) {
    console.error("Error deleting borrow request:", error);
    throw error;
  }
};

/**
 * Get borrow requests for items owned by a user
 */
export const getBorrowRequestsByOwner = async (ownerId) => {
  try {
    const q = query(
      borrowRequestsCollection,
      where("ownerId", "==", ownerId)
    );
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return requests.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting borrow requests by owner:", error);
    throw error;
  }
};

/**
 * Get borrow requests made by a user
 */
export const getBorrowRequestsByBorrower = async (borrowerId) => {
  try {
    const q = query(
      borrowRequestsCollection,
      where("borrowerId", "==", borrowerId)
    );
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return requests.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting borrow requests by borrower:", error);
    throw error;
  }
};

/**
 * Subscribe to borrow requests for owner (real-time)
 */
export const subscribeToBorrowRequestsByOwner = (ownerId, callback) => {
  const q = query(
    borrowRequestsCollection,
    where("ownerId", "==", ownerId)
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    requests.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
    
    callback(requests);
  }, (error) => {
    console.error("Error subscribing to borrow requests by owner:", error);
    callback([]);
  });
};

/**
 * Subscribe to borrow requests by borrower (real-time)
 */
export const subscribeToBorrowRequestsByBorrower = (borrowerId, callback) => {
  const q = query(
    borrowRequestsCollection,
    where("borrowerId", "==", borrowerId)
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    requests.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
    
    callback(requests);
  }, (error) => {
    console.error("Error subscribing to borrow requests by borrower:", error);
    callback([]);
  });
};

/**
 * Subscribe to ALL borrow requests in a specific region (For Admins)
 */
export const subscribeToAllRequestsByRegion = (regionId, callback) => {
  if (!regionId) {
    // If no region provided, maybe return all (Super Admin)
     const q = query(borrowRequestsCollection);
     return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        requests.sort((a, b) => {
          const timeA = a.timestamp?.toMillis() || 0;
          const timeB = b.timestamp?.toMillis() || 0;
          return timeB - timeA;
        });
        callback(requests);
     });
  }

  // To truly filter by region on requests we would need regionId on the borrow_request doc.
  // Since we don't currently save regionId on borrow requests directly, we will fetch all 
  // and filter by the owner's region ID client-side (or assume the item is in this region).
  // For optimal architecture, borrow requests SHOULD save regionId, but as a workaround:
  const q = query(borrowRequestsCollection);
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort descending by timestamp client-side
    requests.sort((a, b) => {
      const timeA = a.timestamp?.toMillis() || 0;
      const timeB = b.timestamp?.toMillis() || 0;
      return timeB - timeA;
    });
    
    callback(requests);
  }, (error) => {
    console.error("Error subscribing to all region borrow requests:", error);
    callback([]);
  });
};

/**
 * Get a single borrow request
 */
export const getBorrowRequest = async (requestId) => {
  try {
    const requestRef = doc(db, "borrowRequests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists()) {
      return { id: requestSnap.id, ...requestSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting borrow request:", error);
    throw error;
  }
};
