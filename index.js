const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-b37fa-firebase-adminsdk-dvwsa-686d2427e0.json')
const databaseURL = 'https://fcm-b37fa.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-b37fa/messages:send'
const deviceToken =
  'csGNgQ9RXcscfZuAV016U5:APA91bF1e4oVTsjGswqArJZxB0PmjNxTu-SdtTqEPezib-TuaIr03LoEYAAoXcfADT9xicTTIZYcsYutQcW5njU-lWkG1wmxDS2wkyzRsBQ9QgRvQchUO6c_b_vJ_Vv9j0sV-sfkABSc'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()