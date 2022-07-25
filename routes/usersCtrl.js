// Imports
let bcrypt = require('bcrypt');
let jwtUtils = require('../utils/jwt.utils')
let models = require('../models')
let users = require('../models/users');
//const { response, request } = require('express');
const asyncLib = require('async');
//const { parseAuthorization } = require('../utils/jwt.utils');
//const env = require("dotenv").config();

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASWORD_REGEX = /^(?=.*\d).{4,18}$/

// Routes
// On exporte un objet dans lequel il y a plusieurs fonctions
module.exports = {
    register: (request, response) => {
//console.log(request.body)
        // Parameters
        let lastName = request.body.lastName;
        let firstName = request.body.firstName;
        let email = request.body.email;
        let password = request.body.password;
        let role = request.body.role;

        // Fields verification
        if (lastName == null || firstName == null || email == null || password == null) {
            return response.status(400).json({'error': 'An error occured : Missing parameters'});
        }
        
        if (!EMAIL_REGEX.test(email)) {
            return response.status(400).json({'error': 'An error occured : email is not valid'})
        }

        if (!PASWORD_REGEX.test(password)) {
            return response.status(400).json({'error': 'An error occured : password invalid (must length 4 - 18 and include 1 number)'})
        }

        // Waterfall
        asyncLib.waterfall([
            (done) => {
                models.users.findOne({
                    attributes: ['email'],
                    where: { email: email}
                })
                .then((userFound) => {
                    done(null, userFound);
                })
                .catch((err) => {
                    return response.status(400).json({'error': 'An error occured'});
                });
            },
            (userFound, done) => {
                if (!userFound) {
                    bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword);
                    });
                } else {
                    return response.status(409).json({'error': 'user already exist.'})
                }
            },
            (userFound, bcryptedPassword, done) => {
                let newUser = models.users.create({
                    lastName: lastName,
                    firstName: firstName,
                    email: email,
                    password: bcryptedPassword,
                    role: role
                })
                .then((newUser) => {
                    done(newUser);
                })
                .catch((err) => {
                    return response.status(500).json({'error': 'An error occurred : unable to verify user'})
                });
            }
        ],  
        (newUser) => {
            if(newUser) {
                return response.status(201).json({
                    'userId': newUser.id, 'sucess': 'User successfully created'
                })
            } else {
                return res.status(400).json({ 'error': 'An error occurred : user already exist.'})
            }
        }) 
        //
    },
    update: (request, response) => {
        const id = request.params.id;
        let lastName = request.body.lastName;
        let firstName = request.body.firstName;
        let email = request.body.email;
        let password = request.body.password
        asyncLib.waterfall([
            (done) => {
                models.users.findOne({
                    attributes: [ 'id', 'email', 'firstName', 'lastName', 'role', 'password'],
                    where: { id: id}
                })
                .then((userFound) => {
                    done(null, userFound);
                })
                .catch((err) => {
                    return response.status(400).json({ 'error': 'Unable to verify user' });
                });
            },
            (userFound, done) => {
                if(userFound) {
                  userFound.update({
                      lastName: (lastName ? lastName : userFound.lastName),
                      firstName: (firstName ? firstName : userFound.firstName),
                      email: (email ? email : userFound.email),
                      password: (password ? password : userFound.password)
                  })

                  .then((userFound) => {
                      done(userFound);
                  })
                  .catch((err) => {
                      response.status(400).json({ 'error': 'An error occurred' });
                  });
                }
                else {
                  response.status(404).json({ 'error': 'An error occurred' });
                }
            },
        ],
            (userFound) => {
                if (userFound) {
                    response.status(200).json({'success': 'User successfuly modified'})
                }
                else {
                return response.status(400).json({ 'error': 'An error occurred' });
                }
            }
        )        
    },

    delete: (request, response) => {
        // Parameters
        const id = request.params.id;
        models.users.destroy({
            where: { id: id }
        })
          .then(num => {
            if (num == 1) {
            response.status(200).send({
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
        models.users.findOne({
            attributes: [ 'id', 'email', 'firstName', 'lastName', 'role'],
            where: { id: id }
            })
        .then(data => {
            if (data) {
                response.status(200).send(data);
            } else {
            response.status(400).send({
                message: `An error occurred : cannot found user with id=${id}. Maybe user was not found!`
              });
            }
          })
          .catch(err => {
            response.status(400).send({
              message: `An error occurred : could not found user with id=${id}.`
            });
          });
      },
    searchAll: (request, response) => {
        // Parameters
        models.users.findAll({
            attributes: [ 'id', 'email', 'firstName', 'lastName', 'role' ]
            })
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
                        return response.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    } else {
                        return response.status(403).json({'error': 'invalid password'})
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


/* exports.register = (req, res) => {
    
}

exports.login = (req, res) => {
    
}*/

/*update: (request, response) => {
            const id = request.params.id;
            let lastName = request.body.lastName;
            let firstName = request.body.firstName;
            let email = request.body.email;
            let password = request.body.password  
            
        models.users.findOne({
            attributes: [ 'id', 'email', 'firstName', 'lastName', 'role', 'password'],
            where: { id: id}
        })
        .then(userFound => {
            if (userFound) {
                response.status(200).json({'success': 'User successfuly modified'})
            } else {
            return response.status(400).json({ 'error': 'An error occurred' });
            }
          })
        .catch((err) => {
            return response.status(400).json({ 'error': 'Unable to verify user' });
        });
        models.users.update(request.body, {
            lastName: (lastName ? lastName : userFound.lastName),
            firstName: (firstName ? firstName : userFound.firstName),
            email: (email ? email : userFound.email),
            password: (password ? password : userFound.password)
        })
        .then(num => {
          if (num == 1) {
            response.send({
              message: "user was updated successfully."
            });
          } else {
            response.send({
              message: `Cannot update user with id=${id}.`
            });
          }
        })
        .catch(err => {
            response.status(500).send({
            message: "Error updating user with id=" + id
          });
        });
    },*/