import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Certifications } from "@/components/sections/certifications";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import {
  getProfile,
  getExperiences,
  getProjects,
  getCertifications,
} from "@/lib/content";

export const revalidate = 60;

export default async function Home() {
  const [profile, experiences, projects, certifications] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getCertifications(),
  ]);

  return (
    <>
      <Nav name={profile.name} />
      <main>
        <Hero
          name={profile.name}
          title={profile.title}
          location={profile.location}
          tagline={profile.heroTagline}
          heroImageUrl={profile.heroImageUrl}
          yearsExperience={profile.yearsExperience}
          clientsServed={profile.clientsServed}
          projectsDone={profile.projectsDone}
          contactEmail={profile.contactEmail}
          calendlyUrl={profile.calendlyUrl}
        />
        <About bio={profile.bio} />
        <Experience items={experiences} />
        <Projects items={projects} />
        <Certifications items={certifications} />
        <Contact
          calendlyUrl={profile.calendlyUrl}
          linkedinUrl={profile.linkedinUrl}
          twitterUrl={profile.twitterUrl}
        />
      </main>
      <Footer name={profile.name} />
    </>
  );
}
