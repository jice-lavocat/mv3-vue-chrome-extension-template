import {InfluxDB, Point} from '@influxdata/influxdb-client-browser'
// const {InfluxDB, Point} = require('@influxdata/influxdb-client')

const token = process.env.INFLUXDB_TOKEN
const url = 'https://europe-west1-1.gcp.cloud2.influxdata.com'

const influxOrg = process.env.INFLUXDB_ORG
const influxBucket = process.env.INFLUXDB_BUCKET

const influxClient = new InfluxDB({url, token})

export{
    influxClient, 
    influxOrg,
    influxBucket
}