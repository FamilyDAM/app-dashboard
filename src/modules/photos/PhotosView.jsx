/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */

/** jsx React.DOM */
// Renders the todo list as well as the toggle all button
// Used in TodoApp
var React = require('react');
import { Router, Link } from 'react-router';

var MenuItem = require('react-bootstrap').MenuItem;
var DropdownButton = require('react-bootstrap').DropdownButton;

var NodeActions = require('../../actions/NodeActions');
var FileActions = require('../../actions/FileActions');
var DirectoryActions = require('../../actions/DirectoryActions');
var NavigationActions = require('../../actions/NavigationActions');
var ImageActions = require('../../actions/ImageActions');

var FileStore = require('./../../stores/FileStore');
var DirectoryStore = require('./../../stores/DirectoryStore');
var PreferenceStore = require('./../../stores/PreferenceStore');
var UserStore = require('./../../stores/UserStore');
var PhotoStore = require('./../../stores/PhotoStore');

var Tags = require('./../../components/tags/Tags.jsx');
var PreviewSidebar = require("./../previews/PreviewSidebar.jsx");
var Tree = require('../../components/folderTree/Tree.jsx');
var SidebarSection = require('../../components/sidebarSection/SidebarSection.jsx');
var AppSidebar = require('../../components/appSidebar/AppSidebar.jsx');
var Fab = require('../../components/fab/UploadFab.jsx');
var IsotopeGallery = require('../../components/isotopeGallery/IsotopeGallery.jsx');
var TagList = require('./TagList.jsx');
var PeopleList = require('./PeopleList.jsx');
var DateTree = require('./DateTree.jsx');
var PhotoActions = require('./PhotoActions.jsx');



