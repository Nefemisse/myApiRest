// Imports
let bcrypt = require('bcrypt');
let jwtUtils = require('../utils/jwt.utils')
let models = require('../models');
const users = require('../models/users');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASWORD_REGEX = /^(?=.*\d).{4,18}$/

// Routes
module.exports = {
    register: (request, response) => {
console.log(request.body)
        // Parameters
        let lastName = request.body.lastName;
        let firstName = request.body.firstName;
        let email = request.body.email;
        let password = request.body.password;
        let role = request.body.role;

        if (lastName == null || firstName == null || email == null || password == null || role == null) {
            return response.status(400).json({'error': 'An error occured : Missing parameters'});
        }
        
        if (!EMAIL_REGEX.test(email)) {
            return response.status(400).json({'error': 'An error occured : email is not valid'})
        }

        if (!PASWORD_REGEX.test(password)) {
            return response.status(400).json({'error': 'An error occured : password invalid (must length 4 - 18 and include 1 number)'})
        }

        // Waterfall

        //

        models.users.findOne({
            attributes: ['email'],
            where: { email: email}
        })
        .then(function(userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                    let newUser = models.users.create({
                        lastName: lastName,
                        firstName: firstName,
                        email: email,
                        password: bcryptedPassword,
                        role: role
                    })
                    .then(function(newUser) {
                        return response.status(201).json({
                            'userId': newUser.id, 'sucess': 'User successfully created'
                        })
                    })
                    .catch(function(err) {
                        return response.status(400).json({'error': 'An error occured.'})
                    })
                })
            } else {
                return response.status(409).json({'error': 'user already exist.'})
            }
        })
        .catch(function(err) {
            return response.status(500).json({'error': 'unable to verify user'})
        })

    },
    update: (request, response) => {
        const id = request.params.id;
        let lastName = request.body.lastName;
        let firstName = request.body.firstName;
        let role = request.body.role;
        let email= request.body.email;

        models.users.update(request.params, {
            attributes: ['id', 'lastName', 'firstName', 'email', 'role'],
            where: { id: id }
          })
        .then(num => {
        if (num == 1) {
            response.status(200).send({
            message: "User was modified successfully."
            });
        } else {
            response.status(400).send({
            message: `An error occurred : cannot update user with id=${id}.`
            });
        }
        })
        .catch(err => {
        response.status(404).send({
            message: "User with id=" + id + " was not found"
        });
        });
      },
    delete: (request, response) => {
        // Parameters
        const id = request.params.id;
        models.users.destroy({
            where: { id: id }
        })
          .then(num => {
            if (num == 1) {
            response.status(400).send({
                message: "User successfully deleted"
              });
            } else {
                response.status(400).send({
                message: `An error occurred : cannot delete user with id=${id}.`
              });
            }
          })
          .catch(err => {
            response.status(404).send({
              message: "User with id=" + id + " was not found"
            });
          });
      },
    searchOne: (request, response) => {
        // Parameters
        const id = request.params.id;
        models.users.findByPk(id)
        .then(data => {
            if (data) {
                response.status(200).send(data);
            } else {
            response.status(400).send({
                message: `An error occurred : cannot delete user with id=${id}. Maybe user was not found!`
              });
            }
          })
          .catch(err => {
            response.status(400).send({
              message: "An error occurred : could not delete user with id=" + id
            });
          });
      },
    searchAll: (request, response) => {
        // Parameters
        models.users.findAll()
        .then(data => {
            if (data) {
                response.status(200).send(data);
            }
          })
          .catch(err => {
            response.status(400).send({
              message: "An error occurred : while retrieving users."
            });
          });
      },
    login: (request, response) => {

        // Parameters
        let email = request.body.email;
        let password = request.body.password;

        if (email == null || password == null) {
            return response.status(400).json({'error': 'missing parameters'})
        }

        models.users.findOne({
            where: { email: email}
        })
        .then(function(userFound) {
            if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    } else {
                        return res.status(403).json({'error': 'invalid password'})
                    }
                })
            } else {
                return response.status(404).json({'error': 'user not exist in DB'})
            }
        })
        .catch(function(err) {
            return response.status(500).json({'error': 'unable to verify user'})
        })
    }
}