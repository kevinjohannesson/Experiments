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

      <SubscribeToNewsletterForm />
    </>
  );
}
