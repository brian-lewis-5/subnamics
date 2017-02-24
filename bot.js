/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  moment = require('moment'),
  _ = require('lodash'),
  rp = require('minimal-request-promise'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80));

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
      'Authorization': '{"sig_field":"TestCust","ts":"1487911580","sig":"niP8KgymfSQicRL0w5x471t/fsHmyrf4uII0K1CmMO4=","public_id":"0e5de2bedc5e11e3a2e4bc764e106cf4"}',
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response.body)
      const count = body.count;
      const orders = _.sortBy(body.results, ['place']);
      const dateString = moment(orders[0].place).format('MMMM Do YYYY');
      const id = orders[0].public_id;

      const generic = new fbTemplate.generic();

      generic
          .addBubble(`Your next order is on ${dateString}`)
          .addButton('More Details', `ORDER_DETAILS_${id}`)

      return [
        format(`You have ${count} upcoming orders`),
        generic.get()
      ]
    })
    .catch(err => {
      err = JSON.stringify(err.body);
      return [
        format(`API fail:`),
        format(err)
      ]
    });
}

function getOrderDetails(id) {
  const options = {
    method: 'GET',
    hostname: 'dev.api.ordergroove.com',
    path: `/msi/items/?order_id=${id}`,
    headers: {
      'Authorization': '{"sig_field":"TestCust","ts":"1487911580","sig":"niP8KgymfSQicRL0w5x471t/fsHmyrf4uII0K1CmMO4=","public_id":"0e5de2bedc5e11e3a2e4bc764e106cf4"}',
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response.body)

      return [
        format(`upcoming order for a ${body.results[0].product.name}`),
      ]
    })
    .catch(err => {
      err = JSON.stringify(err.body);
      return [
        format(`API fail:`),
        format(err)
      ]
    });
}

function doWelcome() {
    return new fbTemplate.generic()
        .addBubble(format('Welcome back, Gregory.'), format('Begin by either typing the name of a product or tapping "Check my orders"'))
        .addImage('http://i.imgur.com/twTukoI.jpg')
        .addButton('Check my orders', 'check orders')
        .get();
}

function doChooseTp() {
    return new fbTemplate.generic()
        .addBubble(format('Choose a description of the toilet paper you\'re after'))
        .addButton('Luxurious', 'luxury tp')
        .addButton('Economical', 'economical tp')
        .addButton('Fun', 'fun tp')
        .get();
}

function doFunTp() {
    return new fbTemplate.generic()
        .addBubble(format('Great! I found fun toilet paper. You can either place an order or subscribe'))
        .addButton('Place order', 'order tp')
        .addButton('Subscribe', 'subscribe tp')
        .get();
}

function doChooseShipping() {
    return 'egg';
    // return new fbTemplate.generic()
    //     .addBubble(format('Where should I send it? Type an address or tap "share location"'))
    //     .get();
}

const bot = botBuilder((request, apiReq) => {
  const msg = request.text.toLowerCase();

    apiReq.lambdaContext.callbackWaitsForEmptyEventLoop = false

    if(_.startsWith(request.text, 'ORDER_DETAILS_')) {
      return getOrderDetails(request.text.slice('ORDER_DETAILS_'.length));
    }

  switch(true) {
    case(msg === 'hi' || msg === 'hello'):
      return doWelcome();
    case(msg === 'tp' || msg === 'toilet paper'):
      return 'Are you interestd in toilet paper?';
    case(msg === 'yes'):
      return doChooseTp();
    case(msg === 'fun tp'):
      return doFunTp();
    case(msg === 'order tp'):
      return 'Should I send it to 71 Mott St, New York, NY, 11122?';
    case(msg === 'no'):
      return doChooseShipping();
    case(msg === 'yes broad'):
      return 'go to payment conf screen';
    case(msg === 'yes payment'):
      return 'go to order conf screen';
  }
}, {
  platforms: ['facebook']
});

module.exports = bot;
