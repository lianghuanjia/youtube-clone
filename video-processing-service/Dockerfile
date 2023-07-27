# Docker file ---blue print--> Docker Image --blue print--> Container --runs--> Our code
# Use an official Node runtime as a base image
# Linux OS + node
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Run the command line to install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy pckage.json and package-lock.json into the working directory
COPY package*.json ./


# Install any needed packages specified in package.json
RUN npm install

# Copy app source inside the docker image
COPY . . 

# Make port 3000 available outside this container
EXPOSE 3000

# CMD only run once when container runs, but runs can have many. So we define multiple RUNs above and one CMD below.
# NOTE: Usage of double quotes: In a JSON array used in a Dockerfile, elements are separated by commas, and the whole 
# array is enclosed in square brackets [...]. Each element (e.g., "npm", "start") must be enclosed in double quotes, NOT SINGLE QUOTES!.
CMD ["npm", "start"]


