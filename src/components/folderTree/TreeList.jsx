'use strict';

var React = require('react');

import {Subheader, List, ListItem, IconButton} from 'material-ui';
import FolderIcon from 'material-ui/svg-icons/file/folder';

var FileActions = require('./../../actions/FileActions');
var DirectoryActions = require('./../../actions/DirectoryActions');
var DirectoryStore = require('./../../stores/DirectoryStore');


module.exports = React.createClass({

    getDefaultProps: function () {
        return {
            title: "",
            data:[]
        }
    },


    /**
    componentWillReceiveProps: function (nextProps_) {
        if (nextProps_.data !== undefined)
        {
            this.props.data = nextProps_.data;
            if( this.isMounted() ) this.forceUpdate();
        }
    },
     **/


    _onClickHandler: function (path_) {
        FileActions.getFiles.source.onNext(path_);
    },


    getListItem: function (items_) {
        return items_.map((item_)=> {
            return (
                <ListItem key={item_.path}
                          primaryText={item_.name}
                          onTouchTap={()=>{this._onClickHandler(item_.path)}}
                          nestedItems={this.getListItem(item_.children)}
                          style={{'fontSize':'13px', 'lineHeight':'13px'}}/>
            );
        })

        //leftIcon={<FolderIcon />}
        //leftIcon={<IconButton iconClassName="material-icons" >folder</IconButton>}
    },


    render(){
        debugger;

        return (
            <List>
                <Subheader>{this.props.title}</Subheader>
                {this.getListItem(this.props.data)}
            </List>
        );
    }

});

