// Imports
let express = require('express');
let usersCtrl = require('./routes/usersCtrl')

// Router
exports.router = (function() {
    let apiRouter = express.Router();

    // Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register)
    apiRouter.route('/users/login/').post(usersCtrl.login)
    apiRouter.route('/user/{id}/').put(usersCtrl.update)
    apiRouter.route('/user/{id}/').delete(usersCtrl.delete)
    apiRouter.route('/user/{id}/').get(usersCtrl.search)
    apiRouter.route('/users/').get(usersCtrl.search)

    return apiRouter;
})();