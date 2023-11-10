import prisma from "@/prisma/client";
// import { unstable_noStore as noStore } from "next/cache";

export const getAllProjects = async () => {
    // check that...
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // This is equivalent to in fetch(..., {cache: 'no-store'})
    // noStore();

    const data = await prisma.project.findMany();

    return data
}

export const getSingleProject = async (id: string) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const data = await prisma.project.findUnique({
        where: {
          id: Number(id),
        },
    });
    return data
}