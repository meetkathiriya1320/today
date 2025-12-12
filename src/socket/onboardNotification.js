import { Sequelize } from "sequelize"
import db from "../models/index.js"

// for get onboard notofication
const onboardNotification = async (data, trans, userId) => {
    try {
        const business_map = {
            "admin": "Admin",
            "user": "User",
            "business_owner": "Business Owner"
        }

        const userRole = data.role

        const title = `${data.first_name} ${data.last_name} has been onboarded as ${business_map[userRole]}`;

        return { message: title, is_read: false }

    } catch (err) {
        return err
    }
};

const sendRequestBybusiness = async () => {
    try {

    } catch (error) {

    }
}

// for get admin sent notification
const adminSentNotification = async (data, user) => {
    try {

        return data


    } catch (err) {
        return err
    }
};

export { onboardNotification, adminSentNotification, sendRequestBybusiness }