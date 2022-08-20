var Unlocker = {
    noReg: false,
	HEIGHT: 176,
	WIDTH: 176,
	RADIUS: 23,
	MARGIN: 6,
	BUTTON_RELEASED: false,
	BUTTON_PRESSED: true,
	locked: true,
	input: "",
	password: "1256",
    cb:function(res){},

	loadSettings: function(){
		// Helper function default setting
		function def (value, def) {return value !== undefined ? value : def;}
		var settings = require('Storage').readJSON("boot.json", true) || {};
		PIN1 = def(settings.PIN1,"1")
		PIN2 = def(settings.PIN2,"1")
		PIN3 = def(settings.PIN3,"1")
		PIN4 = def(settings.PIN4,"1")
	  
		var pass = ""
		pass = pass + PIN1
		pass = pass + PIN2
		pass = pass + PIN3
		pass = pass + PIN4
		Unlocker.password = pass
	},
	// Show the unlocker
	show: function (cb, noReg) {
		Unlocker.loadSettings();
        Unlocker.cb = cb;
        Unlocker.noReg = noReg;
		Unlocker.locked = true;
		Unlocker.input = "";
		g.clear();
		g.setFont("12x20:1.5");
		for (var i = 1; i <= 6; i++) {
			Unlocker.showButton(i, Unlocker.BUTTON_RELEASED);
		}
		Unlocker.showToast(0);
        if(!Unlocker.noReg)
		  Unlocker.registerListener();
	},

	// Draw the toast
	showToast: function (num) {
		for (var i = 0; i <= 3; i = i + 1) {
			g.setColor(255, 255, 255);
			g.fillCircle(58 + i * 20, 35, 6);
			g.setColor(0, 0, 0);
			g.drawCircle(58 + i * 20, 35, 6);
		}
		for (var j = 0; j <= num - 1; j = j + 1) {
			g.fillCircle(58 + j * 20, 35, 6);
		}
	},

	// Get position of a certain password number button
	getPos: function (num) {
		var row, col;
		if (num == 0) {
			row = 3;
			col = 1;
		} else {
			row = parseInt((num - 1) / 3);
			col = (num - 1) % 3;
		}
		return [row, col];
	},

	showButton: function (num, status) {
		var row = Unlocker.getPos(num)[0];
		var col = Unlocker.getPos(num)[1];
		g.setColor(255, 255, 255);
		g.fillCircle(12 + 2 * Unlocker.RADIUS * (0.5 + col) + Unlocker.MARGIN * col, 55 + 2 * Unlocker.RADIUS * (0.5 + row) + Unlocker.MARGIN * row, Unlocker.RADIUS);
		g.setColor(0, 0, 0);
		g.drawCircle(12 + 2 * Unlocker.RADIUS * (0.5 + col) + Unlocker.MARGIN * col, 55 + 2 * Unlocker.RADIUS * (0.5 + row) + Unlocker.MARGIN * row, Unlocker.RADIUS);
		if (status) {
			g.setColor(0, 0, 0);
			g.fillCircle(12 + 2 * Unlocker.RADIUS * (0.5 + col) + Unlocker.MARGIN * col, 55 + 2 * Unlocker.RADIUS * (0.5 + row) + Unlocker.MARGIN * row, Unlocker.RADIUS);
		}
		if (status)
			g.setColor(255, 255, 255);
		else
			g.setColor(0, 0, 0);
		g.drawString(num, 8 + 2 * Unlocker.RADIUS * (0.5 + col) + Unlocker.MARGIN * col, 47 + 2 * Unlocker.RADIUS * (0.5 + row) + Unlocker.MARGIN * row, false);
	},

	registerListener: function () {
		Bangle.on('touch', function (button, t) {
			if (Unlocker.locked) {
				for (var j = 1; j <= 6; j++) {
					Unlocker.showButton(j, Unlocker.BUTTON_RELEASED);
				}
				var flag = -1;
				for (var i = 1; i <= 6; i++) {
					var row = Unlocker.getPos(i)[0];
					var col = Unlocker.getPos(i)[1];
					var centerx = 12 + 2 * Unlocker.RADIUS * (0.5 + col) + Unlocker.MARGIN * col;
					var centery = 55 + 2 * Unlocker.RADIUS * (0.5 + row) + Unlocker.MARGIN * row;
					var condition1 = t.x >= centerx - (Unlocker.RADIUS + Unlocker.MARGIN / 2);
					var condition2 = t.x <= centerx + (Unlocker.RADIUS + Unlocker.MARGIN / 2);
					var condition3 = t.y >= centery - (Unlocker.RADIUS + Unlocker.MARGIN / 2);
					var condition4 = t.y <= centery + (Unlocker.RADIUS + Unlocker.MARGIN / 2);
					if (condition1 && condition2 && condition3 && condition4) {
						flag = i;
						break;
					}
				}
				if (flag != -1) {
					Unlocker.showButton(flag, Unlocker.BUTTON_PRESSED);
					if (Unlocker.input.length < 4)
						Unlocker.input = Unlocker.input + flag;
					Unlocker.showToast(Unlocker.input.length);
					if (Unlocker.input.length == 4) {
						if (Unlocker.input == Unlocker.password) {
							//Bangle.showLauncher();
                            Unlocker.cb(true);
						} else {
							Unlocker.input = "";
							//Unlocker.showToast(0);
                            Unlocker.cb(false);
						}
					}
					setTimeout(function () {
						if (Unlocker.input != Unlocker.password)
							Unlocker.showButton(flag, Unlocker.BUTTON_RELEASED);
					}, 200);
				}
			}
		});
	}
};



var clockApp=(require("Storage").readJSON("setting.json",1)||{}).clock;
if (clockApp) clockApp = require("Storage").read(clockApp);
if (!clockApp) {
  clockApp = require("Storage").list(/\.info$/)
    .map(file => {
      const app = require("Storage").readJSON(file,1);
      if (app && app.type == "clock") {
        return app;
      }
    })
    .filter(x=>x)
    .sort((a, b) => a.sortorder - b.sortorder)[0];
  if (clockApp)
    clockApp = require("Storage").read(clockApp.src);
}
if (!clockApp) clockApp=`E.showMessage("No Clock Found");setWatch(()=>{Bangle.showLauncher();}, global.BTN2||BTN, {repeat:false,edge:"falling"});`;
eval(clockApp);
delete clockApp;


var unlock = function(noReg){
	Bangle.timeoff = true
    Unlocker.show(function(res){
		if(res)
		{
			Bangle.timeoff = false
			Bangle.showLauncher();
		}
		else
			unlock(true);
    },noReg);
};

var firstLock = true

Bangle.setUI({
	mode : "custom",
	swipe : function(dir) {
		if(firstLock&&dir==-1)
		{
			firstLock = false
			unlock(false)
		}
		else if(dir==1)
			load()
	}, 
	btn : function(n) {
		load()
	}
  });