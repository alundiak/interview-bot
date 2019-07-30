//
// Expected file to contain only templates of Bot Message Objects
//

const images = require('./pics');
const payloads = ['JS', 'TS', 'REACT'];
/**
 *
 * @param {string} text - required
 */
const askTemplate = (text) => {
    console.log('askTemplate text', text);
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": text, // (#100) The parameter text is required
                "buttons": [
                    {
                        "type": "postback",
                        "title": "JavaScript",
                        "payload": payloads[0]
                    },
                    {
                        "type": "postback",
                        "title": "TypeScript",
                        "payload": payloads[1]
                    },
                    {
                        "type": "postback",
                        "title": "ReactJS",
                        "payload": payloads[2]
                    }
                ]
                // not more than 3 !!! Otherwise:
                /*
                message: '(#105) param name_placeholder[buttons] has too many elements.',
                type: 'OAuthException',
                */
            }
        }
    }
};

/**
 *
 * @param {string} type
 * @param {string} sender_id
 */
const imageTemplate = (type, sender_id) => {
    return {
        "attachment": {
            "type": "image",
            "payload": {
                "url": getImage(type, sender_id),
                "is_reusable": true
            }
        }
    }
};

const getImage = (type, sender_id) => {
    let users = {};

    // create user if doesn't exist
    if (users[sender_id] === undefined) {
        users = Object.assign({
            [sender_id]: {
                [`${payloads[0].toLowerCase()}_count`]: 0,
                [`${payloads[1].toLowerCase()}_count`]: 0,
                [`${payloads[2].toLowerCase()}_count`]: 0
            }
        }, users);
    }

    let count = images[type].length;
    let user = users[sender_id];
    let user_type_count = user[type + '_count'];

    // update user before returning image
    let updated_user = {
        [sender_id]: Object.assign(user, {
            [type + '_count']: count === user_type_count + 1 ? 0 : user_type_count + 1
        })
    };
    // update users
    users = Object.assign(users, updated_user);

    console.log('users', users, user_type_count);

    return images[type][user_type_count];
}

//
// borrowed from
// https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start
//
const attachmentTemplate = (received_message) => {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    // it URL of uploaded file from user machine to Clouds.

    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Is this the right picture?",
                    "subtitle": "Tap a button to answer.",
                    "image_url": attachment_url,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Yes!",
                            "payload": "yes",
                        },
                        {
                            "type": "postback",
                            "title": "No!",
                            "payload": "no",
                        }
                    ],
                }]
            }
        }
    }
}

const genericTemplate = () => {
    let generic_template = {
        template_type: 'generic',
        elements: [
            {
                'title': 'This is a generic template',
                'subtitle': 'Plus a subtitle!',
                'buttons': [
                    {
                        'type': 'postback',
                        'title': 'Postback Button',
                        'payload': 'postback_payload'
                    },
                    {
                        'type': 'web_url',
                        'title': 'URL Button',
                        'url': 'https://messenger.fb.com/'
                    }
                ]
            }
        ]
    }

    return {
        "attachment": {
            "type": "template",
            "payload": generic_template
        }
    }

}

module.exports = {
    askTemplate,
    imageTemplate,
    attachmentTemplate
}