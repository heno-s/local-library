const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.genre_list = asyncHandler(async (req, res, next) => {
    const allGenres = await Genre.find().sort({ name: 1 }).exec();
    res.render("genre_list", {
        title: "Genre list",
        genre_list: allGenres,
    });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }

    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre,
    });
});

exports.genre_create_get = asyncHandler(async (req, res, next) => {
    res.render("genre_form", {
        title: "Create Genre",
        genre: undefined,
        errors: undefined,
    });
});

exports.genre_create_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Create Genre",
                genre,
                errors: errors.array(),
            });

            return;
        } else {
            const genreExists = await Genre.findOne({
                name: req.body.name,
            })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (genreExists) {
                res.redirect(genreExists.url);
            } else {
                await genre.save();
                res.redirect(genre.url);
            }
        }
    }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }),
    ]);
    res.render("genre_delete", {
        title: "Delete genre",
        genre,
        books: booksInGenre,
    });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }),
    ]);

    if (booksInGenre.length > 0) {
        res.redirect("/catalog/genres");
    } else {
        await Genre.findByIdAndRemove(req.body.genreid);
        res.redirect("/catalog/genres");
    }
});

exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec();
    res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: undefined,
    });
});

exports.genre_update_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const genre = new Genre({
            name: req.body.name,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Create Genre",
                genre,
                errors: errors.array(),
            });

            return;
        } else {
            const genreExists = await Genre.findOne({
                name: req.body.name,
            })
                .collation({ locale: "en", strength: 2 })
                .exec();
            if (genreExists) {
                res.redirect(genreExists.url);
            } else {
                await Genre.findByIdAndUpdate(
                    req.params.id,
                    genre,
                    {}
                );
                res.redirect(genre.url);
            }
        }
    }),
];
