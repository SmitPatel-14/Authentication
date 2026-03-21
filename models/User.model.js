import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    role : {
        type : String,
        enum : ["user","Admin"],
        default : "user"
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    verificationToken :{
        type : String
    },
    resetpasswordToken : {
        type : String
    },
    resetpasswordExpires : {
        type : Date
    }
},{
    timestamps : true
});

UserSchema.pre("save",async function(next){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password,10)
  }
  // next();
})

const User = mongoose.model("User",UserSchema);



export default User;