import { test } from '@playwright/test';

test('PHRMA: Medicare AMI', async ({ page }) => {
  await page.goto('/exploredata?mls=1.medicare_cardiovascular-3.12&group1=85PLUS&dt1=medicare_ami&demo=age');
  await page.locator('#rate-map').getByRole('heading', { name: 'Rates of Acute MI in Florida' }).click();
  await page.getByRole('heading', { name: 'Medicare Beneficiaries diagnosed with AMI, Ages 85+' }).click();
  await page.getByLabel('Legend for rate map').getByRole('img').click();
  await page.locator('li').filter({ hasText: 'Total population of Medicare Beneficiaries diagnosed with AMI, Ages 18+:' }).click();
  await page.locator('#rate-chart').getByText('Medicare Administrative Data (data from 2020) ').click();
  await page.locator('#unknown-demographic-map').getByRole('note').click();
  await page.getByRole('button', { name: 'Population vs. distribution' }).click();
  await page.getByLabel('Comparison bar chart showing').getByRole('img').click();
  await page.getByRole('heading', { name: 'Breakdown summary for acute' }).click();
  await page.getByRole('figure', { name: 'Breakdown summary for acute' }).locator('h4').click();
  await page.getByRole('columnheader', { name: 'Age' }).click();
  await page.getByRole('columnheader', { name: 'Medicare beneficiary acute MI' }).click();
  await page.getByRole('columnheader', { name: 'Share of total beneficiary' }).click();
  await page.getByRole('columnheader', { name: 'Share of all beneficiaries' }).click();
  await page.getByRole('heading', { name: 'Definitions:' }).click();
  await page.getByText('Medication Utilization in the').click();
  await page.getByText('Acute Myocardial Infarctions (Heart Attacks)', { exact: true }).click();
  await page.getByRole('heading', { name: 'Medicare Administration Data' }).click();
  await page.getByText('What demographic data are').click();
  await page.getByText('Gender:').click();
  await page.getByText('Gender: The Medicare source').click();
  await page.getByText('Sexual Orientation:').click();
  await page.getByText('Sexual Orientation: The').click();
  await page.getByText('Disability:').click();
  await page.getByText('Disability: Although').click();
  await page.getByText('Social and Political').click();
  await page.getByText('Social and Political Determinants of Health: Unfortunately, there are crucial').click();
  await page.getByText('Who is missing?').click();
  await page.getByText('Data Suppression').click();
  await page.getByRole('combobox', { name: 'Demographic Age' }).click();
});