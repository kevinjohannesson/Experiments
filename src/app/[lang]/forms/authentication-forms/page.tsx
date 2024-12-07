import BasicSubscribeToNewsletterForm from "@/features/forms/log-in/basic-log-in-form";
import { Title } from "@mantine/core";
import { Locale } from "~/i18n-config";

export default async function Page(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  return (
    <>
      <Title>Authentication forms</Title>

      <BasicSubscribeToNewsletterForm />
    </>
  );
}
