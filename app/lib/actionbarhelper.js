/* 
* ActionBar Helper Class for Appcelerator Titanium
* Author: Ricardo Alcocer
* 
* Licensed under the MIT License (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://alco.mit-license.org/
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var actionBarHelper=function(win){
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		this.win=win;
		this.activity=win.getActivity();
		this.actionBar=this.activity.actionBar;
	}else{
		console.log('This is an Android-only library.');
	}
}
actionBarHelper.prototype.setTitle=function(title){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				that.actionBar.title=title;		
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.setUpAction=function(action){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				if(action){
					that.actionBar.displayHomeAsUp=true;	
					that.actionBar.onHomeIconItemSelected=action;
				}else{
					that.actionBar.displayHomeAsUp=false;
					that.actionBar.onHomeIconItemSelected=null;
				}
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.setBackgroundImage=function(image){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				that.actionBar.backgroundImage=image;	
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.setIcon=function(icon){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				that.actionBar.icon=icon;	
				that.actionBar.logo=icon;
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.hide=function(){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				that.actionBar.hide();
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.show=function(){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			if (that.actionBar){
				that.actionBar.show();
			}else{
				console.log('Error: I don\'t see an action bar here');
			}	
		}		
	}
}
actionBarHelper.prototype.reloadMenu=function(){
	var that=this;
	if (OS_ANDROID && Ti.Platform.Android.API_LEVEL > 11){
		if (!that.activity){
			console.log('Error: Unable to get activity...weird');
		}else{
			that.activity.invalidateOptionsMenu();
		}		
	}
}
//
exports.actionBarHelper=actionBarHelper;