 console.log("script.js is loaded successfully!");
 
 //Handle tikcet submission
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
      alert('Ticket submitted successfully!')
      form.reset();
    } else {
      throw new Error(result.error || "Something went wrong");
    }
  } catch (err) {
    messageEl.style.color = "red";
    messageEl.textContent = `Error: ${err.message}`;;
  }
};

// Handle view ticket

document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const ticketId = document.getElementById('ticket_id').value.trim();
  const email = document.getElementById('search_email').value.trim();
  
  const params = new URLSearchParams();
  if (ticketId) params.append('ticket_id', ticketId);
  if (email) params.append('email', email);
  
  // ✅ ADD THESE TWO LINES BELOW
  console.log("Searching with", ticketId, email);
  console.log("Calling:", `/api/get_tickets?${params.toString()}`);
  
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Loading...';
  
  try {
    const res = await fetch(`/api/get_tickets?${params.toString()}`);
    const data = await res.json();
    
    if (res.ok) {
      if (Array.isArray(data)) {
        // One or more tickets returned
        resultDiv.innerHTML = '<h3>Found Ticket(s)</h3>' + data.map(ticket => `
            <div>
              <p><strong>ID:</strong> ${ticket.id}</p>
              <p><strong>Status:</strong> ${ticket.status}</p>
              <p>${ticket.description}</p>
            </div>
          `).join('<hr>');
        } else {
          // Message like "No tickets in the system yet"
          resultDiv.innerHTML = `<p>${data.message}</p>`;
        }
      } else {
        // 404: No ticket found
        resultDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
      }
      
    } catch (err) {
      resultDiv.innerHTML = `<p style="color: red;">Error fetching ticket(s): ${err.message}</p>`;
    }
  });
  