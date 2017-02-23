/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  moment = require('moment'),
  rp = require('minimal-request-promise'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80));

function doWelcome() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Hi, there, I\'m Rosie. Zworp.'), format('I can help get the cat food or toilet paper you\'re looking for.'))
        .addImage('http://i.imgur.com/twTukoI.jpg')
        .addButton('I need cat food', 'I need cat food')
        .addButton('I need tp', 'I need tp')
        .addButton('Check My Orders', 'My Orders');

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
        .addBubble()
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

function getOrders() {

  const options = {
    method: 'GET',
    hostname: 'dev.api.ordergroove.com',
    path: '/orders/?status=1',
    headers: {
      'Authorization': '{"sig_field":"TestCust","ts":"1487893111","sig":"pxL/nw7GpC/N68k+yLVuK0ybgTDiR17Xbns0C0ZeXmk=","public_id":"0e5de2bedc5e11e3a2e4bc764e106cf4"}',
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response.body)
      const count = body.count;
      const orders = _.sortBy(body.results, ['place']);
      const dateString = moment(orders[0].place).format('MMMM Do YYYY')
      return [
        format(`You have ${count} orders`),
        format(`Your next order is on ${dateString}`)
      ]
    })
    .catch(err => {
      err = JSON.stringify(err.body);
      return [
        format(`API failzz:`),
        format(err)
      ]
    });
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
        case 'My Orders':
            return getOrders();
        default:
            return 'Sorry, I don\'t understand';
    }
}, {
  platforms: ['facebook']
});

module.exports = bot;
