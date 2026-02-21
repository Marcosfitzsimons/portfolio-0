export type ProjectStatus = "live" | "in-progress" | "archived";

export interface Project {
  id: number;
  title: string;
  description: string;
  stack: string;
  siteUrl: string;
  coverImageSm: string;
  coverImage: string;
  images: string[];
  mobileImages: string[];
  isPersonal: boolean;
  date: string;
  tags?: string[];
  status?: ProjectStatus;
  year?: string;
}

// Status badges
export const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  live: { label: "Live", variant: "default" },
  "in-progress": { label: "In Progress", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};
