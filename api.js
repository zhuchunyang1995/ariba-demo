var request = require('request-promise');
var dateFormat = require('dateformat');
var pw = require('./credentials.js');

exports.get_fg_token = function(memory){
	var post_options = {
	    uri:    "https://psg4.fgvms.com/api/oauth2/v2.0/token", // token call
	    method:  "POST",
	    headers: {
	    	"Content-Type": "application/x-www-form-urlencoded",
	    	"Authorization": pw.FG_AUTH,
	    	"X-ApplicationKey": pw.FG_APP_KEY_TOKEN
	    },
	    form: {
	    	"grant_type": "client_credentials",
	    	"response_type": "token"
	    }
	};

	return request.post(post_options)
	.then( function(token_data) {
		token_data = JSON.parse(token_data);
		console.log("token: " + token_data.access_token);
		return token_data;
	})	
}

exports.call_api_worker_req_create = function(token_data, memory){	
	post_options = {
		uri:    "https://psg4.fgvms.com/api/v1/saphire-demo/job-postings",
	   	method:  "POST",
	   	headers: {
	   		"Content-Type": "application/json",
	   		"Authorization": token_data.access_token || "",
	   		"X-ApplicationKey":pw.FG_APP_KEY  
	   	}
	}

	return request.post(post_options)
	.then( function(data_){
		console.log('[POST] Request completed /job-postings')
		data = JSON.parse(data_);
		title = data.jobTitle.replace(/[0-9]/g, '').replace(/[{()}]/g, '');
		code = data.jobCode.replace(/\D/g,'');;
		status = data.status;

		var date = new Date();
		date.setDate(date.getDate() + 1);
		start_date = dateFormat(date, "mmmm dS, yyyy");
		date.setDate(date.getDate() + memory.duration.days);
		end_date = dateFormat(date, "mmmm dS, yyyy");

		res_data = [{
			"type": 'text',
			"content": "Please confirm the following details:\n" +
					   "Job Title: " + title + "\n" +
					   "Job Code: " + code + "\n" +
					   "Start Date: " + start_date + "\n" +
					   "End Date: " + end_date + "\n\n" +
					   "Should I proceed?"					   
		},{
      		"type": "quickReplies",
      		"content": {
      			"title": "",
      		  	"buttons": [{
      		      	"value": "Yes",
      		      	"title": "Yes"
      		    },{
      		      	"value": "No",
      		      	"title": "No"
      		  	}]
      	}}];

      	return res_data;
	})
	.catch(function (err) {
		console.log(err);
		return [{
			"type": 'text',
			"content": "There was an error with the backend call." 				   
		}];
	});
};

exports.call_api_worker_req_submit = function(token_data){
		post_options = {
			uri:    "https://psg4.fgvms.com/api/v1/saphire-demo/job-postings", // token call
	    	method:  "POST",
	    	headers: {
	    		"Content-Type": "application/json",
	    		"Authorization": token_data.access_token || "",
	    		"X-ApplicationKey": "9tH7u7t8gXGgG8JqZYQ9qtxDKu8Z9vz5"
	    	}
		}

	return request.post(post_options)
	.then( function(data_) {
		data = JSON.parse(data_);
		title = data.jobTitle;
		code = data.jobCode;
		
		console.log('[POST] Request completed /job-postings 2')
		
		res_data = [{
			"type": 'text',
			"content": "The following contingent worker requisition has been submitted"
		},{
			"type": 'card',
			"content": {
		    	"title": title,
		    	"subtitle": code,
		    	"imageUrl": '',
	    		"buttons": []
		    }
		}];
		return res_data;
	})
	.catch(function (err) {
		console.log(err);
		return [{
			"type": 'text',
			"content": "There was an error with the backend call." 				   
		}];
	});
};




const ordinal_values = [
	"first",
	"second",
	"third",
	"fourth",
	"fifth",
	"sixth",
	"seventh",
	"eighth",
	"ninth",
	"tenth",
	"eleventh",
	"12th",
	"thirteenth",
	"fourteenth",
	"fifteenth",
	"sixteenth",
	"seventeenth" ];

