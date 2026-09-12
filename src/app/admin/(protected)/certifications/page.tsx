import { getCertifications } from "@/lib/content";
import { CertificationsManager } from "@/components/admin/certifications-manager";

function toDateInput(d: Date | null) {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export default async function AdminCertificationsPage() {
  const certifications = await getCertifications();

  return (
    <CertificationsManager
      items={certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: toDateInput(c.issueDate),
        credentialUrl: c.credentialUrl,
        order: c.order,
      }))}
    />
  );
}
