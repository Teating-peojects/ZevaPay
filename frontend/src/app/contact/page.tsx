import type { Metadata } from "next";
import { StaticPage } from "@/components/marketing/static-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the ZevaPay team.",
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      intro="Questions about pairing a device, connecting a payment account, or using the dashboard? These are the details for reaching us."
      sections={[
        {
          heading: "Email",
          body: "Write to support@zevapay.com and include the business name on your account plus a short description of the problem. For device pairing issues, it helps to include the Android version and the device ID shown in the dashboard.",
        },
        {
          heading: "Support hours",
          body: "Support is available Monday to Saturday, 9:00 AM to 8:00 PM Bangladesh Standard Time (UTC+6). Anything sent outside those hours is picked up the next working day.",
        },
        {
          heading: "Before you write",
          body: "Most questions are answered on the How It Works section of the home page, which walks through connecting a payment account, pairing an Android device, and reviewing recorded transactions. Checking there first is usually faster.",
        },
        {
          heading: "About this page",
          body: "This page lists the details for reaching the ZevaPay team. It is not connected to a ticketing system, so messages sent from here would not reach anyone.",
        },
      ]}
    />
  );
}
