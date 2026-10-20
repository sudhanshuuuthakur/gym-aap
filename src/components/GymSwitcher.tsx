import { useState } from "react";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface GymOption {
  id: string;
  name: string;
}

interface GymSwitcherProps {
  gyms: GymOption[];
  activeGymId: string;
  onSelect: (gymId: string) => void;
  onCreate: (name: string) => Promise<boolean>;
}

export function GymSwitcher({ gyms, activeGymId, onSelect, onCreate }: GymSwitcherProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const activeGym = gyms.find((gym) => gym.id === activeGymId) ?? gyms[0];

  const createGym = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || saving) return;
    setSaving(true);
    try {
      const created = await onCreate(trimmedName);
      if (created) {
        setName("");
        setCreateOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!activeGym) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 max-w-[min(60vw,15rem)] justify-start gap-2 rounded-full border-border bg-background px-3 text-foreground"
            aria-label={`Selected gym: ${activeGym.name}`}
          >
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-left">{activeGym.name}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          {gyms.map((gym) => (
            <DropdownMenuItem key={gym.id} onSelect={() => onSelect(gym.id)}>
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{gym.name}</span>
              {gym.id === activeGymId && <Check className="ml-2 h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create new gym
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a gym</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void createGym();
              }}
              maxLength={100}
              placeholder="Enter gym name"
              aria-label="Gym name"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={() => void createGym()} disabled={!name.trim() || saving}>
                {saving ? "Creating…" : "Create gym"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}