// Imports
let express = require('express');
let usersCtrl = require('./routes/usersCtrl')

// Router
exports.router = (() => {
    let apiRouter = express.Router();
    // Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register)
    apiRouter.route('/user/:id/').put(usersCtrl.update)
    apiRouter.route('/user/:id/').delete(usersCtrl.delete)
    apiRouter.route('/user/:id/').get(usersCtrl.searchOne)
    apiRouter.route('/users/').get(usersCtrl.searchAll)
    apiRouter.route('/users/login/').post(usersCtrl.login)
    
    return apiRouter;
})();