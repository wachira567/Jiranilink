import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Generate a unique chat room ID for two users
 * Always generates the same ID regardless of order (user1-user2 or user2-user1)
 */
export const generateChatRoomId = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Create or get a chat room between two users
 */
export const createOrGetChatRoom = async (
  currentUserId,
  otherUserId,
  otherUserName,
  itemId = null,
  itemName = null
) => {
  const chatRoomId = generateChatRoomId(currentUserId, otherUserId);
  const chatRoomRef = doc(db, "chatRooms", chatRoomId);

  try {
    const chatRoomDoc = await getDoc(chatRoomRef);

    if (!chatRoomDoc.exists()) {
      // Create new chat room
      await setDoc(chatRoomRef, {
        participants: [currentUserId, otherUserId],
        participantNames: {
          [currentUserId]: "You",
          [otherUserId]: otherUserName,
        },
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        itemId: itemId,
        itemName: itemName,
      });
    }

    return chatRoomId;
  } catch (error) {
    console.error("Error creating/getting chat room:", error);
    throw error;
  }
};

/**
 * Send a message in a chat room
 */
export const sendMessage = async (
  chatRoomId,
  senderId,
  senderName,
  messageText
) => {
  try {
    const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");

    await addDoc(messagesRef, {
      senderId,
      senderName,
      text: messageText,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Update last message in chat room
    const chatRoomRef = doc(db, "chatRooms", chatRoomId);
    await updateDoc(chatRoomRef, {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Subscribe to messages in a chat room (real-time)
 */
export const subscribeToMessages = (chatRoomId, callback) => {
  const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    callback(messages);
  });
};

/**
 * Get all chat rooms for a user
 */
export const getUserChatRooms = async (userId) => {
  try {
    const chatRoomsRef = collection(db, "chatRooms");
    const q = query(
      chatRoomsRef,
      where("participants", "array-contains", userId)
    );

    const snapshot = await getDocs(q);
    const chatRooms = [];

    snapshot.forEach((doc) => {
      chatRooms.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return chatRooms;
  } catch (error) {
    console.error("Error getting chat rooms:", error);
    throw error;
  }
};

/**
 * Subscribe to user's chat rooms (real-time)
 */
export const subscribeToUserChatRooms = (userId, callback) => {
  const chatRoomsRef = collection(db, "chatRooms");
  const q = query(
    chatRoomsRef,
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const chatRooms = [];
    snapshot.forEach((doc) => {
      chatRooms.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Sort client-side to avoid needing a Firestore composite index
    chatRooms.sort((a, b) => {
      const timeA = a.lastMessageTime?.toMillis() || 0;
      const timeB = b.lastMessageTime?.toMillis() || 0;
      return timeB - timeA; // desc
    });
    
    callback(chatRooms);
  }, (error) => {
    console.error("Error subscribing to chat rooms:", error);
    callback([]);
  });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (chatRoomId, userId) => {
  try {
    const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
    // Avoid composite index by querying only one field and filtering the other client-side
    const q = query(
      messagesRef,
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);

    const updatePromises = [];
    snapshot.forEach((document) => {
      if (document.data().senderId !== userId) {
        const messageRef = doc(
          db,
          "chatRooms",
          chatRoomId,
          "messages",
          document.id
        );
        updatePromises.push(updateDoc(messageRef, { read: true }));
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

export const getUnreadCount = async (chatRoomId, userId) => {
  try {
    const messagesRef = collection(db, "chatRooms", chatRoomId, "messages");
    // Avoid composite index by querying only one field and filtering the other client-side
    const q = query(
      messagesRef,
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    let count = 0;
    snapshot.forEach((doc) => {
      if (doc.data().senderId !== userId) {
        count++;
      }
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};
