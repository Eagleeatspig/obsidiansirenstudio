import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/formatting")({
  component: () => (
    <StubPage
      title="Book Formatting"
      description="Do it yourself or get expert help. Use our self-formatting tool or assisted formatting services."
    />
  ),
});
