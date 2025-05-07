import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db"; // Create your dbConnect function
import User from "@/model/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      await connectDB(); // Connect to DB

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
