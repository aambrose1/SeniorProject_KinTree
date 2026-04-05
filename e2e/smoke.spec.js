import { test, expect } from '@playwright/test';

test.describe('Client/Server Smoke Tests', () => {
  
  test('React frontend is running and accessible', async ({ page }) => {
    // Navigates to http://localhost:3000/ 
    await page.goto('/');
    
    await expect(page).toHaveTitle(/KinTree/i); 
  });

  test('Express backend API is reachable', async ({ request }) => {
    // Ping the backend directly on port 5000 to ensure the Express server is up
    const response = await request.get('http://localhost:5000/');
    
    expect(response.ok()).toBeTruthy(); 
  });

});