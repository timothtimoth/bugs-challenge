
//define controller/namespace
var bugs = {
	_ : function(){}(),
	registry : [],
	init : function(){
//		bugs.insertScriptTag(bugs.Enum.YUI);
		for(var o in bugs.registry){
			bugs.registry[o].init();
			if(bugs.registry[o].requiredAPIs){
				for(var key in bugs.registry[o].requiredAPIs)
					bugs.injectScriptDependancy(bugs.registry[o].requiredAPIs[key]);
			}
		}
	},
	register: function(obj){
		bugs.registry.push(obj);
	},
	injectScriptDependancy: function(key){
		if(bugs.scripts[key]){
			if(typeof(bugs.scripts[key]) == "string"){
				bugs.insertScriptTag(bugs.scripts[key]);
			}
			else{
				for(var s in bugs.scripts[key]){
					bugs.insertScriptTag(bugs.scripts[key][s]);
				}
			}
		}
	},
	insertScriptTag :  function(script){
		var scriptTag = document.createElement("script");
		scriptTag.setAttribute("src", script);
		scriptTag.setAttribute("type","text/javascript");
		document.getElementsByTagName("head")[0].appendChild(scriptTag);
	}
};

bugs.Enum = {
	CSV : "csv",
	DB : "db",
	DATATABLE : "datatable"
};

bugs.scripts = {};
bugs.scripts[bugs.Enum.DATATABLE] =  "js/jquery.dataTables.min.js";
bugs.scripts[bugs.Enum.CSV] = {
		"jquery.csv"  : "js/jquery.csv.js",
		"bugs.csv" : "js/csv.js"
};

bugs.scripts[bugs.Enum.DB] = {
	"base" : "js/persistence.js",
	"store" : "js/persistence.store.sql.js",
	"websql" : "js/persistence.store.websql.js"
};


(function() {
    //Non-IE
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", bugs.init, false);
    }
    // IE
    else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", 
        	function() {
	            if (document.readyState === "complete") {
	                document.detachEvent("onreadystatechange", arguments.callee);
	                bugs.init();
	            }
	        }
        );
    }
})();