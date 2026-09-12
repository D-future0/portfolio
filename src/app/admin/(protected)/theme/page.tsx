import { getProfile } from "@/lib/content";
import { ThemeForm } from "@/components/admin/theme-form";

export default async function AdminThemePage() {
  const profile = await getProfile();

  return (
    <ThemeForm
      profile={{
        name: profile.name,
        title: profile.title,
        heroTagline: profile.heroTagline,
        heroImageUrl: profile.heroImageUrl,
        bio: profile.bio,
        yearsExperience: profile.yearsExperience,
        clientsServed: profile.clientsServed,
        projectsDone: profile.projectsDone,
        contactEmail: profile.contactEmail,
        phone: profile.phone,
        location: profile.location,
        calendlyUrl: profile.calendlyUrl,
        linkedinUrl: profile.linkedinUrl,
        twitterUrl: profile.twitterUrl,
        resumeUrl: profile.resumeUrl,
        accentColor: profile.accentColor,
      }}
    />
  );
}
