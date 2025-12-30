import { z } from "zod";

// Schema for a single draw entry
// Note: National room may not have machine_numbers (can be empty array)
export const DrawEntrySchema = z.object({
  room_name: z.string().min(1, "Room name is required"),
  winning_numbers: z
    .array(z.number().int().min(1).max(90))
    .length(5, "Must have exactly 5 winning numbers"),
  machine_numbers: z
    .array(z.number().int().min(1).max(90))
    .refine(
      (arr) => arr.length === 0 || arr.length === 5,
      "Machine numbers must be either empty (for National) or exactly 5 numbers"
    ),
});

// Schema for the complete parsed result from AI
export const LottoParseSchema = z.object({
  draws: z.array(DrawEntrySchema).min(1, "At least one draw is required"),
});

export type DrawEntry = z.infer<typeof DrawEntrySchema>;
export type LottoParse = z.infer<typeof LottoParseSchema>;
