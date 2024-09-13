#!/bin/bash

# Check if at least one package is provided
if [ $# -eq 0 ]; then
    # Check if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        echo "No packages provided. Installing from requirements.txt..."
        pip install -r requirements.txt
        echo "Packages from requirements.txt have been installed."
    else
        echo "No arguments provided and requirements.txt not found."
        exit 1
    fi
else
    # Loop through all the provided arguments (packages)
    for package in "$@"
    do
        # Install the package
        pip install "$package"
        
        # Append the installed package and its version to requirements.txt
        pip freeze | grep "$package" >> requirements.txt
        
        echo "$package has been installed and added to requirements.txt"
    done
fi
