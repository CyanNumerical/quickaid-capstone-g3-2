import azure.functions as func
import json
import os
from azure.cosmos import CosmosClient

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        ticket_id = req.params.get("ticket_id")
        email = req.params.get("email")

        endpoint = os.environ["COSMOS_ENDPOINT"]
        key = os.environ["COSMOS_KEY"]
        client = CosmosClient(endpoint, key)
        db = client.get_database_client("QuickAidDB")
        container = db.get_container_client("Tickets")

        if ticket_id:
            query = f"SELECT * FROM Tickets t WHERE t.id = '{ticket_id}'"
        elif email:
            query = f"SELECT * FROM Tickets t WHERE t.email = '{email}'"
        else:
            query = "SELECT * FROM Tickets t"

        tickets = list(container.query_items(query=query, enable_cross_partition_query=True))

        if not tickets:
            if not ticket_id and not email:
                return func.HttpResponse(json.dumps({"message": "No tickets in the system yet."}),
                                         status_code=200, mimetype="application/json")
            else:
                return func.HttpResponse(json.dumps({"message": "No ticket found."}),
                                         status_code=404, mimetype="application/json")

        return func.HttpResponse(json.dumps(tickets), status_code=200, mimetype="application/json")

    except Exception as e:
        return func.HttpResponse(str(e), status_code=500)
