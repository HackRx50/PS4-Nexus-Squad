import randomuser

def get_random_users(count: int) -> list:
    """
    Generate and return a list of random user details.

    Args:
        count (int): The number of random users to generate.

    Returns:
        list: A list of dictionaries with user details (name, email, phone, etc.).
    """
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

# Example usage:
random_users = get_random_users(5)
print(random_users)
