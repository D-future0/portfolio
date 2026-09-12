import { getProjects } from "@/lib/content";
import { ProjectsManager } from "@/components/admin/projects-manager";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsManager
      items={projects.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        description: p.description,
        client: p.client,
        imageUrl: p.imageUrl,
        tags: p.tags,
        order: p.order,
      }))}
    />
  );
}
