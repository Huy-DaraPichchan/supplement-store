import SettingsPanel from "@/components/SettingsPanel";
import { getAdminSettings } from "@/lib/admin";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  return <SettingsPanel settings={settings} />;
}
