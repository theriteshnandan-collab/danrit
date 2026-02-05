
const API_URL = "https://pdf-jet-cyan.vercel.app/api/v1/pdf";
// PASTE YOUR KEY HERE
const API_KEY = process.argv[2];

if (!API_KEY) {
    console.error("❌ Error: Please provide your API Key.");
    console.log("Usage: node scripts/test-api.js <YOUR_KEY>");
    process.exit(1);
}

async function generatePDF() {
    console.log(`🚀 Sending Request to: ${API_URL}`);
    console.log(`🔑 Using Key: ${API_KEY.substring(0, 10)}...`);

    const payload = {
        html: "<h1>Hello World</h1><p>This is a test invoice from PDF-JET.</p>",
        filename: "test_invoice.pdf"
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // const data = await response.json(); // If returning JSON
            // For PDF response (streaming/blob), we might just get a 200 OK
            // Assuming your API currently returns the PDF bytes directly or a JSON with URL
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/pdf")) {
                console.log("✅ SUCCESS: PDF Generated successfully! (Binary data received)");
            } else {
                const data = await response.json();
                console.log("✅ SUCCESS:", data);
            }
        } else {
            const errorText = await response.text();
            console.error(`❌ FAILED: ${response.status} ${response.statusText}`);
            console.error("Response:", errorText);
        }
    } catch (error) {
        console.error("❌ NETWORKING ERROR:", error.message);
    }
}

generatePDF();
