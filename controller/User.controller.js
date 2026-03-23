import User from "../models/User.model.js"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const registerUser = async (req,res)=>{
    //get data from user
    //verify data id it is valid or not
    //check if user already exist or not
    //if not exist then create user
    //send verification email to user
    //send response that you are succefully registered and please verify your email

    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message : "all fields are requried"
        })
    }

    try {
        const exixtinguser = await User.findOne({email});
        if(exixtinguser){
            return res.status(400).json({
                message : "user already exist"
            })
        }
        const user = await User.create({
            name,email,password
        })

        if(!user){
            return res.status(400).json({
                message : "user not register successfully"
            })
        }

        //generate verification token
        const token = (Math.floor(1000 + Math.random() * 9000)).toString();
        console.log(token);
        user.verificationToken = token;

        await user.save();

        //send mail 
            const transporter = nodemailer.createTransport({
            host: process.env.HOST_MAILTRAP,
            port: process.env.PORT_MAILTRAP,
            secure: false, // Use true for port 465, false for port 587
            auth: {
                user: process.env.USER_MAILTRAP,
                pass: process.env.PASSWORD_MAILTRAP,
            },
            });
            const mailOptins = {
                from: process.env.SENDERMAIL_MAILTRAP,
                to: user.email,
                subject: "register user",
                text: `please click on the following link : ${process.env.BASE_URL}/api/v1/users/verify/${token}`
            }
            await transporter.sendMail(mailOptins);

            res.status(200).json({
                message : "user register successfully",
                success : true
            })
    }catch(error){
        res.status(400).json({
            success : false,
            message:"user not register yet",
            error
        })

    }
    
}

const verifyUser =  async (req,res)=>{
    //get token from url
    //validate token 
    //find user based on token
    //if not return 400
    //if exists isverify = true and remove verification token
    //save user 
    //send response 

    const{token} = req.params;
    if(!token){
        return res.status(400).json({
            message : "token is required"
        })
    }
   const user  = await User.findOne({verificationToken : token});
    if(!user){
        return res.status(400).json({
            message : "invalid token"
        })
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        message : "user verified successfully",
        success : true
    })
}

const logIn = async (req,res)=>{
    //get data from user
    //validate data 
    //find user based on email
    //if not exist return 400
    //if exist then compare password
    //if password not match return 400
    //if password match then check if user is verified or not
    //if not verified return 400
    //if verified then send response with token
    const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message : "all fields are required"
            })
        }
try {
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch);

  if (!isMatch) {
    return res.status(400).json({
      message: "Password is wrong",
    });
  }

  if (!user.isVerified) {
    return res.status(400).json({
      message: "Please verify your email",
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login Successful",
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });

} catch (error) {
  console.log(error);
  res.status(400).json({
    message: "Login failed",
    error,
  });
}
}

const getMe = async (req,res)=>{
    //get user from req.user
    //send response with user data  
    try{
    console.log(req.user);
    const user = await User.findById(req.user.id).select('-password');
    console.log("reached here")

    if(!user){
        return res.status(400).json({
            success : false,
            message:"user not found"
        })
    }
    res.status(200).json({
        success : true,
        user
    })

    }catch(error){
         return res.status(400).json({
            success : false,
            message:"error in getting profile"
        })

    }
}

const logOut = async(req,res)=>{
  try {
    //for log out cleare the token store in cookies
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "you are logged out",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "failed to log out",
    });
  }
};

const forgotPassword = async(req,res)=>{
    //get data from body
    //validate 
    //find user based on email
    //generate token for reset password
    //store resettoken and token exipry in DB and save
    //send reset token to user via mail

    try{
       const {email} = req.body;
       if(!email){
        return res.status(400).json({
            success : false,
            message : "email is requried"
        })
       }
       const user = await User.findOne({email});
        if(!user){
        return res.status(400).json({
            success : false,
            message : "User not found"
        })
       }
       const token = (Math.floor(1000 + Math.random() * 9000)).toString();
       user.resetpasswordToken = token;
       user.resetpasswordExpires = Date.now() + 10 * 60 * 1000;
       await user.save() 

        const transporter = nodemailer.createTransport({
            host: process.env.HOST_MAILTRAP,
            port: process.env.PORT_MAILTRAP,
            secure: false, // Use true for port 465, false for port 587
            auth: {
                user: process.env.USER_MAILTRAP,
                pass: process.env.PASSWORD_MAILTRAP,
            },
            });
            const mailOptins = {
                from: process.env.SENDERMAIL_MAILTRAP,
                to: user.email,
                subject: "forgotPassword",
                text: `please click on the following link : ${process.env.BASE_URL}/api/v1/users/forgotPassword/${token}`
            }
            await transporter.sendMail(mailOptins);

            res.status(200).json({
                success : true,
                message : "Please check your mail "
            })
    }catch(error){
        return res.status(400).json({
            success : false,
            message : "Mail not send ",
            error
        })
    }
}

const resetPassword = async (req,res)=>{
    console.log("here")
    try{
      const{token} = req.params;
      const {password} = req.body;
      console.log(password)
      if(!password || !token){
          return res.status(400).json({
            success : false,
            message : "new password or otp is missing",
        })
      }
    const user = await User.findOne({
        resetpasswordToken : token,
        resetpasswordExpires :{$gt : Date.now()}
    })
    if(!user){
          return res.status(400).json({
            success : false,
            message : "user not found",
        })
    }
    user.password = password;
    user.resetpasswordExpires = undefined;
    user.resetpasswordToken = undefined;
    await user.save();
    return res.status(200).json({
            success : true,
            message : "password reset successfully",
        })
    }catch(error){
          return res.status(400).json({
            success : false,
            message : "error in reseting password",
            error
        })
    }
}


export {registerUser,verifyUser,logIn,getMe,logOut,forgotPassword,resetPassword} ;