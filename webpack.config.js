const webpack = require('webpack')
const deployConfig = require('./config/apis.json')

const stage = process.env.ENV || 'test'

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            S3_URL: JSON.stringify(deployConfig[stage].s3Url),
            DOMAIN: JSON.stringify(deployConfig[stage].domain)
        })
    ]
}
