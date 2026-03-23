import jwt from "jsonwebtoken"


const isLoggin = async (req, res, next) => {
    //get token from header
    //validate token 
    //if valid then call next
    //if not valid return 401 
    // console.log("Headers:", req.headers.cookie);
    // console.log("Cookies:", req.cookies); 
     try {
        console.log(req.cookies)
        let token  = req.cookies?.token //this say if there is cookie it goes in token otherwise empty string 
        console.log("token found",token?"yes":"no")
       if(!token){
        return res.status(401).json({
            message : "token is required"
        })
    } 
   
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message : "invalid token"
        })
    }   
}

export {isLoggin};