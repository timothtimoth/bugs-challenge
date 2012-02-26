bugs.csvWidget = {
	requiredAPIs : [ bugs.Enum.CSV, bugs.Enum.DB, bugs.Enum.DATATABLE ],
	displayTable : bugs._,
	inputText : "simply paste csv content in this box and press enter",
	notCompatibleText : "Your browser does not support this module",
	
	init : function() {
		//create input editable box/landing pad
		var csvDiv = document.createElement("div");
		csvDiv.setAttribute("id", "csvDropper");
		csvDiv.setAttribute("contenteditable", "true");
		
		if(window.openDatabase && window.FileReader){

			//add event listeners for file drag and drop
	//		csvDiv.addEventListener('dragover', bugs.csvWidget.ehInputDragOver, false);
	//		csvDiv.addEventListener('drop', bugs.csvWidget.ehInputFileDrop, false);
			csvDiv.innerText = bugs.csvWidget.inputText;
	
			//add event listeners for csv paste
			csvDiv.addEventListener('focus', bugs.csvWidget.ehInputFocus, false);
			csvDiv.addEventListener('blur', bugs.csvWidget.ehInputFocus, false);
			csvDiv.addEventListener('keypress', bugs.csvWidget.ehInputKeypress, false);
			
		}
		else {
			csvDiv.innerText = bugs.csvWidget.notCompatibleText;
		}
		//add editable box/landing pad to page
		document.body.appendChild(csvDiv);
	},
	/*
	 * event handlers for text paste
	 * 
	 *  1) focus - clear the text if it is the original text
	 *  2) blur - put original text back if the text is blank - not working atm
	 *  3) keypress - submit on enter
	 */
	ehInputFocus : function(evt){
		if(evt.target.innerText == bugs.csvWidget.inputText){
			evt.target.innerText = "";
		}
	},
	ehInputBlur : function(evt){
		if(evt.target.innerText.trim() == ""){
			evt.target.innerText = bugs.csvWidget.inputText;
		}
	},
	ehInputKeypress : function(evt){
		if(evt.keyCode == 13){
			if(bugs.csvWidget.displayTable && bugs.csvWidget.displayTable._('tr', {"filter": "applied"}).length > 0){
				bugs.csvWidget.displayTable.fnClearTable();
			}
			bugs.csvWidget.processCSVData(evt.target.innerText);
			evt.target.blur();
		}
	},
	/*
	 * event handlers for file drop - has a security issue locally so currently
	 * not enabled
	 */
	ehInputFileDrop : function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		var csvString = bugs._;
		var file =  evt.target.files[0] || evt.dataTransfer.files[0];

		var reader = new FileReader();
		reader.onloadend = bugs.csvWidget.ehReaderOnload;
		
		reader.readAsBinaryString(file);
	
	},
	ehInputDragOver : function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	},
	
	ehReaderOnload: function(e){
		var contents = e.target.result;
		bugs.csvWidget.processCSVData(contents);
	},
	/*
	 * create the db, create persistence objs for the rows with average data,  display the data in a datatable 
	 */
	processCSVData : function(text){
		if(document.getElementById("display") == bugs._){
			var display = document.createElement("div");
			display.setAttribute("id", "display");
			document.body.appendChild(display);
			$('#display').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="example"></table>' );
		}
		//convert csv string to array of arrays using api from 
		dataArrays = bugs.csv.csvToArrays(text);
		
		//create a db
		persistence.store.websql.config(persistence, 'csv-bugs', 'DB for bug info from csv file', 5 * 1024 * 1024);
		
		//define the data model
		var DailyBugReport = persistence.define('DailyBugReport', {
			  date: "DATE",
			  severity1: "INT",
			  severity2: "INT",
			  severity3: "INT",
			  total_open: "INT",
			  toVerify : "INT",
			  incoming: "INT",
			  untargeted: "INT",
			  deferred : "INT",
			  average : "INT"
			});
		
		//create table
		persistence.schemaSync();
		
		//remove heeaders to a seperate array
		var dataHeaders = dataArrays.shift();
		
		//create persistence objs for each row
		for(var i = 0; i < dataArrays.length; i++){
			var dailyReportData = dataArrays[i]
			dailyReportData[9] = ((parseInt(dailyReportData[1]) + parseInt(dailyReportData[2]) + parseInt(dailyReportData[3]))/3).toFixed(2)
			var dbr = new DailyBugReport({
				date: dailyReportData[0],
				severity1: dailyReportData[1],
				severity2: dailyReportData[2],
				severity3: dailyReportData[3],
				total_open: dailyReportData[4],
				toVerify : dailyReportData[5],
				incoming : dailyReportData[6],
				untargeted : dailyReportData[7],
				deferred : dailyReportData[8],
		        average : dailyReportData[9]
			});
			persistence.add(dbr);
		}
		//add everything to the db
		persistence.flush();
		
		//display the whole mess in a datatable
		bugs.csvWidget.displayTable = $('#example').dataTable( {
			"bPaginate": false,
			"bLengthChange": false,
			"bFilter": false,
			"bAutoWidth": false,
			"bSort": false,
			"bInfo": false,
			"bJQueryUI" : true, 
			"aaData": dataArrays,
			"aoColumns": [
				{ "sTitle": dataHeaders[0] },
				{ "sTitle": dataHeaders[1] },
				{ "sTitle": dataHeaders[2] },
				{ "sTitle": dataHeaders[3] },
				{ "sTitle": dataHeaders[4] },
				{ "sTitle": dataHeaders[5] },
				{ "sTitle": dataHeaders[6] },
				{ "sTitle": dataHeaders[7], "sClass": "center" },
				{
					"sTitle": dataHeaders[8],
					"sClass": "center",
					"fnRender": function(obj) {
						var sReturn = obj.aData[ obj.iDataColumn ];
						if ( sReturn == "A" ) {
							sReturn = "<b>A</b>";
						}
						return sReturn;
					}
				},
				{ "sTitle": "Average Open" }
				
			]
		} );
		
	}
};

//setup the csvWidget for initialization
bugs.register(bugs.csvWidget);
