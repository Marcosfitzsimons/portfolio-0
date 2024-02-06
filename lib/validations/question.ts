import * as z from "zod";

export const questionSchema = z.object({
  question: z
    .string()
    .min(3, {
      message: "Question must be at least 3 characters",
    })
    .max(160, {
      message: "Question cannot be longer than 160 characterest",
    }),
});