module.exports =  React.createClass({

    getInitialState: function () {
        return {
            files: [],
            filters: {},
            selectedItem: undefined,
            selectedImages:[],
            state: '100%',
            showAddFolder: false,
            bodyWidth: 0,
            isLoading:true
        };
    },


    componentWillMount: function () {
        var _this = this;

        console.log("{PhotosView} componentWillMount");

        // update the breadcrumb
        var _pathData = {'label': 'Photos', 'navigateTo': "photos", 'params': {}, 'level': 1};
        NavigationActions.currentPath.onNext(_pathData);

        this.filtersSubscription = PhotoStore.filters.subscribe(function(data_){
            this.state.filters = data_;

            //on Initial load, or when filters change run initial search to populate the view
            ImageActions.search.source.onNext(this.state.filters);

            if( this.isMounted()) this.forceUpdate();
        }.bind(this));


        this.searchSubscription = ImageActions.search.sink.subscribe(function(data_){
            this.setState({'files':data_, isLoading:false});
            //this.state.isLoading = false;
            //this.state.files = data_;
            //if( this.isMounted()) this.forceUpdate();
        }.bind(this));

    },


    componentWillReceiveProps: function (nextProps) {
        //console.log("{PhotosView} componentWillReceiveProps");

    },

    componentWillUnmount: function () {
        window.removeEventListener("resize", this.updateDimensions);

        if( this.filtersSubscription !== undefined ) this.filtersSubscription.dispose();
        if( this.searchSubscription !== undefined ) this.filtersSubscription.dispose();
    },

    componentDidMount: function () {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    },

    updateDimensions: function () {
        this.setState({width: $(window).width(), height: ($(window).height() - 130) + 'px'});
    },

    handleLogout:function(event_){
        //todo, logout and redirect back to /
    },


    handleActionClose:function(event_){

        this.state.selectedImages = [];

        for( var key in this.state.files)
        {
            for (var i = 0; i < this.state.files[key].children.length; i++)
            {
                var _file = this.state.files[key].children[i];
                    _file.active = false;
            }
        }

        if( this.isMounted()) this.forceUpdate();
    },


    handleImageToggle:function(event_){

        this.state.selectedImages = [];

        for( var key in this.state.files)
        {
            for (var i = 0; i < this.state.files[key].children.length; i++)
            {
                var _file = this.state.files[key].children[i];
                if( _file.active){
                    this.state.selectedImages.push(_file);
                }
            }
        }

        if( this.isMounted()) this.forceUpdate();
    },






    handleGroupByChange:function(event, eventKey)
    {
        this.setState({'files':[], 'isLoading':true});

        var data = {};
        data.type = "group";
        data.name = eventKey;
        ImageActions.addFilter.onNext(data);
    },

    removeFilter: function(data){
        this.setState({'files':[], 'isLoading':true});

        ImageActions.removeFilter.onNext(data);
    },

    addFilter: function(data){

        this.setState({'files':[], 'isLoading':true});

        if( data.type == "path" ){
            data.name = data.path;
        } else if( data.type == "date" ){
            data.name = data.key;
        }
        ImageActions.addFilter.onNext(data);
    },

    addFreeFormFilter: function(data){
        var _type = "tag";
        var _name = data;

        if( data.indexOf(":") > -1)
        {
            _type = data.substr(0, data.indexOf(":"));
            _name = data.substr(data.indexOf(":")+1);
        }

        var isNew = false;
        if( _type === "path" )
        {
            for (var k = 0; k < this.state.filters.paths.length; k++) {
                var _path = this.state.filters.paths[k];
                if (_path.name == _name) {
                    isNew = true;
                    break;
                }
            }
        }
        else if( _type === "date" )
        {
            for (var i = 0; i < this.state.filters.date.length; i++) {
                var _date = this.state.filters.date[i];
                if (_date.name == _name) {
                    isNew = true;
                    break;
                }
            }
        }
        else if( _type === "people" )
        {
            for (var i = 0; i < this.state.filters.people.length; i++) {
                var _people = this.state.filters.people[i];
                if (_people.name == _name) {
                    isNew = true;
                    break;
                }
            }
        }
        else if( _type === "tag" )
        {
            for (var i = 0; i < this.state.filters.tags.length; i++) {
                var _tag = this.state.filters.tags[i];
                if (_tag.name == _name) {
                    isNew = true;
                    break;
                }
            }
        }


        if( !isNew )
        {
            this.setState({'files':[], 'isLoading':true});

            if( data.indexOf(":") > -1 )
            {
                ImageActions.addFilter.onNext({type: _type, name: _name});
            }else
            {
                ImageActions.addFilter.onNext({type: "tag", name: _name});
                ImageActions.addFilter.onNext({type: "people", name: _name});
            }
        }
    },




    render: function () {

        var _this = this;
        var tableClass = "card main-content col-xs-8 col-sm-9 col-md-9 col-lg-10";
        var asideClass = "box body-sidebar col-xs-4 col-sm-3 col-md-3 col-lg-2";
        var asideRightClass = "card hidden col-xs-4 col-sm-3 col-md-3";

        if (this.state.selectedImages.length > 0 )
        {
            tableClass = "card main-content col-xs-8 col-sm-9 col-md-6 col-lg-7";
            asideClass = "box body-sidebar hidden-xs hidden-sm col-md-3 col-lg-2";
            asideRightClass = "card hidden-xs hidden-sm col-md-3 col-lg-3";
        }

        var asideStyle = {};
        asideStyle['height'] = this.state.height;

        var sectionStyle = {};
        //sectionStyle['overflow'] = 'scroll';
        //sectionStyle['height'] = this.state.height;


        try
        {

            return (

                <div className="photosView container-fluid">
                    <div className="row">

                        <aside className={asideClass} style={asideStyle}>

                            <div className="boxRow content" style={{'minHeight':'200px'}}>
                                <SidebarSection label="Filter by folder" open={true}>
                                    <Tree
                                        baseDir="/content/dam-files"
                                        onSelect={(e_)=>{
                                            e_.type = "path";
                                            this.addFilter(e_);
                                        }}/>
                                </SidebarSection>
                                <br/>
                                <SidebarSection label="Filter by date" open={true}>
                                    <DateTree
                                        onSelect={(e_)=>{
                                            e_.type = "date";
                                            this.addFilter(e_);
                                        }}/>
                                </SidebarSection>
                                <br/>
                                <SidebarSection label="Filter by people" open={true}>
                                    <PeopleList
                                        onSelect={this.addFilter}/>
                                </SidebarSection>
                                <br/>
                                <SidebarSection label="Filter by tag" open={true}>
                                    <TagList
                                        onSelect={this.addFilter}/>
                                </SidebarSection>

                            </div>


                            <div className=" boxRow footer">
                                <AppSidebar />
                            </div>

                        </aside>

                        <section className={tableClass} style={sectionStyle}>
                            <div className="container-fluid photo-body">


                                <div>
                                    <DropdownButton id="groupByOptions" title="Group By:" onSelect={this.handleGroupByChange}>
                                        <MenuItem eventKey="date:day">Group By Day</MenuItem>
                                        <MenuItem eventKey="date:month">Group By Month</MenuItem>
                                        <MenuItem eventKey="date:year">Group By Year</MenuItem>
                                        <MenuItem eventKey="gps:location">Group By Location</MenuItem>
                                        <MenuItem eventKey="tag:person">Group By Person</MenuItem>
                                        <MenuItem eventKey="tag:tag">Group By Tag</MenuItem>
                                    </DropdownButton>


                                    <Tags
                                        title="Filters"
                                        tags={this.state.filters}
                                        onAdd={this.addFreeFormFilter}
                                        onRemove={this.removeFilter}
                                    />
                                </div>

                                {(() => {
                                    if( this.state.isLoading )
                                    {
                                        return (
                                            <div className="loadingPanel text-center">
                                                <i className="fa fa-spinner fa-spin fa-4x fa-fw margin-bottom" style={{'marginTop':'50px'}}></i>
                                            </div>
                                        );
                                    }
                                })()}


                                {this.state.files.map(function(item_, indx_){
                                    return(
                                        <div key={'group-' +indx_}>
                                            <SidebarSection
                                                style={{'height':'60px'}}
                                                label={item_.label}/>


                                            <div style={{'clear':'left'}}>
                                                <IsotopeGallery
                                                    id={'gallery-' +indx_}
                                                    onToggle={this.handleImageToggle}
                                                    images={item_.children}/>
                                            </div>
                                        </div>
                                    )
                                }.bind(this))}

                            </div>
                        </section>

                        <aside className={asideRightClass}>
                            <PhotoActions
                                images={this.state.selectedImages}
                                onClose={this.handleActionClose}/>
                        </aside>
                    </div>


                    <Fab glyph="plus" linkTo="upload"/>

                    <br/>
                </div>
            );
        }catch(err_){
            console.log(err_);
            return(<div>{err_}</div>);
        }
    }

});



