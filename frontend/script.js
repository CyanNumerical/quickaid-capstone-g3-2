 console.log("script.js is loaded successfully!");
 
 document.getElementById('ticketForm').onsubmit = async (e) => {
            e.preventDefault();
            const ticket = {
                email: document.getElementById('email').value,
                title: document.getElementById('title').value,
                category: document.getElementById('category').value,
                description: document.getElementById('description').value
            };
            const response = await fetch('https://quickaid-api-grp3.azurewebsites.net/api/submit_ticket', {    
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(ticket)
            });
            const result = await response.json();
            alert('Ticket ID: ' + result.id);
        };