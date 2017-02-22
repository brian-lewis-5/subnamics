// var botBuilder = require('claudia-bot-builder'),
//     excuse = require('huh');

// module.exports = botBuilder(function (request) {
//   return 'Thanks for sending ' + request.text  + 
//       '. Your message is very important to us, but ' + 
//       excuse.get();
// });


/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80));
module.exports = botBuilder((request, apiReq) => {
  const generic = new fbTemplate.generic();
  generic.addBubble(format('Would you like to subscribe?'), format('Eggs are nutricious to quite tasty.'))
    .addButton('Subscribe to egg', 1);
  return generic.get();
});
