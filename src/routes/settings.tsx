import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/settings")({
  component: () => (
    <StubPage title="Settings" description="Tune your studio to your craft." />
  ),
});
