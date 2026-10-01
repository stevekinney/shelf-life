import { expect, test } from "@playwright/test"

/* Warm-up */
test("add a shelf button", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByRole('button', { name: /add to shelf/i })).toBeVisible();
})


test("cancel button", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
})

test("disabled \"Out of stock\"", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByRole("button", {name: /out of stock/i })).toBeDisabled()
})


test("search input by label", async ({ page }) => {
  await page.goto("/playground");
  await expect(page.getByLabel("Search")).toBeVisible()
})

/* Intermediate */

test("get second \"delete\" button", async ({ page }) => {
  await page.goto("/playground")
  await expect(page.getByRole("button", { name: /delete/i }).nth(1)).toBeVisible()
})

test("Remove in the third list item", async ({ page }) => {
  await page.goto("/playground");
  const list = page.getByRole("list", {name: /reading list/i });
  await expect(list.getByRole("listitem").nth(2).getByRole("button", {name: /remove/i})).toBeVisible()
})

test("\"Rate this book\" inside the Piranese article", async ({ page }) => {
  await page.goto("/playground");
  const list = page.getByRole("article", {name: /piranesi/i });
  await expect(list.getByRole("button", {name: /rate this book/i})).toBeVisible()
})
