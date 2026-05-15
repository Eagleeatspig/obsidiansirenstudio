import { createFileRoute } from "@tanstack/react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CharacterPlanner } from "@/components/planning/CharacterPlanner";
import { CharacterCanvas } from "@/components/planning/CharacterCanvas";
import { WorldBuildingLab } from "@/components/planning/WorldBuildingLab";
import { FantasyMapBuilder } from "@/components/planning/FantasyMapBuilder";
import { StorylinePlanner } from "@/components/planning/StorylinePlanner";
import { ConflictArcPlanner } from "@/components/planning/ConflictArcPlanner";
import { WritingSuite } from "@/components/planning/WritingSuite";
import { SirensCallOverlay } from "@/components/SirensCallOverlay";
import { canStartNewProject, getActiveProjectId, startNewProject } from "@/lib/oneJourney";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning & Drafting — Obsidian Siren Studio" },
      { name: "description", content: "Plan characters, world, story arcs and draft your manuscript with audio dictation." },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const [sirenOpen, setSirenOpen] = useState(false);

  const onNewProject = () => {
    const id = `project-${Date.now()}`;
    if (!canStartNewProject(id)) {
      setSirenOpen(true);
      return;
    }
    startNewProject(id);
  };

  return (
    <StudioLayout title="Planning & Drafting">
      <SirensCallOverlay open={sirenOpen} onOpenChange={setSirenOpen} />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Window I</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">Planning & Drafting</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Everything you need to plan your story. From character planning to world building,
              you can build your entire story here.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current journey: <span className="text-silver">{getActiveProjectId() ?? "none yet"}</span>
            </p>
          </div>
          <Button variant="outline" className="border-silver" onClick={onNewProject}>
            <Plus className="h-4 w-4" /> New Book Project
          </Button>
        </div>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-card/50 p-1">
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="canvas">Relationship Canvas</TabsTrigger>
            <TabsTrigger value="world">World Building</TabsTrigger>
            <TabsTrigger value="map">Fantasy Map</TabsTrigger>
            <TabsTrigger value="storyline">Plot Points</TabsTrigger>
            <TabsTrigger value="conflict">Conflict & Arcs</TabsTrigger>
            <TabsTrigger value="write">Writing Suite</TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="mt-6"><CharacterPlanner /></TabsContent>
          <TabsContent value="canvas" className="mt-6"><CharacterCanvas /></TabsContent>
          <TabsContent value="world" className="mt-6"><WorldBuildingLab /></TabsContent>
          <TabsContent value="map" className="mt-6"><FantasyMapBuilder /></TabsContent>
          <TabsContent value="storyline" className="mt-6"><StorylinePlanner /></TabsContent>
          <TabsContent value="conflict" className="mt-6"><ConflictArcPlanner /></TabsContent>
          <TabsContent value="write" className="mt-6"><WritingSuite /></TabsContent>
        </Tabs>
      </div>
    </StudioLayout>
  );
}
