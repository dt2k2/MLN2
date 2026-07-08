import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/empty")({
  component: Empty,
});

function Empty() {
  return null;
}
