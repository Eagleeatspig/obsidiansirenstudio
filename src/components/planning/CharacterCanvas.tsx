import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

function CharacterNode({ data }: { data: { label: string } }) {
  return (
    <div className="rounded-xl border border-primary/40 bg-card/90 px-4 py-3 text-center shadow-[var(--shadow-siren)] backdrop-blur">
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="font-serif text-lg text-foreground">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

const nodeTypes = { character: CharacterNode };

const initialNodes: Node[] = [
  { id: "1", type: "character", position: { x: 100, y: 80 }, data: { label: "Protagonist" } },
  { id: "2", type: "character", position: { x: 400, y: 80 }, data: { label: "Antagonist" } },
  { id: "3", type: "character", position: { x: 250, y: 280 }, data: { label: "Mentor" } },
];
const initialEdges: Edge[] = [
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "oklch(0.72 0.18 305)" } },
];

export function CharacterCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback((c) => setNodes((n) => applyNodeChanges(c, n)), []);
  const onEdgesChange: OnEdgesChange = useCallback((c) => setEdges((e) => applyEdgeChanges(c, e)), []);
  const onConnect = useCallback(
    (c: Connection) => setEdges((e) => addEdge({ ...c, animated: true, style: { stroke: "oklch(0.72 0.18 305)" } }, e)),
    [],
  );

  const addCharacter = () => {
    const id = `${Date.now()}`;
    setNodes((n) => [
      ...n,
      {
        id,
        type: "character",
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: { label: `Character ${n.length + 1}` },
      },
    ]);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Drag handles to draw relationships. Double-click a node label to rename.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addCharacter}>
            <Plus className="h-4 w-4" /> Character
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </div>
      <div className="h-[560px] overflow-hidden rounded-xl border border-border/60 bg-card/30">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeDoubleClick={(_, node) => {
            const label = prompt("Rename character", node.data?.label as string) ?? (node.data?.label as string);
            setNodes((ns) => ns.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n)));
          }}
          fitView
          colorMode="dark"
        >
          <Background color="oklch(0.30 0.05 295)" />
          <MiniMap pannable zoomable className="!bg-background/80" />
          <Controls className="!bg-background/80 !border-border" />
        </ReactFlow>
      </div>
    </div>
  );
}
