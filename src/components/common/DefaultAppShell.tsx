"use client";

import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode } from "react";

export default function DefaultAppShell({
  children,
}: {
  children?: ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      footer={{
        height: 60,
      }}
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer p="md">Footer</AppShell.Footer>
    </AppShell>
  );
}
