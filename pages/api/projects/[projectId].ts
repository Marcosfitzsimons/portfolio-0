import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const data = await prisma.project.findUnique({
        where: {
          id: Number(req.query.projectId),
        },
      });
      return res.status(200).json(data);
    } catch (err) {
      res
        .status(403)
        .json({ err: "Error has occured while getting post details" });
    }
  }
}