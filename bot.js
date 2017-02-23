/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  rp = require('minimal-request-promise'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80));

function doWelcome() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Hi, there, I\'m Rosie. Zworp.'), format('I can help you get the cat food or toilet paper you\'re looking for.'))
        .addImage('http://www.medicalnewstoday.com/content/images/articles/283/283659/eggs.jpg')
        .addButton('I need cat food', 'I need cat food')
        .addButton('I need tp', 'I need tp')
        .addButton('I need something else', 'I need something else');

    return generic.get();
}

function doINeedCatFood() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Zwee, we\'ve got plenty of cat food'), format('What do you look for in cat food?'))
        .addButton('I need organic', 'I need organic')
        .addButton('I need high fish content', 'I need high fish content')
        .addButton('I need non-smelly', 'I need non-smelly');

    return generic.get();
}

function doINeedTp() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Zwee, we\'ve got plenty of toilet paper'), format('What do you look for in toilet paper?'))
        .addButton('I need luxury', 'I need luxury')
        .addButton('I need economical', 'I need economical')
        .addButton('I need dolphin print', 'I need dolphin print');

    return generic.get();
}

function doINeedDolphinPrintTp() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Dolphin Print Toilet Paper'), format('100% Soft and Luxurious Cotton, with fun dolphin print'))
        .addImage('http://i.imgur.com/S4A7gwO.png')
        .addButton('Order', 'Order dolphin')
        .addButton('Subscribe', 'Subscribe dolphin')
        .addButton('Do something else', 'Other dolphin');

    return generic.get();
}

function doQuantityDolphinPrintTp() {
	return 'How many Dolphin Print Toilet Papers would you like us to send?';
}

function doFrequencyDolphinPrintTp() {
	const generic = new fbTemplate.generic();

    generic
        .addBubble(format('How often would you like to receive Dolphin Print Toilet Paper?'))
        .addButton('Every week', 'Every week')
        .addButton('Every month', 'Every month')
        .addButton('Every other month', 'Every other month');

    return generic.get();
}

function doCheckoutDolphinPrintTp() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('By tapping Pay you agree to our terms of service'))
        .addImage('http://i.imgur.com/ErRkNHI.png')
        .addButton('Pay', 'Pay dolphin')
        .addButton('Cancel', 'Cancel dolphin');

    return generic.get();
}

function doReceiptDolphinPrintTp() {
    return new fbTemplate.Receipt('Steve\'s Mom', '12345678902', 'USD', 'Visa 2345')
        .addTimestamp(new Date(1428444852))
        .addItem('Dolphin Print Toilet Paper')
        .addSubtitle('100% Soft and Luxurious Cotton, with fun dolphin print')
        .addQuantity(1)
        .addPrice(7.95)
        .addCurrency('USD')
        .addImage('http://i.imgur.com/S4A7gwO.png')
        .addShippingAddress('75 Broad St 23rd Floor', '', 'New York', '10004',  'NY', 'US')
        .addSubtotal(7.95)
        .addShippingCost(4.95)
        .addTax(.34)
        .addTotal(7.29)
        .addAdjustment('Free Shipping Discount', 4.95)
        .addAdjustment('$1 Off Coupon', 1)
        .get();
}

function makeAPICall() {
  const newMessage = new fbTemplate.Text('API sucess');

  return newMessage.get();

  return rp.get(`https://google.com`)
    .then(response => {
      return 'sucess';
      // const generic = new fbTemplate.generic();
      // generic.addBubble(format('API success :)'));
      // return generic.get();
    })
    .catch(err => {
      return 'fail';
      // const generic = new fbTemplate.generic();
      // generic.addBubble(format('API fail :('));
      // return generic.get();
    })
    .finally(() => {
      return 'finally';
      // const generic = new fbTemplate.generic();
      // generic.addBubble(format('API finally'));
      // return generic.get();
    })
}


const bot = botBuilder((request, apiReq) => {
    apiReq.lambdaContext.callbackWaitsForEmptyEventLoop = false

    switch(request.text) {
        case 'hi':
            return doWelcome();
        case 'I need cat food':
            return doINeedCatFood();
        case 'I need tp':
            return doINeedTp();
        case 'I need dolphin print':
            return doINeedDolphinPrintTp();
        case 'Order dolphin':
            return doCheckoutDolphinPrintTp();
        case 'Subscribe dolphin':
        	return doQuantityDolphinPrintTp();
        case '1':
        	return doFrequencyDolphinPrintTp();
        case 'Every month':
        	return doCheckoutDolphinPrintTp();
        case 'Pay dolphin':
            return doReceiptDolphinPrintTp();
        case 'api':
            return makeAPICall();
        default:
            return 'Sorry, I don\'t understand';
    }
}, {
  platforms: ['facebook']
});

module.exports = bot;
