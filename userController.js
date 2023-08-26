import  {user} from "../model/userSchema";
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

export const cookieProp = {
    expires: new Date(Date.now(2*24*60*60*1000)),
    httpOnly: true
}

exports.createUser = async(req, res) => {

    try{
        const {name, email, password, phoneNo} = req.body;

        if(!name || !email || !password || !phoneNo){
            throw new Error("Please enter your Name, Email, Password, PhoneNo")

        }

        // To check if user/email already exist

        const existedUser = await user.findOne({email})
        if(existedUser){
            throw new Error("User with entered Email already exist")
        }

        const encryptedpswd = bcrypt.hash(password, 13);

        const userCreated = await user.create({
            name,
            email,
            encryptedpswd,
            phoneNo
        })
        
        console.log(userCreated);

        // Creating token for every new user/D

        const token = userCreated.tokenGenerate();

        userCreated.token = token;
        userCreated.password = undefined;
        // setting up the token to cookies
        res.cookie("token", token, cookieProp)

        res.status(200).json({
            success: true,
            message: "User created successfully",
            userCreated

        })


    }

    catch(err){

        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message
        })

    }
}
// This should be a restricted route?
exports.getUser = async(req, res) => {

    try{

    const userFetched = await user.find({});
    // If we want to get particular user by email or can we ask user using a prompt msg

    const {email} = req.body;
    if(email){
        const requestedUser = await user.find({email});
        console.log(requestedUser);

        res.status(202).json({
            success: true,
            message: "Requsted user fetched successfully",
            requestedUser
        })
    }
    
    console.log(userFetched);
    

    res.status(202).json({
        success: true,
        message: "Here are list of users",
        userFetched
    })

    }

    catch(err){

        console.log(err);
        res.status(402).json({
            success: false,
            message: err.message
        })

    }

}

exports.userLogin = async(req, res) => {

    try{

        const {email, password} = req.body;
        const existingPswd = user.password;

        if(!email || !password){
            throw new Error("Please enter your Email and password")
        }

        const userLoggedin = await user.findOne({email}).select("+password");

        if(!userLoggedin){
            throw new Error("Your credentials are invalid... Please try again")
        }

        const pswdValidated = bcrypt.compare(password, existingPswd);

        if(pswdValidated === true){
            const token = userLoggedin.tokenGenerate();
            userLoggedinpassword = undefined;
            res.cookie("token", token, cookieProp)

            res.status(202).json({
                success: true,
                message: "You logged in successfully, Have a good day :)",
                userLoggedin,
                token
            })
        }

    }

    catch(err){
        res.status(402).json({
            success: false,
            message: err.message
        })
    }
}

// If user wants to change his credentials
exports.updateUser = async(req, res) => {

    try{

    const {name, email, password,newPswd, confirmPswd, phoneNo} = req.body;
    const {existingPswd} = user.password;
    const {userId} = req.params;

    if(!userId){
        throw new Error("Sorry we could not fetch your ID")
    }

    if(!email || !name || !password || !phoneNo){
        throw new Error("Please Enter your Name, Email, Password and PhoneNo");
    }

    const pswdCompared = bcrypt.compare(password, existingPswd );

    if(pswdCompared === false){

        throw new Error("Sorry your password do not match");
        
    }
    // generate new token
    // If user wants to change the password
    if(newPswd && confirmPswd){

    if(newPswd === confirmPswd){
        const pswdUpdate = await user.findByIdAndUpdate(userId, {password});
    }

    else{
        throw new Error("Value of password and confirm password field should be same")
    }
}
    
    const userUpdated = await user.findByIdAndUpdate(userId, {name, email, password, phoneNo});
    

    const regenratedToken = userUpdated.tokenGenerate();
    console.log(userUpdated);
    console.log(regenratedToken);

    userUpdated.password = undefined;

    res.cookies("token", regenratedToken, cookieProp)
    res.status(202).json({
        success: true,
        message: "User credentials updated successfully",
        userUpdated
    })

    }

    catch(err){

        res.status(401).json({
            success: false,
            message: err.message,
        })

    }

}

exports.userLogout = async(req, res) => {

try{

    res.clearCookie("token", {httpOnly: true});

    res.status(202).json({
        success: true,
        message: "User Logged Out Successfully :("

    })
}

catch(err){
    
    res.status(402).json({
        success: false,
        message: err.message
    })
}

}

exports.deleteUser = async (req, res) => {

    try{

        const {email, password} = req.body;
        const existingpswd = user.password;

        if(!email || !password){
            throw new Error("Please enter your Email and password")
        }

        const pswdCompared = bcrypt.compare(password, existingpswd);

        if(pswdCompared === true){
            const userDeleted = await user.findOneAndDelete({email})
            console.log(userDeleted);
            
            res.status(201).json({
                success: true,
                message: "User deleted successfully",
                userDeleted
            })

        }
    }

    catch(err){

        res.status(402).json({
            success: false,
            message: err.message,
        })

    }

}