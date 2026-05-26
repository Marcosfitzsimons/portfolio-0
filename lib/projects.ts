import prisma from "@/prisma/client";

export const getAllProjects = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const data = await prisma.project.findMany({
    orderBy: [{ showcaseOrder: "asc" }, { id: "asc" }],
  });

  return data;
};

export const getWorkProjects = async () => {
  const data = await prisma.project.findMany({
    where: {
      isPersonal: false,
    },
    orderBy: [{ showcaseOrder: "asc" }, { id: "asc" }],
  });
  return data;
};

export const getPersonalProjects = async () => {
  const data = await prisma.project.findMany({
    where: {
      isPersonal: true,
    },
    orderBy: [{ showcaseOrder: "asc" }, { id: "asc" }],
  });
  return data;
};
export const getSingleProject = async (id: string) => {
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const data = await prisma.project.findUnique({
    where: {
      id: Number(id),
    },
  });

  return data;
};
