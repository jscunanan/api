Project Title
Randomised Question Picker

Getting Started
Download this source code copy to your local machine.

Prerequisites
You will need to install the following.
1. Download and install NodeJS from https://nodejs.org/en/download/
2. Download and install MySQL from https://dev.mysql.com/downloads/mysql/

After installing Nodejs, Open "Node.js command prompt"
From the command prompt navigate to where you have copied the source code

type in the prompt:
npm install --save mysql express
npm install body-parser


Running the tests
1. on the commnd prompt type in
node api1.js

2. Open browser, on the addess bar type in:
Adding Questions:
http://localhost:3000/form1.html
From here you can key in the Questions, Tags and weightage of each questions.

Searching for questions using tags, use the link below
http://localhost:3000/urtags?tags=physics&tags=science
The result will be shown on the browser

Picking the Quiz ID, use the link below
http://localhost:3000/quiz.html

