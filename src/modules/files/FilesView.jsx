/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */

/** jsx React.DOM */
// Renders the todo list as well as the toggle all button
// Used in TodoApp
var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Table = require('react-bootstrap').Table;
var ButtonGroup = require('react-bootstrap').ButtonGroup;

var Button = require('react-bootstrap').Button;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Glyphicon = require('react-bootstrap').Glyphicon;
var ButtonLink = require('react-router-bootstrap').ButtonLink;
var Dropdown = require('react-bootstrap').Dropdown;
var DropdownButton = require('react-bootstrap').DropdownButton;
var NavItemLink = require('react-router-bootstrap').NavItemLink;
var MenuItemLink = require('react-router-bootstrap').MenuItemLink;

var Modal = require('react-bootstrap').Modal;
var ModalHeader = require('react-bootstrap').Modal.Header;
var ModalTitle = require('react-bootstrap').Modal.Title;
var ModalBody = require('react-bootstrap').Modal.Body;
var ModalFooter = require('react-bootstrap').Modal.Footer;


var NodeActions = require('../../actions/NodeActions');
var FileActions = require('../../actions/FileActions');
var DirectoryActions = require('../../actions/DirectoryActions');
var NavigationActions = require('../../actions/NavigationActions');

var FileStore = require('./../../stores/FileStore');
var DirectoryStore = require('./../../stores/DirectoryStore');
var PreferenceStore = require('./../../stores/PreferenceStore');
var UserStore = require('./../../stores/UserStore');


var FileRow = require("./FileRow");
var DirectoryRow = require("./DirectoryRow");
var BackFolder = require("./BackFolder");
var PreviewSidebar = require("./../previews/PreviewSidebar");
var SectionTree = require('../../components/folderTree/SectionTree');
var AppSidebar = require('../../components/appSidebar/AppSidebar');


