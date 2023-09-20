const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find()
        .populate("book")
        .exec();

    res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: allBookInstances,
    });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec();

    if (bookInstance === null) {
        // No results.
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
    }

    res.render("bookinstance_detail", {
        title: "Book:",
        bookinstance: bookInstance,
    });
});

exports.bookinstance_create_get = asyncHandler(
    async (req, res, next) => {
        const allBooks = await Book.find({}, "title").exec();

        res.render("bookinstance_form", {
            title: "Create BookInstance",
            book_list: allBooks,
            selected_book: undefined,
            errors: undefined,
            bookinstance: undefined,
        });
    }
);

exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").exec();

            res.render("bookinstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
            return;
        } else {
            // Data from form is valid
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }),
];

// DOKONČIŤ
exports.bookinstance_delete_get = asyncHandler(
    async (req, res, next) => {
        const bookInstance = await BookInstance.findById(
            req.params.id
        )
            .populate("book")
            .exec();

        if (bookInstance === null) {
            res.redirect("/catalog/bookinstances");
        }
        res.render("bookinstance_delete", {
            title: "Delete Copy of book",
            bookinstance: bookInstance,
        });
    }
);

exports.bookinstance_delete_post = asyncHandler(
    async (req, res, next) => {
        await BookInstance.findByIdAndRemove(req.body.bookinstanceid);
        res.redirect("/catalog/bookinstances");
    }
);

exports.bookinstance_update_get = asyncHandler(
    async (req, res, next) => {
        const [bookInstance, allBooks] = await Promise.all([
            BookInstance.findById(req.params.id).exec(),
            Book.find({}, "title").exec(),
        ]);

        res.render("bookinstance_form", {
            title: "Create BookInstance",
            book_list: allBooks,
            selected_book: undefined,
            errors: undefined,
            bookinstance: bookInstance,
        });
    }
);

exports.bookinstance_update_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").exec();

            res.render("bookinstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
            return;
        } else {
            // Data from form is valid
            await BookInstance.findByIdAndUpdate(
                req.params.id,
                bookInstance,
                {}
            );
            res.redirect(bookInstance.url);
        }
    }),
];
