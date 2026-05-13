import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/planning")({
  component: () => (
    <StubPage
      title="Planning & Drafting"
      description="Everything you need to plan your story. From character planning to world building, you can build your entire story here."
    />
  ),
});
