import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/covers")({
  component: () => (
    <StubPage
      title="AI Cover Design"
      description="Are you a digital art expert or do you have an idea you want to create? Use our AI cover generator or design from scratch."
    />
  ),
});
