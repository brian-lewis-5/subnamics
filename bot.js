/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  rp = require('minimal-request-promise'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80));

function doWelcome() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Welcome to Rosie!'), format('We\'ll help you get the cat food or toilet paper you\'re looking for.'))
        .addImage('http://www.medicalnewstoday.com/content/images/articles/283/283659/eggs.jpg')
        .addButton('I need cat food', 'I need cat food')
        .addButton('I need tp', 'I need tp')
        .addButton('I need something else', 'I need something else');

    return generic.get();
}

function doINeedCatFood() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('We got plenty of cat food'), format('What kind would you like?'))
        .addButton('I need organic', 'I need organic')
        .addButton('I need high fish content', 'I need high fish content')
        .addButton('I need non-smelly', 'I need non-smelly');

    return generic.get();
}

function doINeedTp() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('We got plenty of TP'), format('What kind would you like?'))
        .addButton('I need luxury', 'I need luxury')
        .addButton('I need economical', 'I need economical')
        .addButton('I need dolphin print', 'I need dolphin print');

    return generic.get();
}

function doINeedDolphinPrintTp() {
    const generic = new fbTemplate.generic();

    generic
        .addBubble(format('Dolphin Print TP'), format('100% Soft and Luxurious Cotton'))
        .addImage('http://i.imgur.com/S4A7gwO.png')
        .addButton('Order', 'Order dolphin')
        .addButton('Subscribe', 'Subscribe dolphin')
        .addButton('Do something else', 'Other dolphin');

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
        .addItem('Dolphin Print TP')
        .addSubtitle('100% Soft and Luxurious Cotton')
        .addQuantity(1)
        .addPrice(11.95)
        .addCurrency('USD')
        .addImage('http://i.imgur.com/S4A7gwO.png')
        .addShippingAddress('75 Broad St 23rd Floor', '', 'New York', '10004',  'NY', 'US')
        .addSubtotal(11.95)
        .addShippingCost(4.95)
        .addTax(1.06)
        .addTotal(6.96)
        .addAdjustment('New Customer Discount', 10)
        .addAdjustment('$1 Off Coupon', 1)
        .get();
}

function makeAPICall() {


  return rp.get(`https://dev.api.ordergroove.com/orders/?status=1`)
    .then(response => {
      const generic = new fbTemplate.generic();
      generic.addBubble(format('API success :)'));
      return generic.get();
    })
    .catch(err => {
      const generic = new fbTemplate.generic();
      generic.addBubble(format('API fail :('));
      return generic.get();
    })
}


module.exports = botBuilder((request, apiReq) => {
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
        case 'Pay dolphin':
            return doReceiptDolphinPrintTp();
        case 'api':
            return makeAPICall();
        default:
            return 'Sorry, I don\'t understand';
    }
});
