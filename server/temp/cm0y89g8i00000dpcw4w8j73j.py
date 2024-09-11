
def get_geocoding(city):
    """
    Get the latitude and longitude geocoding of a city and country

    Args:
        city (str): The city name

    Returns:
        list: The latitude and longitude of the related city name
    """


    import requests
    api_url = 'https://api.api-ninjas.com/v1/geocoding?city={}'.format(city)
    response = requests.get(api_url + city, headers={'X-Api-Key': "meaUO1Ucu4ZTlk7qtQMibA==cpyHoWVnOLLm6QW2"})
    if response.status_code == requests.codes.ok:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
