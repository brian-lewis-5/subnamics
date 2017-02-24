/*global module*/
'use strict';
const botBuilder = require('claudia-bot-builder'),
  moment = require('moment'),
  _ = require('lodash'),
  rp = require('minimal-request-promise'),
  fbTemplate = botBuilder.fbTemplate,
  format = text => (text && text.substring(0, 80)),
  apiToken = '{"sig_field":"TestCust","ts":"1487949935","sig":"0Z1unXN/28n8nvhpdZvVytglcg874p1r5lygAGsUlPk=","public_id":"0e5de2bedc5e11e3a2e4bc764e106cf4"}';

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
      'Authorization': apiToken,
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response.body)
      const count = body.count;
      const orders = _.sortBy(body.results, ['place']);
      const dateString = moment(orders[0].place).format('MMMM Do YYYY');
      const public_id = orders[0].public_id;
      const id = orders[0].id;


      const generic = new fbTemplate.generic();

      generic
          .addBubble(`Your next order is on ${dateString}`)
          .addButton('More Details', `ORDER_DETAILS_${public_id}`)
          .addButton('Send Now', `SEND_NOW_${id}`);

      return [
        generic.get()
      ]
    })
    .catch(err => {
      return [
        format(`API fail:`)
      ]
    });
}

function getOrderDetails(id) {
  const options = {
    method: 'GET',
    hostname: 'dev.api.ordergroove.com',
    path: `/msi/items/?order_id=${id}`,
    headers: {
      'Authorization': apiToken,
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response.body)

      return [
        new fbTemplate.Receipt('Steve\'s Mom', '12345678902', 'USD', 'Visa')
          .addItem(body.results[0].product.name)
          .addQuantity(body.results[0].subscription_quantity)
          .addPrice(body.results[0].price)
          .addCurrency('USD')
          .addImage(body.results[0].product.image_url)
          .addShippingCost(body.results[0].extra_cost)
          .addTotal(body.results[0].total_price)
          .addAdjustment('Free Shipping Discount', 5.95)
          .get()
        ];
    })
    .catch(err => {
      err = JSON.stringify(err.body);
      return [
        format(`API fail:`),
        format(err)
      ]
    });
}

function sendOrderNow(id) {
  const options = {
    method: 'GET',
    hostname: 'dev.api.ordergroove.com',
    path: `/order/${id}/send_now?merchant_id=0e5de2bedc5e11e3a2e4bc764e106cf4&merchant_user_id=TestCust&public_id=0e5de2bedc5e11e3a2e4bc764e106cf4&sig=1UPCbwiEzF5jlpsukCN1uGd4T%2B8SBn6AOoAfIGGfkNE%3D&sig_field=TestCust&ts=1487951530'`,
    headers: {
      'Authorization': apiToken,
    }
  };

  return rp(options)
    .then(response => {
      const body = JSON.parse(response)

      return [
        `Success! You will receive this order ASAP. ${response}`
        ];
    })
    .catch(err => {
      err = JSON.stringify(err);
      return [
        format(`API fail: ${err}`)
      ]
    });
}

function doWelcome() {
    return [
        new fbTemplate.Image('http://i.imgur.com/twTukoI.jpg').get(),
        new fbTemplate.Button('Welcome back, Gregory. Begin by either typing the name of a product or tapping "My Next Shipment".')
            .addButton('My Next Shipment', 'check orders').get()
    ]
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
    return new fbTemplate.Text('Where should I send it? Type an address or tap "Send location"')
        .addQuickReplyLocation()
        .get()
}

let prevMsg, msg;

const bot = botBuilder((request, apiReq) => {
    prevMsg = msg;
    msg = request.text.toLowerCase();

    apiReq.lambdaContext.callbackWaitsForEmptyEventLoop = false

    if(_.startsWith(request.text, 'ORDER_DETAILS_')) {
      return getOrderDetails(request.text.slice('ORDER_DETAILS_'.length));
    }

    if(_.startsWith(request.text, 'SEND_NOW_')) {
      return sendOrderNow(request.text.slice('SEND_NOW_'.length));
    }

  switch(true) {
    case(msg === 'hi' || msg === 'hello'):
      return doWelcome();
    case(msg === 'tp' || msg === 'toilet paper'):
      return 'Are you interestd in toilet paper?';
    case(prevMsg === 'tp' && msg === 'yes'):
      return doChooseTp();
    case(msg === 'fun tp'):
      return doFunTp();
    case(msg === 'order tp'):
      return 'Should I send it to 71 Mott St, New York, NY, 10013?';
    case(msg === 'no'):
      return doChooseShipping();
    case(prevMsg === 'no' && msg === 'yes'):
      return 'go to payment conf screen';
    case(msg === 'yes payment'):
      return 'go to order conf screen';
    case (msg === 'check orders'):
      return getOrders();
    case(msg.length === 0):
      return 'Should I send it to 75 Broad St, New York, NY, 10004?';
  }
}, {
  platforms: ['facebook']
});

module.exports = bot;
