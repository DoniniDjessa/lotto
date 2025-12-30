/**
 * Retourne la classe de couleur Tailwind pour un numéro basé sur son intervalle
 * 0-9: bleu
 * 10-19: vert
 * 20-29: jaune
 * 30-39: orange
 * 40-49: rouge
 * 50-59: violet
 * 60-69: rose
 * 70-79: indigo
 * 80-90: cyan
 */
export function getNumberColor(num: number): string {
  if (num >= 0 && num <= 9) {
    return "bg-blue-500 text-white hover:bg-blue-600";
  } else if (num >= 10 && num <= 19) {
    return "bg-green-500 text-white hover:bg-green-600";
  } else if (num >= 20 && num <= 29) {
    return "bg-yellow-500 text-white hover:bg-yellow-600";
  } else if (num >= 30 && num <= 39) {
    return "bg-orange-500 text-white hover:bg-orange-600";
  } else if (num >= 40 && num <= 49) {
    return "bg-red-500 text-white hover:bg-red-600";
  } else if (num >= 50 && num <= 59) {
    return "bg-purple-500 text-white hover:bg-purple-600";
  } else if (num >= 60 && num <= 69) {
    return "bg-pink-500 text-white hover:bg-pink-600";
  } else if (num >= 70 && num <= 79) {
    return "bg-indigo-500 text-white hover:bg-indigo-600";
  } else if (num >= 80 && num <= 90) {
    return "bg-cyan-500 text-white hover:bg-cyan-600";
  }
  // Par défaut (au cas où)
  return "bg-gray-500 text-white hover:bg-gray-600";
}

/**
 * Retourne une légende des couleurs pour l'utilisateur
 */
export const NUMBER_COLOR_LEGEND = [
  { range: "0-9", color: "bg-blue-500", label: "Bleu" },
  { range: "10-19", color: "bg-green-500", label: "Vert" },
  { range: "20-29", color: "bg-yellow-500", label: "Jaune" },
  { range: "30-39", color: "bg-orange-500", label: "Orange" },
  { range: "40-49", color: "bg-red-500", label: "Rouge" },
  { range: "50-59", color: "bg-purple-500", label: "Violet" },
  { range: "60-69", color: "bg-pink-500", label: "Rose" },
  { range: "70-79", color: "bg-indigo-500", label: "Indigo" },
  { range: "80-90", color: "bg-cyan-500", label: "Cyan" },
] as const;
