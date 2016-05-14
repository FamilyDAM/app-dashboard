/*
 * Copyright (c) 2015  Mike Nimer & 11:58 Labs
 */
/** jsx React.DOM */
var React = require('react');
import { Router, Link } from 'react-router';

import {
    CircularProgress,
    GridList,
    GridTile,
    Subheader,
    IconButton} from 'material-ui';

var ImageActions = require('../../actions/ImageActions');


var GridGroup = React.createClass({

    contextTypes: {
        router: React.PropTypes.object.isRequired
    },


    imageClickedHandler: function(e)
    {
        debugger;
        ImageActions.selectImage.onNext(e);
    },


    render: function () {

        return (
            <div key="g1" style={{'width':'100%'}}>

                {this.props.groups.map(function (item_, indx_) {
                    return (
                        <div key={item_.label}>
                            <Subheader>{item_.label}</Subheader>
                            <GridList
                                cols={5}
                                cellHeight={200}
                                style={{'overflowY': 'auto','marginBottom': '24px'}}>

                                {item_.children.map((img_) => (
                                    <GridTile
                                        key={img_.path}
                                        title={img_.name}
                                        style={img_.active?{'border':'2px solid blue'}:{}}
                                        subtitle={<span>by <b>john doe</b></span>}
                                        actionIcon={<IconButton
                                                        iconClassName="material-icons"
                                                        onClick={() => {this.context.router.push({pathname:'photos/details', query:{path:img_.path}}) }}
                                                        iconStyle={{'color':'white'}}>launch</IconButton>}>
                                        <img src={img_.src}
                                             onClick={ ()=>{ImageActions.selectImage.onNext(img_);} }/>
                                    </GridTile>
                                ))}

                            </GridList>
                        </div>
                    );
                }.bind(this))}
            </div>
        );
    }
});





module.exports =  React.createClass({

    getDefaultProps:function(){
        return {
            isLoading:false,
            files:[]
        }
    },

    getInitialState:function(){
        return{
            cntrlPressed:false,
            shiftPressed:false
        }
    },

    componentDidMount: function () {
        window.addEventListener("keyup", this.handleOnKeyUp);
        window.addEventListener("keydown", this.handleOnKeyDown);

        this.selectImageSubscription = ImageActions.selectImage.subscribe(this.handleItemClick);
    },

    componentWillUnmount: function () {
        window.removeEventListener("keyup", this.handleOnKeyUp);
        window.removeEventListener("keydown", this.handleOnKeyDown);

        if( this.selectImageSubscription !== undefined ){
            this.selectImageSubscription.dispose();
        }
    },


    handleOnKeyUp:function(e){
        var key = e.keyCode ? e.keyCode : e.which;
        if (key == 91 || key == 17) { //command or control
            this.state.cntrlPressed = false;
        }
        else if (key == 16) { //shift
            this.state.shiftPressed = false;
        }
    },


    handleOnKeyDown:function(e){
        var key = e.keyCode ? e.keyCode : e.which;
        if (key == 91 || key == 17) { //command or control
            this.state.cntrlPressed = true;
        }
        else if (key == 16) { //shift
            this.state.shiftPressed = true;
        }
    },


    handleItemClick: function(e)
    {
        if( !this.state.shiftPressed ){
            this.state.lastSelectedImage = undefined;
        }

        // find current selected photo index
        var inSelectRange = false;
        for (var j = 0; j < this.props.files.length; j++)
        {
            var _group = this.props.files[j];

            for (var i = 0; i < _group.children.length; i++)
            {
                var _file = _group.children[i];
                if( this.state.lastSelectedImage && _file.path == this.state.lastSelectedImage.path ){
                    inSelectRange = true;
                }
                else if( _file.path == e.path ){
                    inSelectRange = false;
                    _file.active = true;
                    this.state.lastSelectedImage = _file;

                }
                else if( inSelectRange && this.state.shiftPressed  ){
                    _file.active = true;
                }
                else if( !this.state.cntrlPressed || (this.state.shiftPressed && !inSelectRange) ) {
                    _file.active = false;
                }
            }
        }


        if( this.props.onChange !== undefined ){
            this.props.onChange();
        }

        if (this.isMounted()) this.forceUpdate();
    },

    render(){
        
        return(
            <div style={{'display': 'flex', 'flexWrap': 'wrap', 'justifyContent': 'center'}}>
                {(() => {
                    if (this.props.isLoading)
                    {
                        return (
                            <div
                                style={{'display':'flex','flexWrap': 'wrap','justifyContent': 'center','alignItems': 'center', 'height':'100vh', }}>
                                <CircularProgress size={2}/>
                            </div>
                        );

                    } else if (this.props.files.length > 0)
                    {

                        return (
                            <GridGroup groups={this.props.files}/>
                        );
                    }
                    else
                    {
                        return (
                            <Subheader>No items found</Subheader>
                        );
                    }
                })()}

            </div>
        );
    }
});