"use server";

import { supabase, type RoomsData } from "@/lib/supabase";
import { parseLottoText } from "@/lib/parser";

/**
 * Check if a date already has data in the database
 */
export async function checkDateExists(drawDate: string) {
  const { data, error } = await supabase
    .from("lotto_draws")
    .select("draw_date, rooms")
    .eq("draw_date", drawDate)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found (which is OK)
    console.error("Error checking date:", error);
    return { exists: false, roomCount: 0 };
  }

  if (data) {
    const roomCount = Object.keys(data.rooms).length;
    return { exists: true, roomCount, existingRooms: data.rooms };
  }

  return { exists: false, roomCount: 0 };
}

/**
 * Import lottery draws using FREE TypeScript parser (no API costs!)
 * NEW: Stores all rooms for a date in a single database row
 * @param drawDate - The date of the draw
 * @param rawText - The raw text to parse
 * @param overwrite - Whether to overwrite existing data for this date
 */
export async function importDraws(
  drawDate: string,
  rawText: string,
  overwrite: boolean = false
) {
  try {
    // Step 1: Parse the raw text using FREE TypeScript parser
    const parseResult = parseLottoText(rawText);

    if (!parseResult.success || !parseResult.draws) {
      return {
        success: false,
        error: parseResult.error || "Erreur lors du parsing",
      };
    }

    // Step 2: Convert parsed draws to rooms JSON structure
    const rooms: RoomsData = {};
    parseResult.draws.forEach((draw) => {
      rooms[draw.room_name] = {
        winning_numbers: draw.winning_numbers,
        machine_numbers: draw.machine_numbers,
      };
    });

    // Step 3: Check if date already exists
    const dateCheck = await checkDateExists(drawDate);

    if (dateCheck.exists && !overwrite) {
      return {
        success: false,
        error: "date_exists",
        existingRoomCount: dateCheck.roomCount,
        needsConfirmation: true,
      };
    }

    // Step 4: Upsert (insert or update) the data
    const { data, error } = await supabase
      .from("lotto_draws")
      .upsert(
        {
          draw_date: drawDate,
          rooms: rooms,
        },
        {
          onConflict: "draw_date",
        }
      )
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message || "Erreur lors de la sauvegarde",
      };
    }

    return {
      success: true,
      count: Object.keys(rooms).length,
      wasOverwrite: dateCheck.exists,
    };
  } catch (error: any) {
    console.error("Import error:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de l'import",
    };
  }
}

/**
 * Delete all draws for a specific date
 */
export async function deleteDrawsByDate(drawDate: string) {
  try {
    const { error } = await supabase
      .from("lotto_draws")
      .delete()
      .eq("draw_date", drawDate);

    if (error) {
      console.error("Delete error:", error);
      return {
        success: false,
        error: error.message || "Erreur lors de la suppression",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de la suppression",
    };
  }
}
