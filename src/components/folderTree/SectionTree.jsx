

/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */

/** jsx React.DOM */
// Renders the todo list as well as the toggle all button
// Used in TodoApp
var React = require('react');
var addons = require('react-addons');


var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;

var moment = require('moment');
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var Glyphicon = require('react-bootstrap').Glyphicon;
var DirectoryActions = require('./../../actions/DirectoryActions');
var DirectoryStore = require('./../../stores/DirectoryStore');


var AddFolderModal = React.createClass({

    getInitialState: function(){
        return {
            'parent':"/content/dam-files"
        }
    },

    componentWillMount: function(){
        var _this = this;


        // listen for the selected dir.
        DirectoryStore.currentFolder.subscribe(function(data_){
            _this.state.parent = data_;
            if( _this.isMounted() ) _this.forceUpdate();
        });


        // listen for save complete, then hide
        DirectoryActions.createFolder.sink.subscribe(function(data_){
            _this.props.onRequestHide();
        }, function(error_){
            alert(error_.statusText);
        });
    },



    handleCreateFolder:function(event_){
        var _this = this;

        var _parent = this.state.parent;
        var _name = _this.refs.folderName.value;
        DirectoryActions.createFolder.source.onNext({'parent': _parent, 'name': _name})

    },


    render: function() {

        var activeVisibleDir = this.state.parent.path;
        
        return (
            <Modal {...this.props} title="Add Folder" animation={false}>
                <div className="modal-body">
                    <h4>Create a new sub folder</h4>
                    {activeVisibleDir} <input type="text" ref="folderName" label="Folder Name"/>
                </div>
                <div className="modal-footer">
                    <ButtonGroup>
                        <Button onClick={this.props.onRequestHide}>Close</Button>
                        <Button onClick={this.handleCreateFolder}>Create</Button>
                    </ButtonGroup>
                </div>
            </Modal>
        );
    }
});




var FolderTree = React.createClass({
    mixins: [ Router.Navigation ],

    
    propTypes: {
        title: React.PropTypes.string,
        baseDir: React.PropTypes.string,
        disabled: React.PropTypes.bool,
        showAdd: React.PropTypes.bool,
        showAddFolder: React.PropTypes.bool,
        sectionNavigateTo: React.PropTypes.string,
        'buttonGlyph': React.PropTypes.string,
        'buttonClick': React.PropTypes.string
    },

    getDefaultProps: function(){
        return {
            'section':'files',
            'baseDir':null,
            'showAddFolder':false,
            'showAdd':false,
            renderDepth:2,
            disabled:false,
            navigateToFiles:true,
            sectionNavigateTo:undefined,
            'buttonGlyph':"",
            'buttonClick':""
        };
    },


    getInitialState: function(){
        return {
            'folders':[],
            mode:'browse',
            activeFolder: {}
        }
    },


    componentDidMount: function(){
        if( this.props.baseDir != null )
        {
            this.refreshDirecories(this);
        }
    },



    refreshDirecories: function() {
        var _this = this;

        // trigger a directory reload
        this.directoryStore = DirectoryActions.getDirectories.source.onNext(_this.props.baseDir);

        // listen for trigger to reload for files in directory
        DirectoryActions.refreshDirectories.subscribe(function(data_){
            DirectoryActions.getDirectories.source.onNext( undefined );
            DirectoryActions.getDirectories.source.onNext( _this.props.baseDir );
        });

        //Listen for directory changes
        DirectoryStore.directories.subscribe(function (data_) {
            _this.state.folders = data_;
            if (_this.isMounted()) _this.forceUpdate();
        });
    },


    handleSelectDir: function(folder_, a1_, a2_){
        //console.log("{handle select dir}");
        console.dir(folder_);
        if( this.isMounted() ) this.setState( {'activeFolder': folder_} );

        
        // send event that has will be picked up by the FilesView
        DirectoryActions.selectFolder.onNext(folder_);

    },


    handleAdd: function(event_){
        this.props.onAdd(event_);
    },


    
    isParentPath: function(path_, activePath_){
        var _isParentPath = false;
        if( activePath_ !== undefined ) {
            var pathSections = path_.split("/");
            var activeSections = activePath_.split("/");
            for (var i = 0; i < activeSections.length; i++)
            {
                var sec = pathSections[i];
                if( sec == activeSections[i] ){
                    _isParentPath = true;
                }else if( sec != activeSections[i] ){
                    _isParentPath = false;
                    break;
                }

                if( Math.abs(pathSections.length - activeSections.length) > 1 ){
                    _isParentPath = false;
                    break;
                }
            }
        }
        return _isParentPath;
    },

    render: function() {

        var _this = this;
        var _depth = 0;
        var _boundClick = _this.handleSelectDir.bind(this, {'path':this.props.baseDir});
 

        var listItems = function(_folders, expand_)
        {
            return _folders.map(function(_f)  {

                    var _isParentPath = _this.isParentPath(_f.path, _this.state.activeFolder.path)

                    var classes = addons.classSet({
                        'has-children': ( (_f.children && _f.children.length > 0) ? true : false),
                        'open': ( (expand_ || _isParentPath) ? true : false),
                        'closed': ( (expand_ || _isParentPath) ? false : true),
                        'selected': false /*todo*/
                    });

                    var _boundClick = _this.handleSelectDir.bind(_this, _f);

                    return <ListGroupItem key={_f.path} className={classes}>
                                <div
                                     style={{'cursor': 'pointer'}}
                                     className={_this.state.activeFolder == _f ? 'folderItem active' : 'folderItem'}
                                     onClick={_boundClick}>
                                    <Glyphicon glyph="chevron-right"/>
                                    <strong style={{'paddingLeft': '3px'}}>{_f.name}</strong>
                                </div>
                                <ListGroup>
                                    {listItems(_f.children, false  )}
                                </ListGroup>

                            </ListGroupItem>

            })

        };
        //<ListGroup>{listItems(_f.children)}</ListGroup>

        var rootClassSet = addons.classSet({
            'folderTree': true,
            'disabled': this.props.disabled? true:false
        });

        
        return (
            <div className={rootClassSet}>
                <div className="header">
                    <h3>
                        {this.props.sectionNavigateTo !== undefined ?
                            <Link to={this.props.sectionNavigateTo}>{this.props.title}</Link>
                            :this.props.title}


                        {this.props.showAdd==true ?
                        <Glyphicon glyph="plus"
                                className="pull-right"
                                onClick={this.handleAdd}/>

                        :""}

                        {this.props.buttonGlyph!==""?
                        <Glyphicon glyph={this.props.buttonGlyph}
                                   className="pull-right"
                                   onClick={this.props.buttonClick}/>
                        :""}
                    </h3>
                </div><br/>

                <ListGroup>
                    {this.props.baseDir?
                    <ListGroupItem key="home">
                        <div
                            style={{'cursor':'pointer'}}
                            onClick={_boundClick}>
                            <Glyphicon glyph="chevron-right"/>
                            <strong style={{'paddingLeft':'3px'}}>Home</strong>
                        </div>
                        <ListGroup>
                            {listItems(this.state.folders, true)}
                        </ListGroup>
                    </ListGroupItem>
                    :""}
                </ListGroup>

            </div>
        );
    }

});

module.exports = FolderTree;
