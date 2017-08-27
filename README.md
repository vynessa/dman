# dman
dman is a full stack document management system which uses roles and priviledges to categorize documents. To access any document you must have access rights and you must have a role. The document are also arranged based on date created.

[![Code Climate](https://codeclimate.com/github/vynessa/dman/badges/gpa.svg)](https://codeclimate.com/github/dman)
[![Travis Build](https://img.shields.io/travis/vynessa/dman/develop.svg)](https://travis-ci.org/vynessa/dman)
[![Coverage Status](https://coveralls.io/repos/github/vynessa/dman/badge.svg?branch=develop)](https://coveralls.io/github/vynessa/dman?branch=develop)

## Introduction
dman is a full stack document management system which uses roles and priviledges to categorize documents. To access any document you must have access rights and you must have a role. The documents are also arranged based on date created.

### Dependencies
* **[Node JS](https://nodejs.org/en/)** - Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. 
* **[Postgresql](https://www.postgresql.org/)** - 
* **[Express](https://expressjs.com/)** - Express is a minimal and flexible Node.js web application framework, It is used as the web server.
* **[Gulp](https://www.npmjs.com/package/gulp)** - Gulp is a task runner which helps in automating time-consuming tasks in your development workflow.
* **[Sequelize](https://www.npmjs.com/package/sequelize)** - Sequelize is a promise-based Node.js ORM for Postgres, MySQL, SQLite and Microsoft SQL Server. It features solid transaction support, relations, read replication and more
* **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - It was used for user authriaztion and authentication
* **[supertest](https://www.npmjs.com/package/supertest)** - Supertest is a framework used in testing API endpoints


### Features
<ul>
<li>Users can view documents based on access rights</li>
<li>Users can search for documents based on access rights</li>
<li>Users can create documents and specify rights</li>
<li>Users can edit document based on priviledges and access rights</li>
<li>Users can delete documents</li>
<li> Admin Users can create users</li>
<li> Admin Users can delete any user's profile</li>
</ul>


## Getting started with the project
* Visit the [Wiki](https://github.com/vynessa/dman/wiki/Getting-Started-with-the-Project) to find out how to make use of this project.

## API Documentation
The API has routes, each dedicated to a single task that uses HTTP response codes to indicate request success or errors. The full documentation can be found [here](https://dman.herokuapp.com)

## Naming conventions
* Visit the [Wiki](https://github.com/vynessa/dman/wiki) to find branch, commit messages and pull request naming conventions.

## Contributing to the project
* Fork this repository to your github account
* Clone the repository -  `git clone https://github.com/vynessa/dman.git`
* Create your feature branch - `git checkout -b your-branch-name`
* Commit your changes - `git commit -m “[Enter message]“` or `git commit` for the interactive interface
* Push to the remote branch - `git push origin your-branch-name`
* Open a pull request (See [wiki](https://github.com/vynessa/dman/wiki/Pull-Request-Naming-and-Description-Convention) for pull request(s) naming convention)

Click this link to visit the hosted app [dman](https://dman.herokuapp.com)

I look forward to your pull requests :)

## License
[MIT License](https://github.com/vynessa/dman/blob/develop/LICENSE)

## Author
* **[Vanessa Ejikeme](vanessa.ejikeme@gmail.com)**