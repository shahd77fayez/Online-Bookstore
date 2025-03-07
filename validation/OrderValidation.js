import Joi from "joi";
export const orderSchema = Joi.object({
    books: Joi.array()
        .items(
            Joi.object({
                book: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
            })
        )
        .min(1)
        .required(),
});
