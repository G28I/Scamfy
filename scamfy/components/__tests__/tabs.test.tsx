// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Tabs component (UX-03)", () => {
  it("renders tab triggers and displays default active content and switches tabs", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content One")).toBeDefined();
    const tab2 = screen.getByRole("tab", { name: "Tab Two" });

    await user.click(tab2);

    expect(await screen.findByText("Content Two")).toBeDefined();
  });
});
