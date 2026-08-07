async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/bills');
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}
testApi();
