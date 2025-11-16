import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    return res.status(200).json({ uid: userCred.user.uid });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
