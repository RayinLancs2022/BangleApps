(function(back) {
    let settings = require('Storage').readJSON('boot.json',1)||{};
    if (typeof settings.PIN1 !== "string") settings.PIN1 = "1"; // default value
    if (typeof settings.PIN2 !== "string") settings.PIN2 = "1"; // default value
    if (typeof settings.PIN3 !== "string") settings.PIN3 = "1"; // default value
    if (typeof settings.PIN4 !== "string") settings.PIN4 = "1"; // default value
    function writeSettings() {
      require('Storage').writeJSON('boot.json', settings);
    }
    function stringItems(startvalue, writer, values) {
        return {
          value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
          format: v => values[v],
          min: 0,
          max: values.length - 1,
          wrap: true,
          step: 1,
          onchange: v => {
            writer(values[v]);
            writeSettings();
          }
        };
      }
      function stringInSettings(name, values) {
        return stringItems(settings[name], v => settings[name] = v, values);
      }
    const appMenu = {
      '': {'title': 'App Settings'},
      '< Back': back,
      "PIN1": stringInSettings("PIN1", ["1","2","3","4","5","6"]),
      "PIN2": stringInSettings("PIN2", ["1","2","3","4","5","6"]),
      "PIN3": stringInSettings("PIN3", ["1","2","3","4","5","6"]),
      "PIN4": stringInSettings("PIN4", ["1","2","3","4","5","6"]),
    };
    E.showMenu(appMenu)
  })