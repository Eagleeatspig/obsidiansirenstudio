import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/experts")({
  component: () => (
    <StubPage
      title="Expert Services"
      description="Your book deserves to be perfect. Find proofreaders, developmental editors, and learn what to do with your finished manuscript."
    />
  ),
});
