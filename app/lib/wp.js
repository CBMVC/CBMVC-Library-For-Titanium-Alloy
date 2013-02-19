/**
 * @file overview This file contains the core framework class CBMVC_Alloy.
 * @author Winson  winsonet@gmail.com
 * @copyright Winson http://www.coderblog.in
 * @license MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * @disclaimer THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


var Alloy = require('alloy'),
    net = require('net'),
    util = require('util'),
    debug = require('debug'),
    xml2json = require('xml2json');

var WP = function(){};

/**
 * Generate struct tags for xml-rpc params
 * @param  {[type]} tags [description]
 */
var genStructTag = function(tags){
    var xmldata = '<struct>';
                for (var s in tags)
                {
                    if(s){
                        var struct = tags[s];
                        xmldata += '<member>' + '<name>'+struct.name+'</name>';
                        if(struct.type == 'array'){
                            xmldata += '<value>'+genArrayTag(struct.value)+'</value>';
                        }else{
                            xmldata += '<value><'+struct.type+'>'+struct.value+'</'+struct.type+'></value>';
                        }
                        xmldata += '</member>' ;
                    }
                }
        xmldata += '</struct>';
    return xmldata;
};

/**
 * Generate array tags for xml-rpc params
 * @param  {[type]} tags [description]
 */
var genArrayTag = function(tags){
    var xmldata = '<array><data>';
                for (var s in tags)
                {
                    if(s){
                        var arr = tags[s];
                        if(arr.type == 'struct'){
                            xmldata += genStructTag(arr.value);
                        }else{
                            xmldata += '<value><'+arr.type+'>'+arr.value+'</'+arr.type+'></value>' ;
                        }
                    }
                }
        xmldata += '</array></data>';
    return xmldata;
};

/**
 * use xml-rpc to get or handle remote data
 * @param  {string} args.url        : the remote url, default will use the webservice setting value
 * @param  {string} args.method     : the remote method
 * @param  {string} args.params     : the params of remote method
 *   the params format should be : [
 *       {name:'userid', type:'int', value:'1'},
 *       {name:'pwd', type:'string', value:'123456'}
 *   ]
 * @param  {string} args.startLevel : which level need to start convert with xmp-rpc data
 * @param  {string} args.callback   : the callback function
 */
WP.xmlRPC = function(args){

    if(!args.url){
        args.url = Alloy.CFG.webService + Alloy.CFG.xmlrpcService;
    }
    var xmldata = '<methodCall>';
    xmldata += '<methodName>'+args.method+'</methodName>';
    xmldata += '<params>';
    for (var k in args.params)
    {
        if (k)
        {
            var p = args.params[k];
            //debug.dump(p,291,'net');
            xmldata += '<param>';
            switch(p.type ) {
                case 'struct':
                    xmldata += genStructTag(p.value);
                    break;
                case 'array':
                    xmldata += genArrayTag(p.value);
                    break;
                default:
                    xmldata += '<'+p.type+'>'+p.value+'</'+p.type+'>';
                    break;
            }
            xmldata += '</param>';
        }
    }
    xmldata += '</params></methodCall>';
    debug.echo(xmldata,113,'wp.js');
    var requestObj = {
        url: args.url,
        data: xmldata,
        type: 'POST',
        //returnXML: true,
        notToJSON: true,
        onerror: function(d) {
            debug.dump(d, 121, 'wp.js error');
        },
        onload: function(result) {

            debug.dump(result,125,'wp.js');
            var returnObj=xml2json.parser(result,args.startLevel);
            util.actInd.hide();

            args.callback && args.callback(returnObj);
        }
    };

    util.actInd.show();
    net.request(requestObj);

};

module.exports = WP;
