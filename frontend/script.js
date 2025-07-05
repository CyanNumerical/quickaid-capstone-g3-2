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
      loadAllTickets(); // This line to refresh the list
    } else {
      throw new Error(result.error || "Something went wrong");
    }
  } catch (err) {
    messageEl.style.color = "red";
    messageEl.textContent = `Error: ${err.message}`;;
  }
};

// ---- Search Tickets ----
if (searchForm) {
  searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const ticketId = document.getElementById('ticket_id').value.trim();
    const email = document.getElementById('search_email').value.trim();
    const resultDiv = document.getElementById('result');

    const params = new URLSearchParams();
    if (ticketId) params.append('ticket_id', ticketId);
    if (email) params.append('email', email);

    console.log("Searching with", ticketId, email);
    console.log("Calling:", `/api/get_tickets?${params.toString()}`);

    resultDiv.innerHTML = 'Loading...';

    try {
      const res = await fetch(`/api/get_tickets?${params.toString()}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        let table = `
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
        `;

        if (data.length === 0) {
          table += `
            <tr>
              <td colspan="6" style="text-align: center;">No tickets available.</td>
            </tr>
          `;
        } else {
          table += data.map(ticket => `
            <tr>
              <td>${ticket.id}</td>
              <td>${ticket.email}</td>
              <td>${ticket.title}</td>
              <td>${ticket.category}</td>
              <td>${ticket.status}</td>
              <td>${ticket.description}</td>
            </tr>
          `).join('');
        }

        table += `</tbody></table>`;
        resultDiv.innerHTML = table;

      } else {
        resultDiv.innerHTML = `<p style="color: red;">${data.message || "Unexpected response."}</p>`;
      }

    } catch (err) {
      resultDiv.innerHTML = `<p style="color: red;">Error fetching tickets: ${err.message}</p>`;
    }
  });
}

async function loadAllTickets() {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Loading all tickets...';

  try {
    const res = await fetch('/api/get_tickets'); // No filters
    const data = await res.json();

    if (res.ok) {
      if (Array.isArray(data) && data.length > 0) {
        resultDiv.innerHTML = '<h3>All Tickets</h3><table border="1" cellpadding="5"><tr><th>ID</th><th>Email</th><th>Title</th><th>Status</th><th>Description</th></tr>' +
          data.map(ticket => `
            <tr>
              <td>${ticket.id}</td>
              <td>${ticket.email}</td>
              <td>${ticket.title}</td>
              <td>${ticket.status}</td>
              <td>${ticket.description}</td>
            </tr>
          `).join('') + '</table>';
      } else {
        resultDiv.innerHTML = '<p>No tickets in the system yet.</p>';
      }
    } else {
      resultDiv.innerHTML = `<p style="color:red;">${data.message}</p>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">Error loading tickets: ${err.message}</p>`;
  }
}

window.onload = () => {
  loadAllTickets(); // Load all tickets when the page loads
};