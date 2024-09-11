#!/bin/bash

# Check if at least one package is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <package1> <package2> ... <packageN>"
    exit 1
fi

# Loop through all the provided arguments (packages)
for package in "$@"
do
    # Install the package
    pip install "$package"
    
    # Append the installed package and its version to requirements.txt
    pip freeze | grep "$package" >> requirements.txt
    
    echo "$package has been installed and added to requirements.txt"
done