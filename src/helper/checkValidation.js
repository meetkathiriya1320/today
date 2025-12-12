
import Validator from 'validatorjs';
import { RESPONSE } from './response.js';

const validation_schema = {
    "/auth/register": {
        schema: {
            email: 'required|email',
            password: 'required|min:8',
            role: 'required|in:admin,user,business-owner'
        }
    },
    "/auth/login": {
        schema: {
            email: 'required|email',
            password: 'required'
        }
    },
    "/auth/verify-otp": {
        schema: {
            email: 'required|email',
            otp: 'required|digits:6'
        }
    },
    "/auth/resend-otp": {
        schema: {
            email: 'required|email'
        }
    },
    "/auth/change-password": {
        schema: {
            old_password: 'required',
            new_password: 'required|min:8',
            confirm_password: 'required|same:new_password'
        }
    },
    "/categories": {
        schema: {
            name: 'required'
        }
    },
    "/home-banners": {
        schema: {
            position: 'integer',
            redirect_url: 'url'
        }
    },
    "/business/create-business": {
        schema: {
            business_name: 'required',
            phone_number: 'required',
            latitude: 'required',
            longitude: 'required',
            location: 'required',
            branch_name: 'required'
        }
    },
    "/business/create-branch": {
        schema: {
            branch_id: 'required',
            phone_number: 'required',
            latitude: 'required',
            longitude: 'required',
            location: 'required',
            contact_name: 'required'
        }
    },
    "/advertise-requests:POST": {
        schema: {
            start_date: 'required|date',
            end_date: 'required|date',
            offer_url: 'url',
            external_url: 'url'
        }
    },
    "/advertise-requests/:id/banner-status:PUT": {
        schema: {
            status: 'required|in:pending,approved,rejected,active,inactive'
        }
    },
    "/advertise-requests/:id:GET": {
        schema: {
            id: 'required|integer'
        }
    },
    "/advertise-requests/:id:DELETE": {
        schema: {
            id: 'required|integer'
        }
    },
    "/offers:POST": {
        schema: {
            category_id: 'required|integer',
            branch_id: 'required|integer',
            offer_title: 'required',
            start_date: 'required|date',
            end_date: 'date',
        }
    },
    "/offers/:id:PUT": {
        schema: {
            id: 'required|integer'
        }
    },
    "/offers/:id:GET": {
        schema: {
            id: 'required|integer'
        }
    },
    "/offers/:id/status:PUT": {
        schema: {
            id: 'required|integer',
            status: 'required|in:pending,approved,rejected'
        }
    },
    "/offers/:id:DELETE": {
        schema: {
            id: 'required|integer'
        }
    },
    "/notification/create-by-admin": {
        schema: {
            roles: 'required',
            message: 'required',
        }
    },
    "/advertise-requests/banners": {
        schema: {
            location: 'required'
        }
    },
    "/offer-report/create:POST": {
        schema: {
            note: 'required',
            offer_id: 'required',
        }
    }

}

const check_validation = async (req, res, next) => {
    const original_url = req.originalUrl;
    const url = original_url.split('/api/v1')?.[1];
    let path = url?.split('?')?.[0];
    // Normalize path by replacing numbers with :id
    path = path.replace(/\/\d+/g, '/:id');
    const key = path + ':' + req.method;
    const validate_schema_data = validation_schema[key];
    if (validate_schema_data) {
        const { body, query, params, files } = req;
        const body_data = { ...body, ...query, ...params, files };
        const { schema, message } = validate_schema_data;
        const validation = new Validator(body_data, schema, message);
        if (validation.fails()) {
            const first_attribute = Object.keys(validation.errors.all())[0];
            const error_message = validation.errors.first(first_attribute);
            const data = { is_redirect: false };

            return RESPONSE.error(res, error_message, 422, null, data);
        } else {
            return next();
        }
    }
    return next();
};

export { check_validation }