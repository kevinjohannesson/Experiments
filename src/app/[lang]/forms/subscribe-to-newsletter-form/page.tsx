import SubscribeToNewsletterForm from "@/features/forms/subscribe-to-newsletter-form";
import { Title } from "@mantine/core";
import { Locale } from "~/i18n-config";

export default async function Page(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  return (
    <>
      <Title>Subscribe to newsletter form</Title>

      <Title order={2}>Default</Title>

      <SubscribeToNewsletterForm />

      <Title order={2}>Without ToS agreement</Title>

      <SubscribeToNewsletterForm />
    </>
  );
}
