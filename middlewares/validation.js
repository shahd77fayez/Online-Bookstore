import joi from 'joi'
import { Types } from 'mongoose'
const dataMethods = ["body", 'params', 'query', 'headers', 'file']

const validateObjectId = (value, helper) => {
    if (Types.ObjectId.isValid(value)) {
        return true
    } else {
        return helper.message('In-valid objectId')
    }
}
export const generalFields = {

    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ['com', 'net'] }
    }),
    token:joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
    password: joi.string(),
    cPassword: joi.string(),
    id: joi.string().custom(validateObjectId),
    name: joi.string(),
    file: joi.object({
        size: joi.number().positive(),
        path: joi.string(),
        filename: joi.string(),
        destination: joi.string(),
        mimetype: joi.string(),
        encoding: joi.string(),
        originalname: joi.string(),
        fieldname: joi.string()
    })
}

export const validation = (schema) => {
    return (req, res, next) => {
        const validationErr = []
        dataMethods.forEach(key => {
            if (schema[key]) {
                const validationResult = schema[key].validate(req[key], { abortEarly: false })
                if (validationResult.error) {
                    validationErr.push(validationResult.error.details)
                }
            }
        });

        if (validationErr.length) {
            return res.json({ message: "Validation Err", validationErr})
        }
        return next()
    }
}