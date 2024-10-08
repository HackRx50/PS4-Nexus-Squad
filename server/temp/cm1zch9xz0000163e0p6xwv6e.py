def dns_lookup(domain: str):
    """
    Looks up DNS records for a given domain using the API Ninjas DNS Lookup API.
    
    This function sends a GET request to the API Ninjas DNS Lookup service with the provided domain name
    and retrieves the DNS records associated with it.
    
    Args:
        domain (str): The domain name for which to retrieve DNS records.
    
    Returns:
        str: The DNS records of the specified domain in text format if the request is successful.
        If the request fails, an error message and the response status code are printed.
    
    Raises:
        None: The function does not explicitly raise exceptions but will print error details if the request fails.
    """
    import requests
    
    api_url = 'https://api.api-ninjas.com/v1/dnslookup?domain={}'.format(domain)
    response = requests.get(api_url, headers={'X-Api-Key': 'xcLLDR96ebzrnjNcKFyf4WT5qHsOakdYdzTBLkYu'})
    if response.status_code == requests.codes.ok:
        return response.text
    else:
        print("Error:", response.status_code, response.text)
