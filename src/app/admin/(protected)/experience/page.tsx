import { getExperiences } from "@/lib/content";
import { ExperienceManager } from "@/components/admin/experience-manager";

function toDateInput(d: Date | null) {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export default async function AdminExperiencePage() {
  const experiences = await getExperiences();

  return (
    <ExperienceManager
      items={experiences.map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        startDate: toDateInput(e.startDate) ?? "",
        endDate: toDateInput(e.endDate),
        current: e.current,
        location: e.location,
        bullets: e.bullets,
        order: e.order,
      }))}
    />
  );
}
