import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import logoNYU from '../images/nyu_logo_purple.png';

import { } from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';
//import Body from './Body';
import {Toolbar, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import FontIcon from 'material-ui/FontIcon';
import Model from 'material-ui/svg-icons/image/blur-linear';
import SwitchDomain from 'material-ui/svg-icons/maps/transfer-within-a-station';
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
import { FormControl} from 'react-bootstrap';
import Search from 'material-ui/svg-icons/action/search';
import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import Body from './Body';
import TextField from 'material-ui/TextField';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import CircularProgress from 'material-ui/CircularProgress';

import $ from 'jquery';

const styles = {
  backgound: {
    background: "#50137A"
  },
  titleText: {
    color: 'white'
  },
  toolBarHeader: {
    width:'75%',
    height:45,
    marginTop:8,
    marginRight:'-15px',
    background:'#B39DDB',
    borderRadius: '5px 5px 5px 5px',
    borderStyle: 'solid',
    borderColor: '#7E57C2#B39DDB',
    borderWidth: '1px 0px 1px 0px'
  },
  toolBarCurrentDomain:{
    marginLeft: '0px',
    marginRight: '0px'
  },
  tittleCurrentDomain:{
    fontSize: 15,
    textTransform: 'uppercase',
    color: 'black', fontWeight:'bold',
    paddingLeft: '3px',
    paddingRight: '0px',
    marginTop: '-5px',
  },
  toolBarGroupChangeDomain:{
    marginLeft: '0px',
    marginRight: '2px'
  },
  buttons:{
    margin: '-10px',
    marginTop:5,
    width:35,
    border:0,
  },

};

class Header extends Component {

  constructor(props){
    super(props);
    this.state = {
      currentDomain:'',
      term:'',
      disableStopCrawlerSignal:true,
      disabledStartCrawler:true, //false
      disabledCreateModel:true, //false
      messageCrawler:"",
      openCreateModel: false,
      currentTags:undefined,
      tagsPosCheckBox:["Relevant"],
      tagsNegCheckBox:["Irrelevant"],
      loadingModel:false,

      noModelAvailable:true, //the first time we dont have a model
    };

    this.intervalFuncId = undefined;
  }

  componentWillMount(){
    this.setState({currentDomain: this.props.currentDomain});
  };

  componentWillReceiveProps  = (nextProps) => {
    if(nextProps.deleteKeywordSignal){ this.setState({term:""});}
    if(nextProps.reloadHeader){
      this.setState({ disableStopCrawlerSignal:true, disabledStartCrawler: false, disabledCreateModel:false, messageCrawler:""});
      this.forceUpdate();
    }
    if(nextProps.noModelAvailable !== this.state.noModelAvailable ){
      if(!nextProps.noModelAvailable){ //if there is a model
          this.getStatus();
      }
      else this.setState({noModelAvailable:true, disableStopCrawlerSignal:true, disabledStartCrawler:true,  disabledCreateModel:true,});
      //this.setState({currentDomain: nextProps.currentDomain, disabledStartCrawler:false, disabledCreateModel:false,});
      }
    else {return;}
    }

    shouldComponentUpdate(nextProps, nextState) {
      if(nextProps.deleteKeywordSignal){ return true; }
      if(nextProps.reloadHeader){ return true; }
      if(nextProps.noModelAvailable !== this.state.noModelAvailable){ return true; }
      if(nextState.term !==this.state.term || nextState.openCreateModel ){ return true; }

      /*if (nextProps.currentDomain === this.state.currentDomain ) {
        if(nextProps.disabledStartCrawler !== this.state.disabledStartCrawler) {return true;}
        return false;
      }*/
      return false;
    }

   filterKeyword(terms){
     this.props.filterKeyword(terms);
   }

   createSession(domainId){
      var session = {};
      session['search_engine'] = "GOOG";
      session['activeProjectionAlg'] = "Group by Correlation";
      session['domainId'] = domainId;
      session['pagesCap'] = "100";
      session['fromDate'] = null;
      session['toDate'] = null;
      session['filter'] = null;//null;
      session['pageRetrievalCriteria'] = "Most Recent";
      session['selected_morelike'] = "";
      session['selected_queries']="";
      session['selected_tlds']="";
      session['selected_aterms']="";
      session['selected_tags']="";
      session['selected_model_tags']="";
      session['model'] = {};
      session['model']['positive'] = "Relevant";
      session['model']['nagative'] = "Irrelevant";
      return session;
   }


   getStatus(){
     var session = this.createSession(this.props.idDomain); // {'domainId':this.state.idDomain};
     $.post(
       '/getStatus',
       {'session': JSON.stringify(session)},
       function(result) {
         var status = JSON.parse(JSON.stringify(result));
         //console.log(status);
         if(status !== undefined) {
           var message = status.crawler;
           //console.log("GET STATUS");
           //console.log(message);
           if( message !== undefined){
             var disableStopCrawlerFlag = true;
             var disabledStartCrawlerFlag = false;
             if(message === "Crawler is running"){
               disableStopCrawlerFlag = false;
               disabledStartCrawlerFlag = true;
             }else if(message === "Crawler shutting down"){
               disabledStartCrawlerFlag = true;
             }
             this.setState({disableStopCrawlerSignal:disableStopCrawlerFlag, disabledStartCrawler:disabledStartCrawlerFlag, disabledCreateModel:false, messageCrawler:message});
             this.forceUpdate();
           }else {
             if(this.intervalFuncId !== undefined){
               //console.log("CLEAR INTERVAL");
              // console.log(this.intervalFuncId);
               this.setState({ disableStopCrawlerSignal:true, disabledStartCrawler: false, disabledCreateModel:false, messageCrawler:""});
               this.forceUpdate();
               //console.log("updating render");
               setTimeout(function(){
                   window.clearInterval(this.intervalFuncId);
                   this.intervalFuncId = undefined;
               }.bind(this), 1800);

             }
             else {
               this.setState({disabledStartCrawler:false, disabledCreateModel:false, noModelAvailable:false,});
               this.forceUpdate();
             }
           }
         }
       }.bind(this)
     );
   }

   setStatusInterval(){
     //console.log("INTERVAL FUNC ID");
     //console.log(this.intervalFuncId);
     if(this.intervalFuncId === undefined){
       this.intervalFuncId = window.setInterval(function() {this.getStatus();}.bind(this), 1000);
       //console.log(this.intervalFuncId);
     }
   }

   startCrawler(){
     var session = this.createSession(this.props.idDomain);
     var message = "Crawler is running";
     this.setState({disableStopCrawlerSignal:false, disabledStartCrawler:true, messageCrawler:message});
     this.forceUpdate();
     $.post(
       '/startCrawler',
       {'session': JSON.stringify(session)},
       function(message) {
         var disableStopCrawlerFlag = false;
         var disabledStartCrawlerFlag = true;
         if(message !== "Crawler is running"){
           disableStopCrawlerFlag = true;
           disabledStartCrawlerFlag = true;
         }
         this.setState({ disableStopCrawlerSignal:disableStopCrawlerFlag, disabledStartCrawler:disabledStartCrawlerFlag, messageCrawler:message});
         this.forceUpdate();
       }.bind(this)
     );
   }

   stopCrawler(flag){
     var session = this.createSession(this.props.idDomain);
     var message = "Crawler shutting down"
     if(flag) this.setStatusInterval();
     this.setState({disableStopCrawlerSignal:true, disabledStartCrawler:true, messageCrawler:message,});
     this.forceUpdate();
     $.post(
       '/stopCrawler',
       {'session': JSON.stringify(session)},
       function(message) {
         //console.log("STOP CRAWLER");
         //console.log(message);
         this.setState({ disableStopCrawlerSignal:true, disabledStartCrawler: false, disabledCreateModel:false, messageCrawler:""});
         this.forceUpdate();
         this.props.updateHeader();
         // this.setState({messageCrawler:message, disabledStartCrawler:false,});
         // this.forceUpdate();
         // setTimeout(function(){
         //   this.setState({messageCrawler:"",});
         //   this.forceUpdate();
         //}.bind(this), 700);
       }.bind(this)
     );
   }

   handleOnRequestChange = (event, value)=> {
     var session = this.createSession(this.props.idDomain);
     if(value == 2){
       this.getAvailableTags(session);
       this.setState({ openCreateModel: true });
     }
     else{
       this.createModel();
     }
  }

   handleOpenCreateModel = () => {
     this.setState({openCreateModel: true});
   };

   handleCloseCreateModel = () => {
     this.setState({openCreateModel: false});
     this.forceUpdate();
   };

   handleCloseCancelCreateModel = () => {
     this.setState({openCreateModel: false});
     this.setState({  tagsPosCheckBox:["Relevant"], tagsNegCheckBox:["Irrelevant"],})
     this.forceUpdate();
   };

   getAvailableTags(session){
     $.post(
        '/getAvailableTags',
        {'session': JSON.stringify(session), 'event': 'Tags'},
        function(tagsDomain) {
          //tagString: JSON.stringify(this.props.session['selected_tags'])
          this.setState({currentTags: tagsDomain['tags']}); //, session:this.props.session, tagString: JSON.stringify(this.props.session['selected_tags'])});
          this.forceUpdate();
        }.bind(this)
      );
   }
   getCreatedModel(session){
     $.post(
        '/createModel',
        {'session': JSON.stringify(session)},
        function(model_file) {
          var url = model_file;
          window.open(url,'Download');
          this.setState({loadingModel:false, disabledCreateModel:false})
          this.forceUpdate();
        }.bind(this)
      );
   }
   //Create model
   createModel(){
     //createNewDomain
     var session = this.createSession(this.props.idDomain);
     this.setState({loadingModel:true, disabledCreateModel:true});
     this.forceUpdate();
     this.getCreatedModel(session);
   };

   addPosTags(tag){
      var tags = this.state.tagsPosCheckBox;
      if(tags.includes(tag)){
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
      }
      else{
        tags.push(tag);
      }
      this.setState({tagsPosCheckBox:tags})
      this.forceUpdate();
   }

   addNegTags(tag){
      var tags = this.state.tagsNegCheckBox;
      if(tags.includes(tag)){
        var index = tags.indexOf(tag);
        tags.splice(index, 1);
      }
      else{
        tags.push(tag);
      }
      this.setState({tagsNegCheckBox:tags})
      this.forceUpdate();
   }

   render() {
     //console.log("RENDER HEADER ");
     const actionsCreateModel = [
                                 <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseCancelCreateModel} />,
                                 <FlatButton label="Save"   primary={true} keyboardFocused={true} onTouchTap={this.handleCloseCreateModel} />,
                                ];

     var checkedTagsPosNeg = (this.state.currentTags!==undefined) ?
                             <div>
                               <p>Positive</p>
                                 {Object.keys(this.state.currentTags).map((tag, index)=>{
                                   var labelTags=  tag+" " +"(" +this.state.currentTags[tag]+")";
                                   var checkedTag=false;
                                   var tags = this.state.tagsPosCheckBox;
                                   if(tags.includes(tag))
                                      checkedTag=true;
                                   return <Checkbox label={labelTags} checked={checkedTag}  onClick={this.addPosTags.bind(this,tag)} />
                                 })}
                              <p>Negative</p>
                                 {Object.keys(this.state.currentTags).map((tag, index)=>{
                                   var labelTags=  tag+" " +"(" +this.state.currentTags[tag]+")";
                                   var checkedTag=false;
                                   var tags = this.state.tagsNegCheckBox;
                                   if(tags.includes(tag))
                                   checkedTag=true;
                                   return <Checkbox label={labelTags} checked={checkedTag}  onClick={this.addNegTags.bind(this,tag)} />
                                 })}
                               </div>:<div />;

     var loadingModel = (this.state.loadingModel)?<CircularProgress style={{marginTop:15, marginLeft:"-30px"}} size={20} thickness={4} />: <div/>;
     var crawlingProgress = (this.state.disableStopCrawlerSignal)?<div />: <CircularProgress style={{marginTop:15, marginLeft:"-10px"}} size={20} thickness={4} />;
     var messageCrawlerRunning = (this.state.disabledStartCrawler)?<div style={{marginTop:15, fontFamily:"arial", fontSize:14 , fontWeight:"bold"}}>{this.state.messageCrawler} </div>:"";
     var crawler = (this.state.disableStopCrawlerSignal)?<div/>:<RaisedButton  onClick={this.stopCrawler.bind(this, true)} style={{height:20, marginTop: 15, minWidth:58, width:48}} labelStyle={{textTransform: "capitalize"}} buttonStyle={{height:19}}
                   label="Stop" labelPosition="before" containerElement="label"/>;
     var messageCrawler= <div style={{marginTop:15, fontFamily:"arial", fontSize:12 , fontWeight:"bold"}}>{this.state.messageCrawler} </div>;


     return (
       <AppBar showMenuIconButton={true} style={styles.backgound} title={<span style={styles.titleText}> Domain Discovery Tool </span>}
        iconElementLeft={<img src={logoNYU}  height='45' width='40'  />} >
         <Toolbar style={styles.toolBarHeader}>
             <ToolbarTitle text={this.state.currentDomain} style={styles.tittleCurrentDomain}/>
             <ToolbarSeparator style={{ marginTop:"5px"}} />
                 <Link to='/'>
                  <IconButton tooltip="Change Domain" style={{marginLeft:'-15px'}} > <SwitchDomain /> </IconButton>
                 </Link>
             <ToolbarSeparator style={{ marginTop:"5px", marginLeft:"-20px"}} />
             <RaisedButton onClick={this.startCrawler.bind(this)} disabled={this.state.disabledStartCrawler} style={{ height:20, marginTop: 15, minWidth:118, width:118}} labelStyle={{textTransform: "capitalize"}} buttonStyle={{height:19}}
                           label="Start Crawler" labelPosition="before" containerElement="label" />
             {crawler}
             {messageCrawlerRunning}
             {crawlingProgress}

             <IconMenu
             iconButtonElement={<RaisedButton disabled={this.state.disabledCreateModel} style={{height:20, marginTop: 15,minWidth:68, width:68}} labelStyle={{textTransform: "capitalize"}} buttonStyle={{height:19}}
             label="Model" labelPosition="before" containerElement="label" />} onChange={this.handleOnRequestChange.bind(this)}>
                 <MenuItem value="1" primaryText="Create Model" />
                 <MenuItem value="2" primaryText="Settings" />
             </IconMenu>
             {loadingModel}
             <ToolbarSeparator style={{ marginTop:"5px"}} />
             <TextField
             style={{width:'25%',marginRight:'-80px', marginTop:5, height: 35, borderColor: 'gray', borderWidth: 1, background:"white", borderRadius:"5px"}}
             hintText="Search ..." hintStyle={{marginBottom:"-8px", marginLeft:10}} inputStyle={{marginBottom:10, marginLeft:10}} underlineShow={false}
             value={this.state.term} onKeyPress={(e) => {(e.key === 'Enter') ? this.filterKeyword(this.state.term) : null}} onChange={e => this.setState({ term: e.target.value })}
             />
             <IconButton style={{marginRight:'-25px'}} onClick={this.filterKeyword.bind(this, this.state.term)}>
                <Search />
             </IconButton>

             <Dialog title=" Model Settings" actions={actionsCreateModel} modal={false} open={this.state.openCreateModel} onRequestClose={this.handleCloseCreateModel.bind(this)}>
                {checkedTagsPosNeg}
             </Dialog>
         </Toolbar>
       </AppBar>
     );
   }
 }

 export default Header;
