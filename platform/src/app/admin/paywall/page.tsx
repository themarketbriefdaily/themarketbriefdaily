import { PageHeader } from "@/components/admin/admin-ui";
import { PaywallEditor } from "@/components/admin/paywall-editor";

export default function AdminPaywallPage() {
  return (
    <div>
      <PageHeader
        title="Paywall rules"
        description="Set the minimum tier required for each section of the site. The PaywallGate reads these to decide what to show — change a section to Free to open it, or Professional / Institutional to gate it."
      />
      <PaywallEditor />
    </div>
  );
}
