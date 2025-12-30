"use client";

import { useState } from "react";
import {
  Calendar,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { importDraws } from "@/app/actions/import-draws";

export function ImportSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [drawDate, setDrawDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    overwrite: boolean = false
  ) => {
    e.preventDefault();

    if (!rawText.trim()) {
      toast.error("Veuillez coller les données du tirage");
      return;
    }

    setIsLoading(true);

    try {
      const result = await importDraws(drawDate, rawText, overwrite);

      if (result.success) {
        const message = result.wasOverwrite
          ? `✅ ${result.count} room(s) écrasée(s) pour le ${drawDate}`
          : `✅ ${result.count} room(s) sauvegardée(s) pour le ${drawDate}`;
        toast.success(message);
        setRawText("");
        // Trigger a refresh of the history
        window.dispatchEvent(new Event("draws-updated"));
      } else if (result.needsConfirmation) {
        // Date already exists - ask for confirmation
        toast.error(
          `La date ${drawDate} contient déjà ${result.existingRoomCount} room(s)`,
          {
            action: {
              label: "Écraser",
              onClick: () => handleSubmit(e, true),
            },
            duration: 10000,
          }
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'importation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen">
      {/* Sidebar Content */}
      <div
        className={`${
          isCollapsed ? "w-0" : "w-80 md:w-96"
        } border-r bg-card transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Import Rapide
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Parsing instantané • 100% gratuit
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="draw-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date du tirage
              </Label>
              <Input
                id="draw-date"
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Raw Text Input */}
            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="raw-text">Données brutes</Label>
              <Textarea
                id="raw-text"
                placeholder={`Format 1 (nombres sur même ligne):
Digital Reveil 7h
Gagnants : 38 78 52 12 39
Machine : 45 84 75 4 59

Format 2 (nombres sur lignes séparées):
Digital Reveil 8h
Gagnants :
47
74
36
65
9
Machine :
82
78
90
8
2

National (sans machine):
National
Gagnants : 5 15 25 35 45`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="flex-1 min-h-100 font-mono text-sm"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-4 bg-muted rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-2">
              ⚡ Parsing Gratuit & Instantané
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Aucun frais d'API - traitement 100% local</li>
              <li>
                Accepte 2 formats: nombres sur même ligne OU lignes séparées
              </li>
              <li>5 numéros gagnants requis par room</li>
              <li>National: avec ou sans numéros machine</li>
              <li>Autres rooms: 5 numéros machine requis</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="outline"
        size="icon"
        className="absolute top-4 -right-4 z-10 h-8 w-8 rounded-full shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
