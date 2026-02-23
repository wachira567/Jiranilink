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
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { uploadImageToCloudinary } from "./cloudinaryService";

// Collection reference
const itemsCollection = collection(db, "items");

/**
 * Add a new item to Firestore
 */
export const addItem = async (itemData, imageFile) => {
  try {
    let imageUrl = "";

    // Upload image to Cloudinary if provided
    if (imageFile) {
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    // Add item to Firestore
    const docRef = await addDoc(itemsCollection, {
      ...itemData,
      imageUrl,
      regionId: itemData.regionId || null, // Ensure regionId is saved
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...itemData, imageUrl };
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

/**
 * Update an existing item
 */
export const updateItem = async (itemId, updates, newImageFile = null) => {
  try {
    const itemRef = doc(db, "items", itemId);
    let updateData = { ...updates, updatedAt: serverTimestamp() };

    // Upload new image to Cloudinary if provided
    if (newImageFile) {
      updateData.imageUrl = await uploadImageToCloudinary(newImageFile);
    }

    await updateDoc(itemRef, updateData);
    return { id: itemId, ...updateData };
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

/**
 * Delete an item
 */
export const deleteItem = async (itemId, imageUrl) => {
  try {
    // Note: Cloudinary unsigned images cannot be securely deleted from a client-side app
    // without exposing the API secret. We skip image deletion here.

    // 1. Delete all borrow requests associated with this item
    const requestsQuery = query(
      collection(db, "borrowRequests"),
      where("itemId", "==", itemId)
    );
    const querySnapshot = await getDocs(requestsQuery);
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, "borrowRequests", docSnap.id)));
    });
    await Promise.all(deletePromises);

    // 2. Delete item from Firestore
    await deleteDoc(doc(db, "items", itemId));
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

/**
 * Get all items
 */
export const getAllItems = async () => {
  try {
    const querySnapshot = await getDocs(
      query(itemsCollection, orderBy("createdAt", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting items:", error);
    throw error;
  }
};

/**
 * Get items by owner
 */
export const getItemsByOwner = async (ownerId) => {
  try {
    const q = query(
      itemsCollection,
      where("ownerId", "==", ownerId)
    );
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort descending by createdAt client-side
    return items.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting items by owner:", error);
    throw error;
  }
};

/**
 * Subscribe to all items (real-time)
 */
export const subscribeToItems = (callback) => {
  const q = query(itemsCollection, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  });
};

/**
 * Subscribe to items by owner (real-time)
 */
export const subscribeToItemsByOwner = (ownerId, callback) => {
  const q = query(
    itemsCollection,
    where("ownerId", "==", ownerId)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    items.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
    callback(items);
  }, (error) => {
    console.error("Error subscribing to items by owner:", error);
    callback([]);
  });
};

/**
 * Subscribe to items by region (real-time)
 */
export const subscribeToItemsByRegion = (regionId, callback) => {
  if (!regionId) return subscribeToItems(callback);

  const q = query(
    itemsCollection,
    where("regionId", "==", regionId)
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    items.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
    callback(items);
  }, (error) => {
    console.error("Error subscribing to items by region:", error);
    callback([]);
  });
};

/**
 * Toggle item availability
 */
export const toggleItemAvailability = async (itemId, currentAvailability) => {
  try {
    const itemRef = doc(db, "items", itemId);
    await updateDoc(itemRef, {
      availability: !currentAvailability,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
};
