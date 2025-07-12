import azure.functions as func
import json
import os
import uuid
from azure.cosmos import CosmosClient
import sendgrid
from sendgrid.helpers.mail import Mail

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        ticket = {
            "id": str(uuid.uuid4()),
            "title": data.get("title"),
            "email": data.get("email"),
            "category": data.get("category"),
            "description": data.get("description"),
            "status": "New"
        }
        # Save to Cosmos DB
        endpoint = os.environ["COSMOS_ENDPOINT"]
        key = os.environ["COSMOS_KEY"]
        client = CosmosClient(endpoint, key)
        db = client.get_database_client("QuickAidDB")
        container = db.get_container_client("Tickets")
        container.create_item(body=ticket)

        # Send email with SendGrid
        try:
            sg = sendgrid.SendGridAPIClient(api_key=os.environ['SENDGRID_API_KEY'])
            html_content = f"""
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Quickaid: New Ticket Submitted</h2>
                <p>Hi <b>{ticket['email']}</b>,</p>
                <p>We've received your ticket. Here's a summary:</p>
                <ul>
                    <li><strong>Ticket ID:</strong> {ticket['id']}</li>
                    <li><strong>Title:</strong> {ticket['title']}</li>
                    <li><strong>Category:</strong> {ticket['category']}</li>
                    <li><strong>Status:</strong> {ticket['status']}</li>
                </ul>
                <p>Use your email or ticket ID to track status on the <a href="https://proud-river-01c922200.1.azurestaticapps.net">QuickAid Portal</a>.</p>
            </div>
            """
            message = Mail(
                from_email='wafbwsh@gmail.com',  # Use your verified sender email
                to_emails=ticket["email"],
                subject='QuickAid Ticket Submitted',
                html_content=html_content #Use the defined HTML content
            )
            sg.send(message)
        except Exception as email_error:
            # You may want to log this or include it in the response (optional)
            print(f"Failed to send email: {email_error}")

        return func.HttpResponse(json.dumps({"message": "Ticket submitted", "id": ticket["id"]}),
                                 status_code=200,
                                 mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": "Internal server error", "details": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
