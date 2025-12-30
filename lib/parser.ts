/**
 * FREE TYPESCRIPT PARSER - No API costs!
 * Parses lottery draw data from raw text format
 */

export interface ParsedDraw {
  room_name: string;
  winning_numbers: number[];
  machine_numbers: number[];
}

export interface ParseResult {
  success: boolean;
  draws?: ParsedDraw[];
  error?: string;
}

/**
 * Parses raw lottery text into structured draw data
 * Handles two formats:
 * 1. Numbers on same line: "Gagnants : 1 2 3 4 5"
 * 2. Numbers on separate lines: "Gagnants :\n1\n2\n3\n4\n5"
 * @param rawText - The raw text pasted by the user
 * @returns ParseResult with draws array or error message
 */
export function parseLottoText(rawText: string): ParseResult {
  try {
    if (!rawText || rawText.trim().length === 0) {
      return {
        success: false,
        error: "Le texte est vide",
      };
    }

    const draws: ParsedDraw[] = [];

    // Split by lines and clean
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let currentRoom = "";
    let currentWinning: number[] = [];
    let currentMachine: number[] = [];
    let collectingWinning = false;
    let collectingMachine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if it's just a number (for multi-line format)
      const justNumber = line.match(/^(\d+)$/);
      if (justNumber) {
        const num = parseInt(justNumber[1], 10);
        if (num >= 1 && num <= 90) {
          if (collectingWinning && currentWinning.length < 5) {
            currentWinning.push(num);
            if (currentWinning.length === 5) {
              collectingWinning = false;
            }
          } else if (collectingMachine && currentMachine.length < 5) {
            currentMachine.push(num);
            if (currentMachine.length === 5) {
              collectingMachine = false;
            }
          }
        }
        continue;
      }

      // Check if this line starts "Gagnants"
      const winningMatch = line.match(
        /(?:Gagnants?|Winners?|Winning)\s*[:\-]?\s*([\d\s,]*)/i
      );
      if (winningMatch) {
        collectingWinning = true;
        collectingMachine = false;

        // Check if numbers are on the same line
        const numbersOnLine = winningMatch[1]
          .trim()
          .split(/[\s,]+/)
          .filter((n) => n.length > 0)
          .map((n) => parseInt(n, 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= 90);

        if (numbersOnLine.length === 5) {
          currentWinning = numbersOnLine;
          collectingWinning = false;
        } else if (numbersOnLine.length > 0) {
          // Partial numbers on same line
          currentWinning = numbersOnLine;
        } else {
          // No numbers on this line, will collect from next lines
          currentWinning = [];
        }
        continue;
      }

      // Check if this line starts "Machine"
      const machineMatch = line.match(
        /(?:Machine|Machines?)\s*[:\-]?\s*([\d\s,]*)/i
      );
      if (machineMatch) {
        collectingMachine = true;
        collectingWinning = false;

        // Check if numbers are on the same line
        const numbersOnLine = machineMatch[1]
          .trim()
          .split(/[\s,]+/)
          .filter((n) => n.length > 0)
          .map((n) => parseInt(n, 10))
          .filter((n) => !isNaN(n) && n >= 1 && n <= 90);

        if (numbersOnLine.length === 5) {
          currentMachine = numbersOnLine;
          collectingMachine = false;
        } else if (numbersOnLine.length > 0) {
          // Partial numbers on same line
          currentMachine = numbersOnLine;
        } else {
          // No numbers on this line, will collect from next lines
          currentMachine = [];
        }
        continue;
      }

      // If we reach here and we're not collecting numbers,
      // this might be a new room name
      if (!collectingWinning && !collectingMachine) {
        // Save previous room if we have valid data
        if (currentRoom && currentWinning.length === 5) {
          draws.push({
            room_name: currentRoom,
            winning_numbers: currentWinning,
            machine_numbers: currentMachine,
          });

          // Reset for next room
          currentWinning = [];
          currentMachine = [];
        }

        // This line is the room name
        currentRoom = line;
      }
    }

    // Don't forget the last room
    if (currentRoom && currentWinning.length === 5) {
      draws.push({
        room_name: currentRoom,
        winning_numbers: currentWinning,
        machine_numbers: currentMachine,
      });
    }

    // Validate results
    if (draws.length === 0) {
      return {
        success: false,
        error: "Aucune donnée valide trouvée. Vérifiez le format.",
      };
    }

    // Validate each draw
    for (const draw of draws) {
      if (draw.winning_numbers.length !== 5) {
        return {
          success: false,
          error: `Room "${draw.room_name}": doit avoir exactement 5 numéros gagnants (trouvé: ${draw.winning_numbers.length})`,
        };
      }

      // Machine numbers must be 0 or 5
      if (
        draw.machine_numbers.length !== 0 &&
        draw.machine_numbers.length !== 5
      ) {
        return {
          success: false,
          error: `Room "${draw.room_name}": doit avoir 0 ou 5 numéros machine (trouvé: ${draw.machine_numbers.length})`,
        };
      }
    }

    return {
      success: true,
      draws,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors du parsing",
    };
  }
}

/**
 * Validates that numbers are within lottery range (1-90)
 */
export function validateNumbers(numbers: number[]): boolean {
  return numbers.every((n) => n >= 1 && n <= 90);
}
