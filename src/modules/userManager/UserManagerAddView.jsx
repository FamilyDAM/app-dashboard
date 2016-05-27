/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */
/** jsx React.DOM */

var React = require('react');
import {Router, Link} from 'react-router';
import {
    FlatButton,
    FontIcon,
    IconButton,
    RaisedButton,
    Paper,
    SvgIcon,
    Subheader,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableRow,
    TableRowColumn,
    TableHeader,
    TableHeaderColumn,
    Toggle
} from 'material-ui';
import FolderIcon from 'material-ui/svg-icons/file/folder';

var LinkContainer = require('react-router-bootstrap').LinkContainer;

var NavigationActions = require('../../actions/NavigationActions');
var UserActions = require('../../actions/UserActions');
var UserStore = require('../../stores/UserStore');

var NavigationActions = require('./../../actions/NavigationActions');

const LoadingIcon = (props) => (
    <SvgIcon {...props}>
        <svg width='24px' height='24px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
             preserveAspectRatio="xMidYMid" class="uil-default">
            <rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(0 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0s' repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(30 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.08333333333333333s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(60 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.16666666666666666s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(90 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.25s' repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(120 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.3333333333333333s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(150 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.4166666666666667s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(180 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5s' repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(210 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5833333333333334s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(240 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.6666666666666666s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(270 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.75s' repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(300 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.8333333333333334s'
                         repeatCount='indefinite'/>
            </rect>
            <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#ffffff'
                  transform='rotate(330 50 50) translate(0 -30)'>
                <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.9166666666666666s'
                         repeatCount='indefinite'/>
            </rect>
        </svg>
    </SvgIcon>
);

module.exports = React.createClass({

    getInitialState: function () {
        return {
            user: {},
            saveLoading: false
        }
    },


    componentDidMount: function () {
        console.log("{UserManagerDetailView} componentDidMount");

        // pull
        this.state.user = {};


        this.saveUserSubscription = UserActions.saveUser.sink.subscribe(function (data_) {
            setTimeout(function () {
                //stop save spinner
                this.setState({saveLoading: false});
            }.bind(this), 500);
        }.bind(this), function (data_) {
            //error
            debugger;
            setTimeout(function () {
                //stop save spinner
                this.setState({saveLoading: false});
            }.bind(this), 500);
        }.bind(this));

    },

    componentWillUnmount: function () {
        if (this.saveUserSubscription)
        {
            this.saveUserSubscription.dispose();
        }
    },


    handleChange: function (event_) {
        debugger;
        var _field = event_.currentTarget.id;
        var _val = event_.currentTarget.value;

        if( _field == "isFamilyAdmin"){
            this.state.user["isFamilyAdmin"] = _val=="on"?true:false;
        }else
        {
            this.state.user[_field] = _val;
        }
        if (this.isMounted()) this.forceUpdate();
    },

    handleSave: function (event_) {

        if (this.saveBtn !== undefined)
        {
            this.saveBtn.start();
        }

        this.setState({saveLoading: true});
        UserActions.createUser.source.onNext(this.state.user);
    },



    render: function () {
        var _this = this;

        return (
            <div className="container-fluid userDetailsView" style={{'padding':'20px'}}>
                <div className="row">
                    <div className="col-xs-4">
                        Add Family Member
                    </div>
                    <div className="col-xs-8" style={{'textAlign':'right'}}>
                        <LinkContainer to="users">
                            <FlatButton label="Cancel"/>
                        </LinkContainer>
                        <RaisedButton
                            label="Save Settings"
                            ref="saveBtn" id="saveBtn"
                            onTouchTap={this.handleSave}
                            primary={true}
                            icon={this.state.saveLoading?<LoadingIcon style={{'width':'25px', 'height':'25px'}}/>:<span/>}/>
                    </div>
                </div>

                <div className="row personalInfoForm">
                    <div className="col-sm-7">

                        <Subheader style={{'paddingLeft':'0px'}}>Personal Info:</Subheader>
                        <div className="row">
                            <div className="col-sm-6">
                                <label htmlFor="firstName" style={{'width':'100%'}}>
                                    First Name:&nbsp;<br/>
                                    <input type="text"
                                           ref="firstName"
                                           id="firstName" name="firstName"
                                           value={this.state.user.firstName}
                                           onChange={this.handleChange}
                                            style={{'width':'100%'}}/>
                                </label>
                            </div>
                            <div className="col-sm-6">
                                <label htmlFor="firstName" style={{'width':'100%'}}>
                                    Last Name:&nbsp;<br/>
                                    <input type="text"
                                           ref="lastName"
                                           id="lastName" name="lastName"
                                           value={this.state.user.lastName}
                                           onChange={this.handleChange}
                                           style={{'width':'100%'}}/>
                                </label>
                            </div>
                        </div>
                        <div className="row" style={{'marginTop': '10px'}}>
                            <div className="col-sm-12">
                                <label htmlFor="firstName" style={{'width':'100%'}}>
                                    Email:&nbsp;<br/>
                                    <input type="text"
                                           ref="email"
                                           id="email" name="email"
                                           value={this.state.user.email}
                                           onChange={this.handleChange}
                                           style={{'width':'100%'}}/>
                                </label>
                            </div>
                        </div>
                        <div className="row" style={{'marginTop': '10px'}}>
                            <div className="col-sm-12">
                                <label htmlFor="firstName" style={{'width':'100%'}}>
                                    Password:&nbsp;<br/>
                                    <input type="password"
                                           ref="password"
                                           id="password" name="password"
                                           value={this.state.user.password}
                                           onChange={this.handleChange}
                                           style={{'width':'100%'}}/>
                                </label>
                            </div>
                        </div>

                    </div>
                    <div className="col-sm-5">
                        <br/><br/>
                        <Toggle
                            id="isFamilyAdmin"
                            label="Family Administrator"
                            defaultToggled={false}
                            onToggle={this.handleChange}
                        />
                        <span>Family Administrators can add new users, read, write, and DELETE any file in the system.</span>
                    </div>
                </div>

            </div>

        );
    }

});


