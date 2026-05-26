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
  showcaseOrder: number;
}

// Status badges
export const statusConfig: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    badgeClass: string;
  }
> = {
  live: {
    label: "Live",
    variant: "default",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/20 text-emerald-300 backdrop-blur-sm hover:bg-emerald-500/20",
  },
  "in-progress": {
    label: "In Progress",
    variant: "secondary",
    badgeClass: "bg-background/80 backdrop-blur-sm",
  },
  archived: {
    label: "Archived",
    variant: "outline",
    badgeClass: "bg-background/80 backdrop-blur-sm",
  },
};
