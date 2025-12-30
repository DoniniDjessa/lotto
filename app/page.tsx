import { DrawsHistory } from "@/components/draws-history";
import { ImportSidebar } from "@/components/import-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Left Sidebar: Import Form (Collapsible) */}
      <ImportSidebar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <header className="mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Lotto Predict Master
            </h1>
            <p className="text-muted-foreground mt-2">
              Analyse prédictive basée sur l'historique et les motifs
            </p>
          </header>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="analytics">Toutes les Analyses</TabsTrigger>
            </TabsList>

            {/* Tab 1: History Only (Full Width) */}
            <TabsContent value="history" className="mt-6">
              <DrawsHistory />
            </TabsContent>

            {/* Tab 2: All Analytics + Predictions */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Predictions */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="text-xl font-bold mb-4">
                    Prédictions Prioritaires
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Les prédictions seront affichées ici basées sur l'analyse de
                    l'historique.
                  </p>
                </div>

                {/* Other Analytics */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 className="text-xl font-bold mb-4">Analyses Complètes</h3>
                  <p className="text-muted-foreground text-sm">
                    Hot/Cold Numbers, Patterns, Gaps, etc.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
