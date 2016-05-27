/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */

var Rx = require('rx');
var PreferenceStore = require('../../stores/PreferenceStore');
var UserActions = require('../../actions/UserActions');


/**
 * @SEE http://docs.spring.io/spring-xd/docs/1.2.0.M1/reference/html/#processors
 * @type {{subscribe: Function, onNext: Function}}
 */

module.exports = {

    sink: undefined,

    subscribe: function () {
        console.log("{createUser Service} subscribe");
        this.sink = UserActions.createUser.sink;
        UserActions.createUser.source.subscribe(function (data_) {
            this.createUser(data_);
        }.bind(this));
    },

    /**
     * Return all of the users
     * @param val_
     * @returns {*}
     */
    createUser: function (data_) {

        debugger;
        var _data = {};
        _data.username = data_.username;
        var _props = {
            ':name': data_.firstName,
            'firstName': data_.firstName,
            'lastName': data_.lastName,
            'email': data_.email,
            'pwd': data_.password,
            'pwdConfirm': data_.password,
            'isFamilyAdmin': data_.isFamilyAdmin
        };

        var _this = this;
        return $.ajax({
            'method': 'post'
            , 'url': "/bin/familydam/api/v1/users"
            , 'data': _props
            , cache: false
            , 'xhrFields': {
                withCredentials: true
            }
        }).then(function (results, status_, xhr_) {

            _this.sink.onNext(true);

        }, function (xhr_, status_, errorThrown_) {

            debugger;
            //send the error to the store (through the sink observer
            if (xhr_.status == 401)
            {
                AuthActions.loginRedirect.onNext(true);
            } else
            {
                var _error = {'code': xhr_.status, 'status': xhr_.statusText, 'message': xhr_.responseText};
                _this.sink.onError(_error);
            }
        });

    }

};

