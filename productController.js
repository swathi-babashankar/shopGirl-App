import Mongoose from "mongoose";
const product = require("../model/tshirtSchema");
const formidable = require("formidable");
import fs from "fs"
import config from "../config/index.js";
import {s3DeleteFile, s3FileUpload} from "../services/imageHandler.js"

exports.createProduct = async (req, res) => {

    const form = formidable({
        multiples: true,
        keepExtensions: true
    })

    form.parse(req, async function(err, fields, files){
    
        try{

            if(err){
                throw new Error("Something Went Wrong :(")
            }

            let productId = new Mongoose.Types.ObjectId().toHexString();
            console.log(fields, files);

            if(!fields.name || !fields.brand || !fields.category || !fields.price || !fields.discount){
                throw new Error("Please fill necessary fields about the product")
            }

            let imgArrResp = Promise.all(
                // to make sure the images coming are array
                Object.keys(files).map( async (filekey, index) => {
                    const elements = files[filekey];

                    let data = fs.readFileSync(elements.filepath)

                    const imgUpload = await s3FileUpload({
                        bucketName: config.S3_BUCKET_NAME,
                        key: `product/${productId}/photos_${index + 1}.png`,
                        body: data,
                        contentType: elements.mimetype
                    })

                    return{
                        secure_url: imgUpload.Location
                    }

             })       
            );
    
            let imgArray = await imgArrResp;
            const productCreated = await product.create({
                _id: productId,
                images: imgArray,
                ...fields
            })

        res.status(202).json({
            success: true,
            message: "Product created successfully",
            productCreated
        })

        }

        catch(err){
            res.status(400).json({
                success: false,
                message: err.message
            })

        }
    } 
   
    )
    
}