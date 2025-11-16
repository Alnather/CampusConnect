import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default async function handler(req, res) {
  try {
    await signOut(auth);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
