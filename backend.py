from flask import Flask, request, jsonify
from flask_cors import CORS
from simple_salesforce import Salesforce

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Salesforce credentials
sf = Salesforce(
    username="sairamtelagamsetti@sathkrutha.sandbox",  # Replace with your Salesforce username
    password="Sairam12345@",                          # Replace with your Salesforce password
    security_token="ZYaDg3Smv8Iw6PiiCW1e2Wlf",        # Replace with your Salesforce security token
    domain="test"                                     # Use "login" for production, "test" for sandbox
)

@app.route("/api/push", methods=["POST"])
def push_to_salesforce():
    """
    This endpoint receives extracted data from the frontend and stores it in Salesforce.
    """
    try:
        # Parse incoming JSON data
        data = request.json
        print("Received Data:", data)  # Log received data for debugging

        # Map incoming data to Salesforce fields
        salesforce_data = {
            "Product_Name__c": data.get("Product name", ""),
            "Colour__c": data.get("Colour", ""),
            "Motor_Type__c": data.get("Motor type", ""),
            "Frequency__c": data.get("Frequency", ""),
            "Gross_weight__c": data.get("Gross weight", ""),
            "Ratio__c": data.get("Ratio", ""),
            "Motor_Frame__c": data.get("Motor Frame", ""),
            "Model__c": data.get("Model", ""),
            "Quantity__c": data.get("Quantity", ""),
            "Voltage__c": data.get("Voltage", ""),
            "Material__c": data.get("Material", ""),
            "Horse_power__c": data.get("Horse power", ""),
            "Stage__c": data.get("Stage", ""),
            "GSTIN__c": data.get("GSTIN", ""),
            "Seller_Address__c": data.get("Seller Address", ""),
            "Manufacture_date__c": data.get("Manufacture date", ""),
            "Company_name__c": data.get("Company name", ""),
            "Customer_care_number__c": data.get("Customer care number", ""),
            "Total_amount__c": data.get("Total amount", ""),
            "Other_Specifications__c": data.get("Other Specifications", "")
        }

        # Create a new record in Salesforce
        response = sf.Seta_Product_Details__c.create(salesforce_data)
        print("Salesforce Response:", response)  # Log Salesforce response for debugging

        # Return success message
        return jsonify({"message": "Data stored in Salesforce successfully.", "id": response["id"]}), 200

    except Exception as e:
        # Log the error for debugging
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
