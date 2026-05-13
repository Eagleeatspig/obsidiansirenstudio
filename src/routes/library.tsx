import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/StubPage";

export const Route = createFileRoute("/library")({
  component: () => (
    <StubPage title="My Library" description="Your manuscripts and projects, all in one place." />
  ),
});
