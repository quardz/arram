import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JoinFlow from "@/components/JoinFlow";
import { Ornament } from "@/components/ui";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Join the Aram Valartha Naayaki Sevai Maiyam community. Register with your mobile number and start contributing to the seva.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ referral?: string }>;
}) {
  const { referral } = await searchParams;

  return (
    <>
      <PageHeader
        title="Join Us"
        subtitle="Become a part of our growing community of volunteers and well-wishers."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="mb-10 text-center">
          <Ornament className="mb-5" />
          <p className="leading-relaxed text-ink/80">
            Aram Valartha Naayaki Sevai Maiyam is a movement of volunteers working
            to reclaim and restore our Bharatheeya way of life. By joining, you
            become part of a community reviving our temples, customs and festivals
            across Tamil Nadu. Register below with your mobile number — you will
            receive an OTP to verify, and your own referral code to invite others.
          </p>
        </div>

        <JoinFlow urlReferral={referral} />
      </section>
    </>
  );
}
