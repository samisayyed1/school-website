import { requireProfile, ROLE_LABEL } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const profile = await requireProfile();
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="My profile" subtitle={`${ROLE_LABEL[profile.role]} · ${profile.email ?? ""}`} />
      <ProfileForm
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        notificationEmail={profile.notification_email}
        notificationPhone={profile.notification_phone}
      />
    </div>
  );
}
