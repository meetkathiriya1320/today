import { get_message } from '../constant/massage.js';


const RESPONSE = {};



RESPONSE.success = async function (res, message_code = null, data = null, status_code = 200) {
    let response = {};
    response.success = true;
    response.code = message_code;
    response.message = get_message(message_code);
    if (data != null) {
        response.data = data;
    }

    return res.status(status_code).send(response);
};
RESPONSE.error = async function (res, message_code, status_code = 422, error = null, data = null) {
    let response = {};
    response.success = false;
    response.code = message_code;
    response.message = get_message(message_code);
    status_code = message_code == 9999 ? 500 : status_code;
    if (data != null) {
        response.data = data;
    }
    if (error != null) {
        console.log('error :>> ', error);
    }
    return res.status(status_code).send(response);
};
export { RESPONSE };

