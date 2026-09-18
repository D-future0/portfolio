import { getAllTenants } from "@/lib/content";
import { TenantsManager } from "@/components/admin/tenants-manager";

export const revalidate = 0;

export default async function AdminTenantsPage() {
  const tenants = await getAllTenants();
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink">Tenants</h1>
      </div>
      <TenantsManager tenants={tenants} />
    </div>
  );
}