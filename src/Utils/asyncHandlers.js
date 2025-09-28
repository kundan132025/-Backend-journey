// One way to create the asyncHandler util
const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>{next(err)})
    }
}

export { asyncHandler }








// anthor way

// const asyncHandler = ()=>{}
// const asyncHandler = (fn) => { () => {} }
// const asyncHandler = (fn) => asyn () => {}

// const asyncHandler =  (fn)  => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             massage : err.massage
//         })
//     }
// }