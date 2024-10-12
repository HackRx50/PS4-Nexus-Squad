def fetch_orders_by_mobile(mobile: str):
    """
    Fetches orders for a user based on the mobile number and returns a formatted string.

    Args:
        mobile (str): The customer's mobile number.

    Returns:
        str: A formatted list of the user's orders or an error message if the request fails.
    """
    import requests

    # Define API URL and query parameters
    api_url = "https://hackrx-ps4.vercel.app/orders"
    headers = {
        "accept": "application/json",
        "team": "Nexus_squad",  # Example team header
        "Content-Type": "application/json",
        "mobile": mobile
    }

    try:
        response = requests.get(api_url, headers=headers)

        # Handle successful response
        if response.status_code == 200:
            try:
                data = response.json()
                print(data)
                return data
            except ValueError:
                return "Error: Failed to decode JSON response."

            # Check if the response contains any orders
            if not data.get('orders'):
                return f"No orders found for mobile number: {mobile}"

            # Format and display orders
            formatted_orders = [f"Orders for Mobile: {mobile}\n"]
            for order in data['orders']:
                formatted_orders.append(
                    f" - Order ID: {order['id']}\n"
                    f"   Product Name: {order['productName']}\n"
                    f"   Product Price: {order['productPrice']} USD\n"
                    f"   Status: {order['status']}\n"
                    f"   Timestamp: {order['timestamp']}\n"
                    "----------------------\n"
                )

            return ''.join(formatted_orders)

        # Handle different status codes with specific messages
        elif response.status_code == 400:
            return "Error: Bad request. Please check the mobile number format."
        elif response.status_code == 404:
            return "Error: Orders not found for this mobile number."
        elif response.status_code == 500:
            return "Error: Server issue encountered while fetching orders."
        else:
            return f"Error: Unexpected response. Status Code: {response.status_code}"

    except requests.ConnectionError:
        return "Error: Failed to connect to the server. Please check your internet connection."
    except Exception as e:
        return f"Error: An unexpected error occurred - {str(e)}"

if __name__=="__main__":
    print(fetch_orders_by_mobile("1234567890"))