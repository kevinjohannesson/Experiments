import { FormComponent__001, FormComponent__002 } from "@/features/form";
import { Paper, Stack, Title } from "@mantine/core";

export default async function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Stack gap="8">
          <Paper p="4">
            <Title>FormComponent__001</Title>
            <FormComponent__001 />
          </Paper>
          <Paper p="4">
            <Title>FormComponent__002</Title>
            <FormComponent__002 />
          </Paper>
        </Stack>
      </main>
    </div>
  );
}
