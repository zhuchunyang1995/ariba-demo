var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');

var api = require('./api.js');

var app = express();
app.use(bodyParser.json());


app.post('/approval/submit', function(req, res){
  var memory = req.body.conversation.memory;
  api.call_api_approval_submit(memory)
  .then(function(data){
    res.json({
      replies:data.reply,
      conversation:{
        memory:memory
      }
      
    })
  })
  .catch (function(err){
    console.log(err);
  });
});

app.post('/comment/submit', function (req, res){

  var memory = req.body.conversation.memory;
  api.call_api_comment_submit(memory)
  .then(function(data){
    res.json({
      replies:data.reply,
      conversation:{
        memory:memory
      }
      
    })
  })
  .catch (function(err){
    console.log(err);
  }); 
});

app.post('/comment/make', function (req, res){
  var comment = req.body.nlp.source;
  var memory = req.body.conversation.memory;
  data = api.call_api_comment_confirm(req);

  memory.selected_approval.details.comment = comment;
  console.log("comment confirm");
  res.json({
    replies:data.reply,
    conversation:{
      memory:memory
    }
  });

});
app.post('/approval/search',function (req, res) {
  console.log("[POST] /approval/search");

  var memory = req.body.conversation.memory;
  
  api.call_api_approval_search()
  .then(function(data){
    console.log("Approval List:");
    memory.approval_list = data.approval_list;
    res.json({
      replies: data.reply,
      conversation:{
        memory: memory
        }
      });
  })
  .catch (function(err){
    console.log(err);

  }); 
});



app.post('/approval/confirm',function (req, res) {
  console.log("[POST] /approval/confirm");

  var memory = req.body.conversation.memory;

  data = api.call_api_approval_confirm(memory);

  res.json({
    replies:data.reply,
      conversation: {
        memory:memory
      }

  });
});

app.post('/approval/show', function (req, res) {
  console.log("[POST] /approval/show")


  var memory = req.body.conversation.memory;
  index = memory.ordinal.index;
  required_approval = memory.approval_list[index];
  console.log(required_approval);
  api.call_api_approval_show(required_approval)
  .then(function (data) {
    memory.selected_approval = data.selected_approval;
    console.log("approval_show_data");
    res.json({
      replies:data.reply,
      conversation:{
        memory:memory
      }
    });
  })
  .catch(function (err){
    console.log(err);

  });
});

app.post('/catalog/search', function (req, res) {
	console.log("[POST] /catalog/search");

	var memory = req.body.conversation.memory;

 	api.call_api_catalog_search(memory)
 	.then(function(data){

 		memory.catalog = data.catalog_elements;
 		res.json({
    	  	replies: data.reply,
    	  	conversation: {
    	  		memory: memory
          	}
    	});
 	})
	.catch(function (err) {
		console.log(err);
	});	
});

app.post('/catalog/order', function (req, res) { 
	console.log("[POST] /catalog/order");

	var memory = req.body.conversation.memory;

 	data = api.call_api_catalog_purchase(memory);
 	memory.selected_product = data.selected_product;
 	console.log("ORDER:");
 	console.log(data.reply);
 	res.json({
    	replies: data.reply,
      	conversation: {
   	  		memory: memory
       	}    	  
   	});
});

app.post('/catalog/submit', function (req, res) {
	console.log("[POST] /catalog/order");

	var memory = req.body.conversation.memory;

 	data = api.call_api_catalog_submit(memory);
 	console.log("SUBMIT:");
 	console.log(data);
 	res.json({
    	replies: data
    });
});

app.post('/worker_req/create', function (req, res) {
	console.log("[POST] /worker_req/create");

	var memory = req.body.conversation.memory;

	if(!memory.fg_token) {
		api.get_fg_token()
		.then(function(fg_token_data){
			memory.fg_token = fg_token_data;
 			api.call_api_worker_req_create(memory.fg_token, memory)
 			.then(function(data){
 				res.json({
    				replies: data,
      				conversation: {
   	  					memory: memory
       				}  
    			});
 			})	
			.catch(function (err) {
				console.log(err);
			});			
		}).catch(function (err) {
      console.log(err);
      
      res.json({
        replies: [{
          "type": 'text',
          "content": "There was an error getting the FG token"           
        }]
      });
    })
	} else {
 		api.call_api_worker_req_create(memory.fg_token, memory)
 		.then(function(data){
 			res.json({
    		  	replies: data
    		});
 		})
		.catch(function (err) {
			console.log(err);
		});	
	}
});

app.post('/worker_req/submit', function (req, res) {
	console.log("[POST] /worker_req/submit");

	var memory = req.body.conversation.memory;

	if(!memory.fg_token) {
		api.get_fg_token()
		.then(function(fg_token_data){
			memory.fg_token = fg_token_data;
 			api.call_api_worker_req_submit(memory.fg_token)
 			.then(function(data){
 				res.json({
    				replies: data,
      				conversation: {
   	  					memory: memory
       				}  
    			});
 			})
			.catch(function (err) {
				console.log(err);
			});				
		}).catch(function (err) {
      res.json({
        replies: [{
          "type": 'text',
          "content": "There was an error getting the FG token"           
        }]
      });
    })
	} else {
 		api.call_api_worker_req_submit(memory.fg_token)
 		.then(function(data){
 			res.json({
    		  replies: data
    		});	
 		})
		.catch(function (err) {
			console.log(err);
		});		
	}


});

app.post('/twm/sfsf/show-list-of-positions', function (req, res) {
	var reply = [{
		  "type": "text",
		  "content": "Here are your 3 open positions"
		},{
    	  "type": "list",
    	  "content": {
    	  	"title" : "Open Positions",
    	    "elements": [{
    	    	    "title": "Marketing Coordinator (4410)",
    	    	    "subtitle": "MC Automotive",
    	    	    "subtitle2": "Open for 2 months"
    	    	},{
    	    	    "title": "Compensation Administrator US (900284)",
    	    	    "subtitle": "MC Corporate",
    	    	    "subtitle2": "Open for 3 months"
    	    	},{
    	    	    "title": "HR Coordinator (900132)",
    	    	    "subtitle": "MC Corporate",
    	    	    "subtitle2": "Open for 2 months"
    	    	}
    	    ] 
    	  }
    	}];

	res.json({
		replies: reply
    });
});

// returns a random boolean - not for twm demo
app.post('/test/flip', function (req, res) {
	var memory = req.body.conversation.memory;
	memory.flip = Math.random() < 0.5 ;

	res.json({
		replies: [{
			"type": 'text',
			"content": "There was not an error with the backend call." 				   
		}],
    	conversation: {
   			memory: memory
    	}  
    });
});

// Recast will send a post request to /errors to notify errors
app.post('/errors', (req, res) => {
   console.error(req.body);
   res.sendStatus(200); 

});

app.listen(config.PORT, () => console.log(`App started on port ${config.PORT}`)); 