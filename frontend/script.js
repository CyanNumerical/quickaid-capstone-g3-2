 console.log("script.js is loaded successfully!");
 
 document.getElementById('ticketForm').onsubmit = async (e) => {
    e.preventDefault();

    const messageEl = document.getElementById('message'); 
    const form = document.getElementById('ticketForm');

    const ticket = {
        email: document.getElementById('email').value,
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value
    };
    try {
        const res = await fetch('/api/submit_ticket', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticket)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            messageEl.style.color = "green";
            messageEl.textContent = 'Ticket submitted! ID: ${result.id}';
            form.reset();
        } else {
            throw new Error(result.error || "Something went wrong");
        }
    } catch (err) {
        messageEl.style.color = "red";
        messageEl.textContent =  'Error: ${err.message}';
    }
};