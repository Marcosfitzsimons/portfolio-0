
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await prisma.project.findMany();
    return res.status(200).json(data);
  } catch (error) {
    res.status(403).json({ err: "Error has occured while fetching projects" })
  }
}