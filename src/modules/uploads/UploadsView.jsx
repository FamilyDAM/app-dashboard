
/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */

/** jsx React.DOM */
// Renders the todo list as well as the toggle all button
// Used in TodoApp
var React = require('react');
import { Router, Link } from 'react-router';

import {
    IconButton,
    Paper,
    Table,
    TableHeader,
    TableHeaderColumn,
    TableBody,
    TableRow,
    TableRowColumn,
    TextField,
    Toolbar,
    ToolbarGroup,
    ToolbarSeparator
} from 'material-ui';

var Breadcrumb = require('../../components/breadcrumb/Breadcrumb.jsx');

var FileUploadView = require('./FileUploadView.jsx');
var AppSidebar = require('../../components/appSidebar/AppSidebar.jsx');
var Tree = require('../../components/folderTree/Tree.jsx');
var FolderTree = require('../../components/folderTree/FolderTree.jsx');
var SidebarSection = require('../../components/sidebarSection/SidebarSection.jsx');

var UploadActions = require('../../actions/UploadActions');
var NavigationActions = require('./../../actions/NavigationActions');
var FileActions = require('../../actions/FileActions');
var DirectoryActions = require('../../actions/DirectoryActions');

var DirectoryStore = require("../../stores/DirectoryStore");
var UserStore = require("../../stores/UserStore");


/**
 * TODO: remove bullet list in css
 * TODO: hash the path and file name for the key attribute to reduce the chance of unique key errors
 * TODO: Add file size to display
 */
module.exports = React.createClass({


    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState: function () {
        var _defaultPath = DirectoryStore.contentFileRoot +UserStore.getCurrentUser().username;

        return {
            state: '100%',
            uploadPath:_defaultPath,
            showAddFolder:false
        };
    },

    componentWillMount: function(){
        var _this = this;

        // update the Title
        NavigationActions.updateTitle.onNext({'label': 'Upload Files'});

        this.currentFolderSubscription = DirectoryStore.currentFolder.subscribe(function(d_){

            var _uploadPath = d_.path;
            if( d_.path.substring(d_.path.length-1) != "/")
            {
                _uploadPath = d_.path +"/";
            }


            this.setState({'currentFolder':d_.path, "uploadPath":_uploadPath});
        }.bind(this));
    },

    componentWillUnmount: function(){
        if( this.currentFolderSubscription !== undefined ){
            this.currentFolderSubscription.dispose();
        }
    },



    render: function() {

        return (
            <div style={{'display':'flex', 'flexDirection':'column', 'minHeight':'calc(100vh - 65px)'}}>
                <Toolbar style={{'display':'flex', 'height':'50px', 'alignItems':'center'}}>
                    <ToolbarGroup firstChild={true} float="left">
                        <IconButton iconClassName="material-icons">folder</IconButton>
                        <Breadcrumb path={this.state.currentFolder}/>
                    </ToolbarGroup>
                    <ToolbarGroup float="right">

                    </ToolbarGroup>
                </Toolbar>


                <div style={{'display':'flex', 'flexDirection':'row', 'flexGrow':1, 'width':'100%', 'justifyContent':'center'}}>

                    <FileUploadView
                        currentFolder={this.state.currentFolder}
                        uploadPath={this.state.uploadPath}/>

                </div>
            </div>

        )
    },




    renderOld: function() {

        var tableClass = "card main-content col-xs-8 col-sm-9 col-md-9 col-lg-10";
        var asideClass = "box body-sidebar col-xs-4 col-sm-3 col-md-3 col-lg-2";

        var asideStyle = {};
        asideStyle['height'] = this.state.height;

        var sectionStyle = {};

        try
        {
            return (
                <div className="uploadView container-fluid">
                    <div className="row">

                        <aside className={asideClass} style={asideStyle}>
                            <div className="boxRow content" style={{'minHeight':'200px'}}>
                                <SidebarSection label="Files" open={true} showAddFolder={true} onAddFolder={this.handleAddFolder}>
                                    <Tree
                                        baseDir="/content/dam-files"
                                        onSelect={(path_)=>{
                                            FileActions.getFiles.source.onNext(path_.path);
                                            DirectoryActions.selectFolder.onNext({path: path_.path});
                                        }}/>
                                </SidebarSection>
                            </div>


                            <div className=" boxRow footer">
                                <AppSidebar />
                            </div>
                        </aside>


                        <section className={tableClass} style={sectionStyle}>
                            <FileUploadView />
                        </section>
                    </div>
                </div>
            );
        }catch(err){
            console.log(err);
        }
    }

});


