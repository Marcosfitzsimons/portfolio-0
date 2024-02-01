import prisma from "@/prisma/client";

export const getAllProjects = async () => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.project.findMany();

    return data
}

export const getWorkProjects = async () => {
    const data = await prisma.project.findMany({
        where: {
         isPersonal: false
        },
      }) 
      return data
}

export const getPersonalProjects = async () => {
    const data = await prisma.project.findMany({
        where: {
         isPersonal: true
        },
        orderBy: {
            id: 'asc'
          }
      }) 
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