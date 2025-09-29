import {asyncHandler} from "../Utils/asyncHandlers.js"

const registerUser = asyncHandler( async(req, res) => {
    res.status(200).json({
        massage : "OK"
    })
})


export {registerUser}