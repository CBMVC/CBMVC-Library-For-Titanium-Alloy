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
    util = require('util'),
    debug = require('debug'),
    webService = Alloy.CFG.webService;
/**
 * HTTP Request Helper
 */
var Net = function() {};

Net.setWebService = function(ws) {
    webService = ws;
};

/**
 * Standard HTTP Request
 * @param {Object} opts
 * @example The following are valid options to pass through:
 *  opts.timeout    : int Timeout request
 *  opts.type       : string GET/POST
 *  opts.data       : mixed The data to pass
 *  opts.url        : the remote url to call
 *  opts.method     : the remote method to call
 *  opts.onerror    : funtion A function to execute when there is an XHR error
 *  opts.onload     : callback function in onload event
 *  opts.notToJSON  : whether return JSON format, default is return to JSON
 *  opts.returnXML  : whether return XML format, default is return Text
 *  opts.uploadFile : whether is upload file
 *  opts.urlParams  : the params for url
 */
Net.request = function(opts) {
    // Setup the xhr object
    var xhr = Ti.Network.createHTTPClient(),
        url = webService;

    //xhr.timeout = (opts.timeout) ? opts.timeout : 2000;

    //check the network status at first
    if (!Ti.Network.online) {
        Alloy.Globals.CB.Util.actInd.hide();
        if (!Alloy.Globals.CB.HasNetError) {
            Alloy.Globals.CB.HasNetError = true;
            util.alert(util.L('networkError'), util.L('error'));
        }
        return;
    }
    if (opts.url) {
        url = opts.url;
    }
    //check whether has defined a webservice
    if (!url) {
        Alloy.Globals.CB.Util.actInd.hide();
        Alloy.Globals.CB.HasNetError = true;
        util.alert(util.L('noWebService'), util.L('error'));
        return;
    }

    // Set the timeout or a default if one is not provided
    xhr.timeout = (opts.timeout) ? opts.timeout : 20000;
    /**
     * Error handling
     * @param {Object} e The callback object
     */
    xhr.onerror = function(e) {

        if (!Alloy.Globals.CB.Util.actInd.actIndWin.actInd.isHide) {
            Alloy.Globals.CB.Util.actInd.hide();
        }
        if (opts.onerror) {
            opts.onerror(e);
        } else {
            if (!Alloy.Globals.CB.HasNetError) {
                Alloy.Globals.CB.HasNetError = true;
                var alertDialog = Ti.UI.createAlertDialog({
                    title: Alloy.Globals.CB.Util.L('error'),
                    message: Alloy.Globals.CB.Util.L('networkError'),
                    buttonNames: ['OK']
                });

                alertDialog.show();
                // if (Alloy.CFG.isDebug) {
                //     alert(e);
                // } else {
                //     Alloy.Globals.CB.HasNetError = true;
                //     var alertDialog = Ti.UI.createAlertDialog({
                //         title: Alloy.Globals.CB.Util.L('error'),
                //         message: Alloy.Globals.CB.Util.L('networkErr'),
                //         buttonNames: ['OK']
                //     });

                //     alertDialog.show();
                // }
                Ti.API.error(e);
            }
        }
        xhr = null;
    };


    /**
     * When XHR request is loaded
     * @returns {Mixed}
     */
    xhr.onload = function() {
        // If successful
        //debug.dump(this.responseText, 86, 'net.js');
        //debug.dump(this.responseXML, 86, 'net.js');
        try {
            if (opts.isDownload) {
                opts.onload && opts.onload(xhr.status, this.responseData);
            } else if (opts.returnXML) {
                opts.onload(this.responseXML);
            } else {
                var data = this.responseText;
                //debug.dump(data, 99, 'net.js');
                if (data) {
                    if (!opts.notToJSON) {
                        data = JSON.parse(data);
                    }
                    if (opts.onload) {
                        opts.onload(data);
                    } else {
                        return data;
                    }
                }
            }
        }
        // If not successful
        catch (e) {
            xhr.onerror(e);
        }
    };

    xhr.ondatastream = function(data) {
        try {
            opts.ondatastream && opts.ondatastream(data);
        } catch (e) {
            xhr.onerror(e);
        }
    };


    xhr.onsendstream = function(data) {
        try {
            opts.onsendstream && opts.onsendstream(data);
        } catch (e) {
            xhr.onerror(e);
        }
    };


    // Open the remote connection
    if (opts.method) {
        url += opts.method;
    }

    if(opts.urlParams){
        url += opts.urlParams.lang + '/' + opts.urlParams.controller + '/' + opts.urlParams.action;
    }
    Alloy.Globals.CB.Debug.echo(url, 159, 'net=========');
    if (opts.type) {
        xhr.open(opts.type, url);
    } else {
        xhr.open('POST', url);
    }

    xhr.setRequestHeader('enctype', 'multipart/form-data');

    //xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    //xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
    // if(opts.uploadFile){
    //    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    //    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // }


    if (opts.data) {
        // send the data
        //xhr.send(Ti.Network.encodeURIComponent(JSON.stringify(opts.data)));
        xhr.send(opts.data);
    } else {
        xhr.send(null);
    }
};

/*
 * download a remote file
 * fileInfo.url              : url for download the remote file
 * fileInfo.filename         : file name for saved
 * fileInfo.updateProgress   : update download progressbar
 * fileInfo.complete         : complete function after download
 */
Net.downloadRemoteFile = function(fileInfo) {
    var requestObj = {
        url: fileInfo.url,
        type: 'GET',
        isDownload: true,
        onerror: function(d) {
            debug.dump(d, 120, 'net.js error');
            Alloy.Globals.CB.Util.progressBar.hide();
            alert('Download file failed!')
            //debug.echo(util.getAppDataDirectory(), 117, 'new.js');
        },
        ondatastream: function(data) {
            //debug.echo('start==folder: ===' + data.progress, 123, 'new.js');
            if (data && fileInfo.updateProgress) {
                var value = parseInt(data.progress * 100, 10);
                fileInfo.updateProgress(value);
            }
        },
        onload: function(status, data) {
            debug.echo('status: ' + status, 208, 'net.js');
            var directory = Ti.Filesystem.getFile(util.getAppDataDirectory() + Alloy.CFG.downloadFolder);
            if (!directory.exists()) {
                directory.createDirectory();
            }
            var filename = directory.resolve() + Ti.Filesystem.separator + fileInfo.filename;
            if (status == 200) {
                if (data) {
                    var file = Ti.Filesystem.getFile(filename);
                    file.write(data); //download complete!
                    fileInfo.complete(filename);
                    file = null;
                }
            } else {
                debug.echo('File not found!  : ' + filename, 150, 'net.js');
            }
            directory = null;
        }
    };
    Net.request(requestObj);
};

/**
 * Batch download files
 * @param  {Array} files ,
 * [
 *    {url: file url},
 *    {name: file name}
 * ]
 * @param  {Function} a callback function when download all files
 */
Net.downloadBatchFiles = function(files, callback, downloadedFiles) {
    var total = files.length;
    if (downloadedFiles === undefined) {
        downloadedFiles = [];
    }
    if (total > 0) {
        util.progressBar.setCounter(1);
        Net.downloadRemoteFile({
            url: files[total - 1].url,
            filename: files[total - 1].name,
            updateProgress: function(progressValue) {
                util.progressBar.setValue(progressValue);
            },
            complete: function(filename) {
                downloadedFiles.push(filename);
                files.pop();
                Net.downloadBatchFiles(files, callback, downloadedFiles);
            }
        });
    } else {
        callback && callback(downloadedFiles);
    }
};



module.exports = Net;