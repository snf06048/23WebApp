const moment = require("moment");
require("moment/locale/ko"); //Korea Timeline
moment.locale("ko");
moment.updateLocale("ko", {
  longDateFormat: {
    L: "YYYY-MM-DD", 
    LT: "YYYY-MM-DD HH:mm:ss",
  },
});
module.exports = moment;