import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; 

export const addNotification = async (message) => {
  try {
    await addDoc(collection(db, "notifications"), { message, timestamp: new Date() });
  } catch (error) {
    console.error("Error adding notification:", error);
  }
};
