def get_random_users(count: int) -> list:
    """
    Generate and return a list of random user details.

    Args:
        count (int): The number of random users to generate.

    Returns:
        list: A list of dictionaries, each containing user details with the following keys:
            - name (str): The user's full name (first and last name).
            - email (str): The user's email address.
            - phone (str): The user's phone number.
    """
    import randomuser
    user_generator = randomuser.RandomUser()
    users = [user_generator.generate_users()[0] for _ in range(count)]

    user_list = []
    for user in users:
        user_details = {
            "name": f"{user['name']['first']} {user['name']['last']}",
            "email": user['email'],
            "phone": user['phone']
        }
        user_list.append(user_details)
    
    return user_list
