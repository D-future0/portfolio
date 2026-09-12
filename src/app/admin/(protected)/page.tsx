import { getProfile } from "@/lib/content";
import { ProfileForm } from "@/components/admin/profile-form";

export default async function AdminHomePage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl italic text-ink">
        Profile &amp; hero
      </h1>
      <ProfileForm
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
    </div>
  );
}