var FilesView = React.createClass({
    mixins: [Navigation],


    getInitialState: function () {
        return {
            files: [],
            selectedItem: undefined,
            state: '100%',
            showAddFolder: false,
            selectedPath: "/dam:files/"
        };
    },


    componentWillMount: function () {
        var _this = this;
        console.log("{FilesView} componentWillMount");


        // update the breadcrumb
        var _pathData = {'label': 'Files', 'navigateTo': "files", 'params': {}, 'level': 1};
        NavigationActions.currentPath.onNext(_pathData);


        this.state.path = "/dam:files/";
        if (this.props.query && this.props.query.path)
        {
            this.state.path = this.props.query.path;
        }
        this.state.selectedPath = this.state.path;


        // save current dir
        //DirectoryActions.selectFolder.onNext(this.state.path);
        // load files
        FileActions.getFiles.source.onNext(this.state.path);


        // rx callbacks
        this.fileStoreSubscription = FileStore.files.subscribe(function (data_) {
            _this.state.files = data_;
            if (_this.isMounted())  _this.forceUpdate();
        });


        // listen for trigger to reload for files in directory
        this.refreshFilesSubscription = FileActions.refreshFiles.subscribe(function (data_) {
            FileActions.getFiles.source.onNext(undefined);
            FileActions.getFiles.source.onNext(_this.state.path);
        });

        // Refresh the file list when someone changes the directory
        this.selectFolderSubscription = DirectoryActions.selectFolder.subscribe(function (data_) {
            FileActions.getFiles.source.onNext(data_.path);
            _this.state.selectedPath = data_.path;
            if (_this.isMounted())  _this.forceUpdate();
        });

        // Refresh the file list when someone changes the directory
        this.selectedFileSubscription = FileActions.selectFile.subscribe(function (data_) {
            _this.state.selectedItem = data_;
            if (_this.isMounted())  _this.forceUpdate();
        });


        /**
         * Add Folder Modal
         */
            // listen for the selected dir.
        this.currentFolderSubscription = DirectoryStore.currentFolder.subscribe(function(data_){
            _this.state.parent = data_;
            if( _this.isMounted() ) _this.forceUpdate();
        }.bind(this));

        // listen for save complete, then hide
        this.createFolderSubscription = DirectoryActions.createFolder.sink.subscribe(function(data_){
            _this.closeAddFolderModal();
            if( _this.isMounted() ) _this.forceUpdate();
        }, function(error_){
            alert(error_.statusText);
        }.bind(this));
    },


    componentWillReceiveProps: function (nextProps) {
        //console.log("{FilesView} componentWillReceiveProps");

        var _path = nextProps.query.path;

        // upload local state, and reset list to prepare for new files
        this.setState({'path': _path, 'files': []});

        // load files
        FileActions.getFiles.source.onNext(_path);
    },

    componentWillUnmount: function () {
        if (this.fileStoreSubscription !== undefined) {
            this.fileStoreSubscription.dispose();
        }
        if (this.refreshFilesSubscription !== undefined) {
            this.refreshFilesSubscription.dispose();
        }
        if (this.selectFolderSubscription !== undefined) {
            this.selectFolderSubscription.dispose();
        }
        if (this.selectedFileSubscription !== undefined) {
            this.selectedFileSubscription.dispose();
        }
        if( this.currentFolderSubscription !== undefined ){
            this.currentFolderSubscription.dispose();
        }
        if( this.createFolderSubscription !== undefined ){
            this.createFolderSubscription.dispose();
        }

        window.removeEventListener("resize", this.updateDimensions);
    },

    componentDidMount: function () {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    },

    updateDimensions: function () {
        this.setState({width: $(window).width(), height: ($(window).height() - 130) + 'px'});
    },


    handleAddFolder: function(event_){
        this.setState({showAddFolder: true});
    },


    closeAddFolderModal: function(event_){
        this.setState({ showAddFolder: false });
    },


    handleCreateFolder: function(event_){
        var _parent = this.state.parent;
        var _name = this.refs.folderName.getDOMNode().value;
        DirectoryActions.createFolder.source.onNext({'parent': _parent, 'name': _name})
    },



    render: function () {

        var _this = this;
        var tableClass = "col-xs-8 col-sm-9 col-md-9";
        var asideClass = "col-xs-4 col-sm-3 col-md-3 box";
        var asideRightClass = "hidden col-xs-4 col-sm-3 col-md-3";

        if (this.state.selectedItem !== undefined && this.state.selectedItem !== null)
        {
            tableClass = "col-xs-8 col-sm-9 col-md-6";
            asideClass = "hidden-xs hidden-sm col-md-3 box";
            asideRightClass = "hidden-xs hidden-sm col-md-3";
        }



        var folderRows = this.state.files
            .filter(function (dir_) {
                return dir_._class == "com.familydam.core.models.Directory";
            }).map(function (dir_, indx) {
                return <DirectoryRow key={indx} dir={dir_}/>
            });


        var fileRows = this.state.files
            .filter(function (file_) {
                return file_._class == "com.familydam.core.models.File";
            }).map(function (file_, indx) {
                return <FileRow key={indx} file={file_}/>
            });


        var asideStyle = {};
        asideStyle['height'] = this.state.height;

        var sectionStyle = {};
        sectionStyle['borderLeft'] = '1px solid #cccccc';
        sectionStyle['overflow'] = 'scroll';
        sectionStyle['height'] = this.state.height;




        return (

            <div className="filesView container-fluid">
                <div className="row">

                    <aside className={asideClass} style={asideStyle}>

                        <ButtonGroup className="boxRow header">
                            <ButtonLink to="home" bsSize='medium' bsStyle="link"><Glyphicon glyph='home'/></ButtonLink>
                            <ButtonLink to="userManager" bsSize='medium' bsStyle="link"><Glyphicon
                                glyph='user'/></ButtonLink>
                            <ButtonLink to="files" bsSize='medium' bsStyle="link"><Glyphicon
                                glyph='search'/></ButtonLink>


                            <Dropdown id='dropdown-custom-1'>
                                <Dropdown.Toggle>
                                    <Glyphicon glyph='cog' />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className='super-colors'>
                                    <MenuItemLink eventKey="1" to="userManager">User Manager</MenuItemLink>
                                    <MenuItemLink eventKey="2" to="login">Logout</MenuItemLink>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>

                        <div className="boxRow content" style={{'minHeight':'200px'}}>
                            <SectionTree title="Local Files"
                                         showAdd={true}
                                         onAdd={this.handleAddFolder}
                                         navigateToFiles={true}
                                         baseDir="/dam:files/"/>

                        </div>


                        <div className=" boxRow footer">
                            <AppSidebar />
                        </div>

                    </aside>

                    <section className={tableClass} style={sectionStyle}>
                        <div className="container-fluid fileRows">

                            <BackFolder/>

                            {folderRows}

                            {fileRows}

                        </div>

                    </section>

                    <aside className={asideRightClass}>
                        <PreviewSidebar file={this.state.selectedItem}/>
                    </aside>
                </div>


                <div id="fab-button-group">
                    <div className="fab  show-on-hover dropup">
                        <div data-toggle="tooltip" data-placement="left" title="Compose">
                            <button type="button" className="btn btn-material-lightblue btn-io dropdown-toggle"
                                    data-toggle="dropdown">
                                    <span className="fa-stack fa-2x">
                                        <i className="fa fa-circle fa-stack-2x fab-backdrop"></i>
                                        <i className="fa fa-pencil fa-stack-1x fa-inverse fab-secondary"></i>
                                        <Link to="upload" style={{'color':'#fff'}}>
                                            <Glyphicon glyph="plus"
                                                       className="fa fa-plus fa-stack-1x fa-inverse fab-primary"
                                                       style={{'fontSize': '24px'}}></Glyphicon>
                                        </Link>

                                    </span>
                            </button>
                        </div>
                        <ul className="dropdown-menu dropdown-menu-right" role="menu">
                        </ul>
                    </div>
                </div>



                <Modal  title="Add Folder"
                        animation={false}
                        show={this.state.showAddFolder}
                        onHide={this.closeAddFolderModal}>
                    <div className="modal-body">
                        <h4>Create a new sub folder</h4>
                        {this.state.selectedPath} <input type="text" ref="folderName" label="Folder Name"/>
                    </div>
                    <div className="modal-footer">
                        <ButtonGroup>
                            <Button onClick={this.closeAddFolderModal}>Close</Button>
                            <Button onClick={this.handleCreateFolder}>Create</Button>
                        </ButtonGroup>
                    </div>
                </Modal>
            </div>


        );
    }

});

module.exports = FilesView;

