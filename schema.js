const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().uri().allow("", null)
        }).optional(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().trim().min(1).required()
    }).required()
});

module.exports = { listingSchema, reviewSchema };