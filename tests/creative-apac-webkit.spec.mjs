import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const leafletJs=fs.readFileSync('node_modules/leaflet/dist/leaflet.js','utf8');
const leafletCss=fs.readFileSync('node_modules/leaflet/dist/leaflet.css','utf8');
const jszipJs=fs.readFileSync('node_modules/jszip/dist/jszip.min.js','utf8');

const csv=`title,lat,lng,nextlab-layer\n既存入口,35.6810000,139.7666000,existing-pokestop\n新規広場,35.6810000,139.7669000,new-pokestop\n`;

test.beforeEach(async({page})=>{
  await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',route=>route.fulfill({status:200,contentType:'text/css',body:leafletCss}));
  await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:leafletJs}));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:jszipJs}));
  await page.route(/https:\/\/[^/]+\.tile\.openstreetmap\.org\/.*/,route=>route.fulfill({status:204,body:''}));
  await page.route(/https:\/\/server\.arcgisonline\.com\/.*/,route=>route.fulfill({status:204,body:''}));
});

test('iPhone WebKitで現行機能とAPAC設計チェックを共存させる',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('/creative/index.html');
  await expect(page.locator('#startButton')).toBeVisible({timeout:10000});
  await page.locator('#entryFile').setInputFiles({name:'apac.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
  await expect(page.locator('#startButton')).toBeEnabled();
  await page.locator('#startButton').click();
  await expect(page.locator('#entry')).toBeHidden();

  await page.locator('#circleButton').click();
  await expect(page.locator('#apacCreativeGuide')).toBeVisible();
  await expect(page.locator('#apacCreativeCount')).toHaveText('1 / 25');
  await expect(page.locator('#apacCreativeUnder50')).toHaveText('1');
  await expect(page.locator('#apacCreativeGuide')).toContainText('50m未満は自動NGにせず要確認');

  await expect(page.locator('#toolbox')).toBeVisible();
  await expect(page.locator('#locate')).toBeVisible();
  await expect(page.locator('#undo')).toBeVisible();
  await expect(page.locator('#redo')).toBeVisible();
  await expect(page.locator('#save')).toBeVisible();
  expect(errors).toEqual([]);
});

test('50m未満コメント未確認では提出用ZIPを生成しない',async({page})=>{
  await page.goto('/creative/index.html');
  await page.locator('#entryFile').setInputFiles({name:'apac.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
  await page.locator('#startButton').click();
  await expect(page.locator('#entry')).toBeHidden();
  await page.locator('#save').click();
  await expect(page.locator('#status')).toContainText('50m未満の申請時コメントを確認してください');
});
