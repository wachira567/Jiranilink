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
      where("ownerId", "==", ownerId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
      where("borrowerId", "==", borrowerId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
    where("ownerId", "==", ownerId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(requests);
  });
};

/**
 * Subscribe to borrow requests by borrower (real-time)
 */
export const subscribeToBorrowRequestsByBorrower = (borrowerId, callback) => {
  const q = query(
    borrowRequestsCollection,
    where("borrowerId", "==", borrowerId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(requests);
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
