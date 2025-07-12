console.log("script.js is loaded successfully!");

// Reusable function to render a table from ticket data
function renderTicketTable(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return `<p>No tickets found.</p>`;
    }

    return `
    <table class="table table-bordered table-hover mt-3">
        <thead class="table-dark">
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
            ${data.map(ticket => `
                <tr>
                    <td>${ticket.id}</td>
                    <td>${ticket.email}</td>
                    <td>${ticket.title}</td>
                    <td>${ticket.category}</td>
                    <td>${ticket.status}</td>
                    <td>${ticket.description}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

// Ticket submission
document.getElementById('ticketForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageEl = document.getElementById('message');
    const form = document.getElementById('ticketForm');
    const spinner = document.getElementById('submitSpinner');
    spinner.style.display = 'inline-block'; // Show spinner

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
            form.reset();
            loadAllTickets();

            // Show success toast
            const toastEl = document.getElementById('successToast');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();

            // Set and show modal message
            document.getElementById('modalEmail').textContent = ticket.email;
            const modal = new bootstrap.Modal(document.getElementById('successModal'));
            modal.show();
        } else {
            throw new Error(result.error || "Something went wrong");
        }

    } catch (err) {
        if (messageEl) {
            messageEl.style.color = "red";
            messageEl.textContent = `Error: ${err.message}`;
        }
    } finally {
        spinner.style.display = 'none'; // Hide spinner
    }
});

// Ticket search (by ticket ID OR email)
document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ticketId = document.getElementById('ticket_id').value.trim();
    const email = document.getElementById('search_email').value.trim();
    const resultDiv = document.getElementById('result');

    if (!ticketId && !email) {
        resultDiv.innerHTML = `<p style="color:red;">Please enter either a ticket ID or email.</p>`;
        return;
    }

    const params = new URLSearchParams();
    if (ticketId) params.append('ticket_id', ticketId);
    if (email) params.append('email', email);

    resultDiv.innerHTML = "Searching...";

    try {
        const res = await fetch(`/api/get_tickets?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
            resultDiv.innerHTML = renderTicketTable(data);
        } else {
            resultDiv.innerHTML = `<p style="color: red;">${data.message || "Unexpected response."}</p>`;
        }

    } catch (err) {
        resultDiv.innerHTML = `<p style="color: red;">Error fetching tickets: ${err.message}</p>`;
    }
});

// Load all tickets on page load or refresh
async function loadAllTickets() {
    const resultDiv = document.getElementById('result');
    if (!resultDiv) return;

    resultDiv.innerHTML = 'Loading all tickets...';

    try {
        const res = await fetch('/api/get_tickets');
        const data = await res.json();

        if (res.ok) {
            resultDiv.innerHTML = renderTicketTable(data);
        } else {
            resultDiv.innerHTML = `<p style="color:red;">${data.message || "Failed to load tickets."}</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = `<p style="color:red;">Error loading tickets: ${err.message}</p>`;
    }
}

window.onload = () => {
    loadAllTickets(); // ✅ Show all tickets on page load
};
