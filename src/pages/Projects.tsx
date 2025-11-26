import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { projectAPI } from "@/services/api";
import type { Project } from "@/types";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const canManageProjects =
    user?.role === Role.ADMIN || user?.role === Role.MANAGER;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getAll(user?.teamId || undefined);
      setProjects(response.data?.projects || []);
    } catch (error) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.teamId) {
      toast.error("You must be part of a team to create projects");
      return;
    }

    try {
      const response = await projectAPI.create({
        ...newProject,
        teamId: user.teamId,
      });
      setProjects([...projects, response.data!.project]);
      setIsDialogOpen(false);
      setNewProject({ name: "", description: "" });
      toast.success("Project created successfully");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectAPI.delete(id);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your team projects</p>
        </div>
        {canManageProjects && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="mt-2">
                    Created {formatDate(project.createdAt)}
                  </CardDescription>
                </div>
                {user?.role === Role.ADMIN && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(project._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            {project.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No projects yet. Create your first project!
          </p>
        </div>
      )}
    </div>
  );
}
