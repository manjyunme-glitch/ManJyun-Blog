import { expect, test } from "@playwright/test";

test("public home renders empty-state blog shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ManJyun Blog" })).toBeVisible();
  await expect(page.getByText("还没有发布文章")).toBeVisible();
});

