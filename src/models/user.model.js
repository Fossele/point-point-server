import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";


//note schema is a class
const userSchema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            lowercase: true

        }, email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
            required: true
        },
        password: {
            type: String,
            trim: true,
            minLength: 8,
            maxLength: 40,
            required: true,

        }, role: {
            type: String,
            trim: true,
            enum: ['user', 'admin'],
            default: 'user'
        }


    }, { timestamps: true }
)


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);

});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


export const User = mongoose.model('User', userSchema);