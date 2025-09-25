# About KinTree

This repository contains the codebase for the KinTree project. This project stems from the CSE 3213/3223 Software Engineering Senior Project I/II course sequence at Mississippi State University.

KinTree is an application that allows users to connect with family members and build virtual, visualized, and dynamic family trees collaboratively. KinTree utilizes React, Node.js, and MySQL. This project originated in [Fall 2024](https://github.com/OwenAdams2023/SeniorProject_KinTree#). The project is ongoing through this forked repository in Fall 2025.

The current KinTree project team as of Fall 2025 includes Andrea Ambrose, Matthew Loyed, Xiang Chen, and Charles Lenson. The primary stakeholder for this project is Dr. Charan Gudla.

# Install

### Prerequisites

Node.js (install the correct version for your own OS [here](https://nodejs.org/en)) and install MySQL [here](https://dev.mysql.com/downloads/installer/). Set up account information through the Configurator application or through the terminal.

### Setup

To set up the KinTree codebase on your own machine, start by cloning the repository to your local file system.

From the command line, navigate to the /SeniorProject_KinTree/client directory, and run:

`npm install`

Once all dependencies are installed, you can run the frontend of the project from the /SeniorProject_KinTree/client directory by running the following command:

`npm start`

This command runs the application in development mode. You can open http://localhost:3000 in your browser to view the application and saved changes.

To run the backend, you must first install the backend node dependencies. Open another command line window and run the following command in the backend directory (/SeniorProject_KinTree/server):

`npm install`

Then, from the same directory, run the following command to run the server/API:

`node server.js`

### Database Setup

Open the MySQL Client Terminal, login with your password to run the mySQL server.

Create a new database instance on your machine:
`CREATE DATABASE <name>`

Create a .env file with MySQL information. Example env is in the project's root folder.

Open another command line window in /SeniorProject_KinTree/server/ and run the command `npm install knex mysql2` to install Knex and mySQL2.

Verify the connection:

`node mysql-connection.js` 

Ensure proper migration files are loaded:

`npx knex:migrate status`

Run the command `npx knex migrate:latest` to create and/or update existing database tables.

