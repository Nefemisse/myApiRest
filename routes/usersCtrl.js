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
            console.log('--------1---------', request.body)
            return response.status(400).json({'error': 'Missing parameters'});
        }
        
        if (!EMAIL_REGEX.test(email)) {
            console.log('--------1.1---------', request.body)
            return response.status(400).json({'error': 'email is not valid'})
        }

        if (!PASWORD_REGEX.test(password)) {
            console.log('--------1.2---------', request.body)
            return response.status(400).json({'error': 'password invalid (must length 4 - 18 and include 1 number)'})
        }

        // Waterfall

        //

        models.users.findOne({
            attributes: ['email'],
            where: { email: email}
        })
        .then(function(userFound) {
            if (!userFound) {
                console.log('--------2--------',userFound, ': userfound', request.body, ': request')
                bcrypt.hash(password, 5, function(err, bcryptedPassword) {
                    let newUser = models.users.create({
                        lastName: lastName,
                        firstName: firstName,
                        email: email,
                        password: bcryptedPassword,
                        role: role
                    })
                    .then(function(newUser) {
                        console.log('--------3---------') 
                        return response.status(201).json({
                            'userId': newUser.id, 'sucess': 'User successfully created'
                        })
                    })
                    .catch(function(err) {
                        console.log('--------4---------', newUser, err)
                        return response.status(400).json({'error': 'An error occured.'})
                    })
                })
            } else {
                console.log('--------5---------')
                return response.status(409).json({'error': 'user already exist.'})
            }
        })
        .catch(function(err) {
            console.log('--------6---------')
            return response.status(500).json({'error': 'unable to verify user'})
        })

    },
    update: (req, res) => {
        const id = req.params.id;
        Tutorial.update(req.body, {
          where: { id: id }
        })
          .then(num => {
            if (num == 1) {
              res.send({
                message: "Tutorial was updated successfully."
              });
            } else {
              res.send({
                message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
              });
            }
          })
          .catch(err => {
            res.status(500).send({
              message: "Error updating Tutorial with id=" + id
            });
          });
      },
    delete: (request, response) => {
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
                console.log('-------------1--------------')
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        console.log('-------------2--------------')
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    } else {
                        console.log('-------------3--------------')
                        return res.status(403).json({'error': 'invalid password'})
                    }
                })
            } else {
                console.log('-------------4--------------')
                return response.status(404).json({'error': 'user not exist in DB'})
            }
        })
        .catch(function(err) {
            console.log('-------------5--------------')
            return response.status(500).json({'error': 'unable to verify user'})
        })
    },
    search: (request, response) => {



    },
    search: (request, response) => {



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
                console.log('-------------1--------------')
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        console.log('-------------2--------------')
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        })
                    } else {
                        console.log('-------------3--------------')
                        return res.status(403).json({'error': 'invalid password'})
                    }
                })
            } else {
                console.log('-------------4--------------')
                return response.status(404).json({'error': 'user not exist in DB'})
            }
        })
        .catch(function(err) {
            console.log('-------------5--------------')
            return response.status(500).json({'error': 'unable to verify user'})
        })
    }
}