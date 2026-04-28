import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        let logs = [];
        page.on('console', msg => logs.push(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', error => logs.push(`[PAGE_ERROR] ${error.message}`));
        page.on('requestfailed', request => logs.push(`[NETWORK_ERROR] ${request.url()} failed: ${request.failure()?.errorText}`));

        console.log('Navigating to frontend...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        console.log('Typing topic...');
        await page.type('#topic', 'Epidemiology of Road Traffic Injuries and Fatalities in Urban Communities of Southwest Nigeria');
        
        console.log('Typing keywords...');
        await page.type('#keywords', 'road traffic injuries, fatalities, urban, epidemiology, Southwest');
        
        console.log('Selecting category...');
        await page.select('#category', 'Epidemiology');

        console.log('Waiting exactly 1 second for react state to settle...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Clicking check similarity...');
        // Wait for button to be enabled (it could take a moment for validation)
        await page.waitForFunction(() => {
            const btn = document.querySelector('button[type="submit"]');
            return btn && !btn.disabled;
        }, { timeout: 5000 });

        await page.click('button[type="submit"]');

        console.log('Waiting for network/results...');
        // We expect the result or an error to appear
        try {
            await page.waitForSelector('[data-testid="results-container"], [data-testid="error-display"]', { timeout: 35000 });
            console.log('Found Results Container or Error Display!');
            
            const resultsHTML = await page.$eval('[data-testid="results-container"]', el => el ? el.innerHTML.slice(0, 500) : 'none')
              .catch(() => 'No results container');
            console.log('Results content top snippet:', resultsHTML);

        } catch (e) {
            console.log('Timeout waiting for results/error.');
        }

        console.log('========= BROWSER LOGS =========');
        logs.forEach(l => console.log(l));
        
        const bodyContent = await page.evaluate(() => document.body.innerHTML);
        if (bodyContent.includes('Awaiting submission')) {
          console.log('Still showing Awaiting submission!');
        }
        
        await browser.close();
    } catch(err) {
        console.error('Test failed:', err);
    }
})();