exports.call_api_approval_show = function(item){
	var opts = "?realm=mytestrealm";

	var get_options = {
		uri: " https://openapi.ariba.com/api/approval-copilot/v1/sandbox/requisitions/" + item.title + opts,
		method: "GET",
		json: true,
		headers: {
			"apiKey": pw.ARIBA_APP_KEY
		}
	};

	return request.get(get_options)
	.then (function(req_data) {
		console.log("[POST] approval_show Request completed");
		console.log(req_data);
		res_data = {};
		res_data.reply = [{
			"type" : "text",
			"content": req_data.title + "\n" + item.title + "\n \n" + "Approver Id: \n" + req_data.activeApprovalRequestIds + "\n \n" + 
			"LineItem Count: \n" + req_data.lineItemCount +"\n \n" + "Amount: " + "\n" + item.details.price + item.details.currency
		},
		{"type" : "buttons",
		 "content": {
		 	"title":"",
		 	"buttons":[{
		 		"title":"Comment",
		 		"value":"Comment",
		 		"type" : "postback"},
		 		{
		 		"value":"Approve the " + item.title,
		 		"title":"Approve", //bug
		 		"type" : "postback"},
		 		{
		 		"title":"Reject",
		 		"value":"Reject the " + item.title,
		 		"type" : "postback"}
		 		]
		 }}]
		 res_data.selected_approval = item;
		return res_data;
	})
	.catch(function (err) {
		console.log(err);
		return [{
			"reply": {
				"type": 'text',
				"content": "There was an error with the backend call."
			}				   
		}];
	});
};

exports.call_api_approval_search = function(){
	var opts = "?realm=mytestrealm";

	var get_options = {
		uri: 	" https://openapi.ariba.com/api/approval-copilot/v1/sandbox /changes" + opts,
		method: "GET",
		json: 	true,
		headers:{
			"apiKey": pw.ARIBA_APP_KEY
		}
	};

	return request.get(get_options)
	.then( function(req_data){
		console.log("[POST] Approval Request completed");
		console.log(req_data);
		res_data = {};
		if (req_data.length  === 0){
			res_data.reply = [{
			"type": "text",
			"content": "you dont have any approval requests now"
			}];
		}
		else{
			approval_list = [];
			var count = 0;
			req_data.content.forEach ( function(elem){
				var list_item = {
					"title": elem.approvableUniqueName,
					"subtitle": "price: " + elem.price + " " + elem.currency,
					"buttons": [{
						"value" : "Select the " + ordinal_values[count],
						"title" : "Select",
						"type" : "postback"
					}],
					"details": {
						"documentType": elem.documentType,
						"changeSequenceId":elem.changeSequenceId,
						"changeParameters":elem.changeParameters,
						"price":elem.price,
						"currency":elem.currency,
						"approverId":elem.approverId
					}
				}

				approval_list.push(list_item);
				count++;
			});

			res_data.reply = [{
			"type": "text",
			"content": "you have " + req_data.totalElements + " approvals"
			},{
				"type": "list",
				"content":{
					"title":"Approval List",
					"elements": approval_list
				}
			}
			];
		}
		res_data.approval_list = approval_list;
		return res_data;

	})
	.catch(function (err) {
		return [{
			"reply": {
				"type": 'text',
				"content": "There was an error with the backend call."
			}				   
		}];
	});
};


exports.call_api_catalog_search = function(memory){

	var query_obj 	= memory.product ? JSON.parse(memory.product) : JSON.parse(memory.organization);
	var query     	= query_obj      ? query_obj[0].raw.charAt(0).toUpperCase() + query_obj[0].raw.slice(1).replace(/s$/, '') : undefined;
	var opts 		= query 		 ? "?realm=mytestrealm&rsqlfilter=QueryTerms==" + query : "?realm=mytestrealm";

	console.log('Catalog search term: ' + query)

	var get_options = {
	    uri:    "https://openapi.ariba.com/api/catalog-search/v1/sandbox/search/items" + opts,
	    method:  "GET",
	    json:    true,
	    headers: {
	    	"apiKey": pw.ARIBA_APP_KEY
	    }
	};

	return request.get(get_options)
	.then( function(req_data) {
		console.log('[POST] Request completed')
		res_data = {};
		catalog_elements = [];

		var count = 0;
		req_data.contents.forEach( function(elem){

			var list_item = {
    	        "title": elem.ShortName,
    	        "imageUrl": elem.Thumbnail,
    	        "subtitle": elem["Price.Amount"] + " " + elem["Price.Currency.UniqueName"],
    	        "buttons": [{
    	            "value": "Buy the " + ordinal_values[count] + " item",
    	            "title": "Order",
    	            "type": "postback"
    	        }],
    	        "details": {
    	        	"Supplier Name": elem.SupplierName,
    	        	"Supplier Part ID": elem.SupplierPartId,
    	        	"Manufacturer Name": elem.ManufacturerName,
    	        	"Lead Time": elem.LeadTime,
    	        	"Description": elem.Description,
    	        	"Price": elem["Price.Amount"],
    	        	"Currency": elem["Price.Currency.UniqueName"],
    	        	"comment":""
    	        }
    	    }

			catalog_elements.push(list_item);
			count++;
		});

		res_data.reply = [{
			"type": "text",
			"content": "Which one would you like to order?"
		},{
    	  "type": "list",
    	  "content": {
    	  	"title" : "Catalog List",
    	    "elements": catalog_elements 
    	  }
    	}];

    	res_data.catalog_elements = catalog_elements;

		return res_data;
	})
	.catch(function (err) {
		console.log(err);
		return [{
			"reply": {
				"type": 'text',
				"content": "There was an error with the backend call."
			}				   
		}];
	});
};

