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

// Collection reference
const itemsCollection = collection(db, "items");

/**
 * Add a new item to Firestore
 */
export const addItem = async (itemData, imageFile) => {
  try {
    let imageUrl = "";

    // Upload image if provided
    if (imageFile) {
      const imageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Add item to Firestore
    const docRef = await addDoc(itemsCollection, {
      ...itemData,
      imageUrl,
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

    // Upload new image if provided
    if (newImageFile) {
      const imageRef = ref(storage, `items/${Date.now()}_${newImageFile.name}`);
      const snapshot = await uploadBytes(imageRef, newImageFile);
      updateData.imageUrl = await getDownloadURL(snapshot.ref);
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
    // Delete image from storage if exists
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef).catch((err) => {
        console.warn("Image deletion failed:", err);
      });
    }

    // Delete item from Firestore
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
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
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
