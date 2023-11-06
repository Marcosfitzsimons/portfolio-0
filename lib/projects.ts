import prisma from "@/prisma/client";

export const getAllProjects = async () => {
    const data = await prisma.project.findMany();

    return data
}

export const getSingleProject = async (id: string) => {
    const data = await prisma.project.findUnique({
        where: {
          id: Number(id),
        },
    });
    return data
}