exports.call_api_approval_confirm = function(memory){
	
	selected_approval = memory.selected_approval;
	selected_approval.details.comment = "Approve";
	res_data.reply = [{
		"type":"text",
		"content":"Do you want to me to update the approvable with the following details: \n \n " + 
		"Approvable id: " + selected_approval.title + "\n" + "User: " + selected_approval.details.approverId +
		"\n" +"Action: Approve \n" + "Comments: " + selected_approval.details.comment
	},
	{
		"type":"quickReplies",
		"content": {
			"title":"is that correct",
			"buttons": [{
				"value":"Yes",
				"title":"Yes"
			},{
				"value":"No",
				"title":"No"
			}]
		}
	}]
	return res_data;

};

exports.call_api_comment_confirm = function(req){
	comments = req.body.nlp.source;
	selected_approval = req.body.conversation.memory.selected_approval;

	res_data.reply = [{
		"type":"text",
		"content":"Do you want to me to update the approvable with the following details: \n \n " + 
		"Approvable id: " + selected_approval.title + "\n" + "User: " + selected_approval.details.approverId +
		"\n" +"Action: Comment" + "\n" + "Comments: " + comments
	},
	{
		"type":"quickReplies",
		"content": {
			"title":"is that correct",
			"buttons": [{
				"value":"Yes",
				"title":"Yes"
			},{
				"value":"No",
				"title":"No"
			}]
		}
	}]
	return res_data;

};

exports.call_api_approval_submit = function(memory){
	var selected_approval = memory.selected_approval;
	var comments = {"comments" : "Approve"};
	var opts = "?realm=mytestrealm" + "&user=" + selected_approval.details.approverId +
		"&passwordadapter=" + "PasswordAdapter1";
	var patch_options = {
		uri: "https://openapi.ariba.com/api/approval-copilot/v1/sandbox/requisitions/" +selected_approval.title +"/approve" + opts,
		method: "PATCH",
		json: true,
		headers:{
		"apiKey" : pw.ARIBA_APP_KEY,
		"content-type": "application/json"
		},
		body: comments
	};
	return request.patch(patch_options)
	.then( function(){
		console.log("PATCH COMPLETE");
		res_data.reply = [{
			"type":"text",
			"content" : "successful"
		}]
		return res_data;
	})
	.catch(function(err){
		console.log(err);
	});
}

exports.call_api_comment_submit = function(memory){
	
	var selected_approval = memory.selected_approval;
	var comments = {"comments" : selected_approval.details.comment};
	var opts = "?realm=mytestrealm" + "&user=" + selected_approval.details.approverId +
		"&passwordadapter=" + "PasswordAdapter1";

	var patch_options = {
		uri: "https://openapi.ariba.com/api/approval-copilot/v1/sandbox/requisitions/" +selected_approval.title +"/comment" + opts,
		method: "PATCH",
		json: true,
		headers:{
			"apiKey" : pw.ARIBA_APP_KEY,
			"content-type": "application/json"
		},
		body: comments
	};
	console.log("Start Patch");
	return request.patch(patch_options)
	.then( function(){
		console.log("PATCH COMPLETE");
		res_data.reply = [{
			"type":"text",
			"content" : "successful"
		}]
		return res_data;
	})
	.catch(function(err){
		console.log(err);
	});
};

exports.call_api_catalog_purchase = function(memory){
	console.log("Purchase index")
	console.log(memory)
	rank = memory.element.index;
	catalog = memory.catalog;
	item = catalog[rank];

	res_data.reply = [{
		"type": 'text',
		"content": "Are you sure you want to order this?"
	},{
		"type": 'card',
		"content": {
	    	"title": item.title,
	    	"subtitle": item.subtitle,
	    	"imageUrl": item.imageUrl,
	    	"buttons": [
	    	]
	    }
	},{
    	"type": "quickReplies",
    	"content": {
    		"title": "",
    	  	"buttons": [{
    	      	"value": "Yes",
    	      	"title": "Yes"
    	    },{
    	     	"value": "No",
    	      	"title": "No"
    	  	}]
    }}];

    res_data.selected_product = item;
  
	return res_data;
};

exports.call_api_catalog_submit = function(memory){

	res_data = [{
		"type": 'text',
		"content": "Your order has been submitted."
	},{
		"type": 'card',
		"content": {
			"title": memory.selected_product.title,
			"subtitle": memory.selected_product.subtitle,
			"imageUrl": '',
			"buttons": []
		}
	}];
	return res_data;
}