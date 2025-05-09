# About KinTree

This repository contains the codebase for the KinTree project. This project stems from the CSE 3213/3223 Software Engineering Senior Project I/II course sequence at Mississippi State University.

KinTree is an application that allows users to connect with family members and build virtual, visualized, and dynamic family trees collaboratively. This project began in the Fall of 2024 and is ongoing. KinTree utilizes React, Node.js, and MySQL.

The current KinTree project team as of Spring 2025 includes Owen Adams, Kennedi James, Destiny Milsap, and Jade Thompson. The primary stakeholder for this project is Dr. Charan Gudla.

# Install

### Prerequisites

Node.js (install the correct version for your own OS [here](https://nodejs.org/en))

### Setup

To set up the KinTree codebase on your own machine, start by cloning the repository to your local file system.

From the command line, navigate to the /SeniorProject_KinTree/client directory, and run:

`npm install`

Once all dependencies are installed, you can run the frontend of the project (from the /SeniorProject_KinTree/client directory) by running the following command:

`npm start`

This command runs the application in development mode. You can open http://localhost:3000 in your browser to view the application. Any changes made to the source code will cause the application page to refresh and show reflected changes (once the changed file is saved).

To run the backend of code (server/API), you must first install the backend node dependencies. Open another command line window and run the following command in the backend directory (/SeniorProject_KinTree/server):

`npm install`

Then, from the same directory, run the following command to run the server/API:

`node server.js`

Directions for database setup are in progress.

