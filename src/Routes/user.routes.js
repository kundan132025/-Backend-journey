import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../Controllers/user.controller.js";
import {upload} from "../Middleware/multer.middleware.js"
import { jwtvarify } from "../Middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)
router.route("/logout").post(jwtvarify ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router