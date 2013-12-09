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

var Alloy = require('alloy');

var Debug = {

	/**
	 * General echo the debug message
	 * @param {String} s, echo which debug message
	 * @param {int} line, the line of echo message
	 * @param {String} page, the page  which debug message show
	 * @param {String} type, debug type, support Titanium debug type:
	 *       info: display message with [INFO] style in console
	 *       warn: display message with [WARN] style in console (default)
	 *       error: display message with [ERROR] style in console
	 */
	echo: function(s, line, page, type) {
		if(Alloy.CFG.isDebug) {
			var debugType = Alloy.CFG.msgType;
			var msgTitle = '[CB Debug Message]';

			if(page !== null && page !== undefined) {
				msgTitle = '[CB Debug Message in ' + page + ' ]';
			}

			if(line !== null && line !== undefined) {
				msgTitle += ' Line ' + line + ' : ';
			}

			if(type !== null && type !== undefined) {
				debugType = type;
			}
			Ti.API.warn(msgTitle);
			Ti.API[debugType](s);
		}
	},

	/**
	 * General dump the object
	 * @param {Object} o, dump object
	 * @param {int} line, the line of debug object
	 * @param {String} page, the page  which debug message show
	 * @param {String} type, debug type, support Titanium debug type:
	 *       info: display message with [INFO] style in console
	 *       warn: display message with [WARN] style in console (default)
	 *       error: display message with [ERROR] style in console
	 */
	dump: function(o, line, page, type) {

		if(Alloy.CFG.isDebug) {
			var debugType = Alloy.CFG.msgType;
			var msgTitle = '[CB Debug Dump Object]';

			if(page !== null && page !== undefined) {
				msgTitle = '[CB Debug Dump Object in ' + page + ' ]';
			}

			if(line !== false) {
				msgTitle += ' Line ' + line;
			}
			if(type !== null && type !== undefined) {
				debugType = type;
			}

			Ti.API.warn(msgTitle);
			if(o) {
				Ti.API[debugType](JSON.stringify(o));
			} else {
				Ti.API[debugType](o);
			}
		}
	}

}
module.exports = Debug;