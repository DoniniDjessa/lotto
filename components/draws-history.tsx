"use client";

import { useEffect, useState } from "react";
import { supabase, type LottoDrawRow } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sortRoomsByHierarchy } from "@/lib/room-hierarchy";
import { deleteDrawsByDate } from "@/app/actions/import-draws";
import { toast } from "sonner";
import { getNumberColor } from "@/lib/number-colors";

const ITEMS_PER_PAGE = 10; // Dates per page

export function DrawsHistory() {
  const [draws, setDraws] = useState<LottoDrawRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDraws = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("lotto_draws")
      .select("*")
      .order("draw_date", { ascending: false });

    if (error) {
      console.error("Error fetching draws:", error);
      toast.error("Erreur lors du chargement des données");
    } else {
      setDraws(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDraws();

    // Listen for updates from the import sidebar
    const handleUpdate = () => fetchDraws();
    window.addEventListener("draws-updated", handleUpdate);

    return () => window.removeEventListener("draws-updated", handleUpdate);
  }, []);

  const handleDeleteDate = async (date: string) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer tous les tirages du ${format(
        new Date(date + "T00:00:00"),
        "d MMMM yyyy",
        { locale: fr }
      )} ?`
    );

    if (!confirmed) return;

    const result = await deleteDrawsByDate(date);

    if (result.success) {
      toast.success("Date supprimée avec succès");
      fetchDraws(); // Refresh the list
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Chargement de l'historique...
        </div>
      </div>
    );
  }

  if (draws.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun tirage enregistré</h3>
        <p className="text-sm text-muted-foreground">
          Utilisez le formulaire à gauche pour importer vos premiers tirages
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(draws.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDraws = draws.slice(startIndex, endIndex);

  // Calculate total rooms across all dates
  const totalRooms = draws.reduce(
    (sum, draw) => sum + Object.keys(draw.rooms).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historique des Tirages</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">{draws.length} jours</Badge>
          <Badge variant="outline">{totalRooms} rooms</Badge>
        </div>
      </div>

      {/* Accordion for dates */}
      <Accordion type="multiple" className="space-y-4">
        {paginatedDraws.map((dayData) => {
          // Convert rooms object to array and sort by hierarchy
          const roomsArray = Object.entries(dayData.rooms).map(
            ([roomName, data]) => ({
              room_name: roomName,
              ...data,
            })
          );
          const sortedRooms = sortRoomsByHierarchy(roomsArray);

          return (
            <AccordionItem
              key={dayData.id}
              value={dayData.draw_date}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      {format(
                        new Date(dayData.draw_date + "T00:00:00"),
                        "EEEE d MMMM yyyy",
                        { locale: fr }
                      )}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {sortedRooms.length} rooms
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDate(dayData.draw_date);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {/* Grid layout: 3 columns on large screens, 2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedRooms.map((room, idx) => (
                    <Card
                      key={idx}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">
                          {room.room_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Winning Numbers */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Gagnants
                          </p>
                          <div className="flex gap-0.5 flex-wrap">
                            {room.winning_numbers.map((num, numIdx) => (
                              <Badge
                                key={numIdx}
                                className={`${getNumberColor(
                                  num
                                )} text-xs px-2 py-0.5 rounded-sm font-semibold`}
                              >
                                {num}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Machine Numbers - Only show if not empty */}
                        {room.machine_numbers.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">
                              Machine
                            </p>
                            <div className="flex gap-0.5 flex-wrap">
                              {room.machine_numbers.map((num, numIdx) => (
                                <Badge
                                  key={numIdx}
                                  className={`${getNumberColor(
                                    num
                                  )} text-xs px-2 py-0.5 rounded-sm font-semibold opacity-80`}
                                >
                                  {num}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show message if no machine numbers */}
                        {room.machine_numbers.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">
                            Pas de numéros machine
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
