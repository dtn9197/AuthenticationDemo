var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

/**plugin will add the necessary libraries/methods required for authentication into
 * the user schema
 */
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);