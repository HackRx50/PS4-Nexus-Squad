def check_eligibility(mobile: str):
    """
    Sends a POST request to check the eligibility of a lead using the provided mobile number.

    Args:
        mobile (str): The customer's mobile number.

    Returns:
        str: A message indicating whether the lead is eligible or an error message if the request fails.
    """
    import requests

    # Define API URL
    api_url = "https://hackrx-ps4.vercel.app/eligibility-check"
    
    # Payload with the mobile number
    payload = {
        "mobile": mobile  # JSON body containing the mobile number
    }

    headers = {
        "accept": "application/json",
        "team": "Nexus_squad",  # Example team header, adjust based on actual use
        "Content-Type": "application/json"
    }

    try:
        # Send POST request with headers and JSON body
        response = requests.post(api_url, headers=headers, json=payload)

        # Handle successful response
        if response.status_code == 200:
            try:
                data = response.json()
            except ValueError:
                return "Error: Failed to decode JSON response."

            # Check if the lead is eligible
            if data.get("eligible"):
                return f"Lead with mobile {mobile} is eligible."
            else:
                return f"Lead with mobile {mobile} is not eligible."

        # Handle server error (500) or unexpected issues
        elif response.status_code == 500:
            return f"Server error: {response.status_code}. Message: {response.text}"

        # Handle other status codes
        elif response.status_code == 400:
            return "Error: Bad request. Please check the mobile number format."
        elif response.sta
