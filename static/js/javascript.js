$(document).ready(function() {

	var app = app || { };

	(function(){

		app.controller = {
			init: function(){
				app.people.init();
				app.getPeople.init();
				app.bids.init();
				app.results.init();
			},
		},

		app.vars = {
			participants: [],
			raidMax: 12,
			bids:[],
			bidders:[],
			nonBidMonii: 0,
			totalGold: 0,
			nameList: [
				"DekThaiAiHia",
				"Valardri",
				"Nalummah",
				"General Aeolius",
				"Endurmo",
				"Lagoon Revy",
				"Dynary",
				"YouWillBurn",
				"YuikoChan",
				"Flareon",
				"xRaWe",
				"HighVoltageGirl",
				]

		},

		app.people = {
			init: function(){
				this.clickEvent();
			},

			clickEvent: function(){
				function getEventTarget(e) {
    				e = e || window.event;
    				return e.target || e.srcElement; 
				};

				$("#peoplelist").click(function() {
  					var target = getEventTarget(event);

  					if (target.getAttribute("available") == 1) {
  						app.people.checkParticipants(target);
  					} else if (target.getAttribute("available") == 0) {
  						app.people.removeFromList(target);
  					};
				});
			},


			checkParticipants: function(playerName){
				if (app.vars.participants.length == app.vars.raidMax) {
					alert("Raid is full. Remove players before adding new ones.");
				} else{
					this.addToList(playerName);
				}
			},

			addToList: function(playerName){
				app.vars.participants.push(playerName.innerHTML);
				playerName.setAttribute("available", "0");
				//console.log(app.vars.participants);
				this.countPeople();

			},

			removeFromList: function(playerName){
				playerName.setAttribute("available", "1");

				app.vars.participants = jQuery.grep(app.vars.participants, function(value) {
  					return value != playerName.innerHTML;
				});

				//console.log(app.vars.participants);
				this.countPeople();
			},

			countPeople: function(){
				$("#participantlist").html("");

				for (var i = 0; i < app.vars.participants.length; i++) {
    				$("#participantlist").append( "<li>"+ app.vars.participants[i]+ "</li>");
				};

				$("#participants span").html(app.vars.participants.length+"/"+app.vars.raidMax);
			}
		},

		app.getPeople = {
			init: function(){
				for (var i = 0; i < app.vars.nameList.length; i++) {
    				$("#peoplelist").append( "<li available='1'>"+ app.vars.nameList[i]+ "</li>");
				};
			}
		},


		app.bids = {
			init: function(){
				this.goToBidScreen();
				this.addItem();
			},

			goToBidScreen:function(){
				$("section#players button").click(function() {
					$("section#players").addClass('hide');
					setTimeout(function(){ 
						$("section#players").addClass('remove');
					}, 400);
					$("section#bids").removeClass("remove");
					$("section#bids").addClass('show');
					for (var i = 0; i < app.vars.participants.length; i++) {
    					$("section#bids ul li:last-of-type select").append("<option>"+app.vars.participants[i]+"</option>");
					};
				});
			},

			addItem:function(){

				$("section#bids #addItem").click(function() {
					$("section#bids ul").append("<li><input type='text'></input><input type='text'></input><select></select></li>");
					for (var i = 0; i < app.vars.participants.length; i++) {
    					$("section#bids ul li:last-of-type select").append("<option>"+app.vars.participants[i]+"</option>");
					};
				});
			}


		},

		app.results = {
			init:function(){
				this.goToResultScreen();
			},

			goToResultScreen: function(){
				$("section#bids button#raidDone").click(function() {
					$("section#bids").removeClass("show");
					$("section#bids").addClass('hide');
					setTimeout(function(){ 
						$("section#bids").addClass('remove');
					}, 400);
					$("section#results").removeClass("remove");
					$("section#results").addClass('show');
					app.results.storeBids();
				});
			},

			storeBids:function(){
				app.vars.totalItems = $('section#bids>ul>li').length;

				for (var i = 0; i < $('section#bids>ul>li').length; i++) {
    					var bids = {};
    					bids.itemName = $("section#bids>ul>li:nth-of-type("+ (i+1) +") input:nth-of-type(1)").val();
    					bids.gold = $("section#bids>ul>li:nth-of-type("+ (i+1) +") input:nth-of-type(2)").val();
    					bids.goldShare = bids.gold / (app.vars.participants.length - 1);
    					bids.playerName = $("section#bids>ul>li:nth-of-type("+ (i+1) +") select").val();
    					
    					app.vars.bids.push(bids);
    					
    					
				};
				app.results.calculate();
				console.log(app.vars.bids);
			},

			calculate: function(){


				for (var i = 0; i < app.vars.bids.length; i++) {
					//calculate for non-bidders
					app.vars.nonBidMonii += app.vars.bids[i].goldShare;

					//determine bidders
					app.vars.bidders.push(app.vars.bids[i].playerName);

				};

				console.log(app.vars.nonBidMonii);
				$("section#results div#others p").append(app.vars.nonBidMonii.toFixed(2)+"g");

				var un = _.uniq(app.vars.bidders, function (item) {
    				return item;
				});
				app.vars.bidders = un;
				console.log(app.vars.bidders);

				app.vars.bidderData =[];

				for (var i = 0; i < app.vars.bidders.length; i++) {
					app.vars.bidderData.push({playerName: app.vars.bidders[i], totalShare:Number("0")})

				};


				for (var i = 0; i < app.vars.bidders.length; i++) {
					var seperateBidders = _.where(app.vars.bids, {playerName: app.vars.bidders[i]});
					console.log(seperateBidders);

					for (var j = 0; j < seperateBidders.length; j++) {
						app.vars.bidderData[i].totalShare += parseFloat(seperateBidders[j].goldShare);
					};

					app.vars.bidderData[i].monii = (app.vars.nonBidMonii - app.vars.bidderData[i].totalShare);
					app.vars.bidderData[i].monii = app.vars.bidderData[i].monii.toFixed(2);

					$("section#results div#bidders ul").append("<li>"+app.vars.bidderData[i].playerName+":<span> "+app.vars.bidderData[i].monii+"g<span></li>");

				};

				for (var i = 0; i < app.vars.bids.length; i++) {
					app.vars.totalGold += parseFloat(app.vars.bids[i].gold);
				}				

				console.log(app.vars.bidderData);
				console.log(app.vars.totalGold);
				app.results.show();
			},

			show: function(){
				$("section#results div#others h2 span").append("("+ (app.vars.participants.length - app.vars.bidders.length) + " people)");
				$("section#results div#others h3 span").append(app.vars.totalGold+"g");
			}

			
		}

		app.controller.init();

	}());
});
