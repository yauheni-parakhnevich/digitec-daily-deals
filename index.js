const Mailjet = require('node-mailjet')
const axios = require('axios');
const cheerio = require('cheerio');

const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC,
    apiSecret: process.env.MJ_APIKEY_PRIVATE
  });

const sites = ['digitec', 'galaxus'];

exports.execute = (event, context) => {
    sites.forEach(site => {
        const httpCall = `https://${site}.ch/en/daily-deal`
        axios.get(httpCall).then(res => {
            const $ = cheerio.load(res.data);
        
            var productName = $('article>a').attr('aria-label')
            var imageUrl = `https://${site}.ch` + $('article>div>div:nth-child(1) img').attr('src')
            var category = $('article>div>div:nth-child(2) a').text()
            var priceNow = $('article>div>div:nth-child(2)>div:nth-child(2)>span:nth-child(1)').text()
            var priceWas = $('article>div>div:nth-child(2)>div:nth-child(2)>span:nth-child(2)').text()
            
            bodyMail = `<h1>${site}</h1>`
                + `<p><strong>Category:</strong> ${category}</p>`
                + `<p><strong>Product:</strong> ${productName}</p>`
                + `<p><strong>Price:</strong> ${priceNow} was ${priceWas}</p>`
                + `<p><img src="${imageUrl}" alt="${productName}"></p>`
            
            const mailjetRequest = mailjet.post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "*****",
                            "Name": "Automation co-pilot"
                        },
                        "To": [
                            {
                                "Email": "*****",
                                "Name": "Yauheni"
                            }
                        ],
                        "Subject": `${site} deals for ` + new Date().toDateString(),
                        "HTMLPart": bodyMail,
                    }
                ]
            })
            mailjetRequest
                .then((result) => {
                    console.log(result.body)
                })
                .catch((err) => {
                    console.log(err.statusCode)
                })                
        }).catch(err => {
            console.log('Error: ', err.message);
        })
    })
}
