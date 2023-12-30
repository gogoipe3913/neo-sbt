export async function fetchGETWithRetryAsync(url, maxRetries = 2) {
    let lastError = "";
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return [true, await response.json()];
            }
        } catch (error) {
            console.log("fetchGETWithRetry retry:", i + 1);
            lastError = error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return [false, lastError];
}

export async function fetchPOSTWithRetryAsync(url, data, maxRetries = 3) {
    let lastError = "";
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                return [true, await response.json()];
            }
        } catch (error) {
            console.log("fetchPOSTWithRetry retry:", i + 1);
            lastError = error;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return [false, lastError];
}
